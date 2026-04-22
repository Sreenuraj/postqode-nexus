import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { productRequestApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Package,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

// Full-page loading overlay component
const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-slate-950 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium">{message || 'Loading...'}</p>
    </div>
  </div>
);

interface RequestState {
  currentStep: number;
  requestType: 'new' | 'similar' | 'bulk' | null;
  category: string | null;
  subcategory: string | null;
  productDetails: {
    name: string;
    description: string;
    quantity: number;
    estimatedPrice: number;
  };
  justification: {
    reason: string;
    urgency: 'low' | 'standard' | 'urgent' | null;
    budgetRange: string | null;
    deliveryDate: string;
  };
  metadata: {
    sessionId: string;
    lastSaved: Date | null;
    validationState: Record<string, boolean>;
  };
}

export const ProductRequestWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [showApprovalPreview, setShowApprovalPreview] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [approvalLevel, setApprovalLevel] = useState<'standard' | 'manager' | 'executive'>('standard');
  
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<RequestState>({
    currentStep: 1,
    requestType: null,
    category: null,
    subcategory: null,
    productDetails: {
      name: '',
      description: '',
      quantity: 1,
      estimatedPrice: 0,
    },
    justification: {
      reason: '',
      urgency: null,
      budgetRange: null,
      deliveryDate: '',
    },
    metadata: {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastSaved: null,
      validationState: {},
    },
  });

  // Auto-save functionality with random intervals
  useEffect(() => {
    const scheduleAutoSave = () => {
      const interval = 5000 + Math.random() * 10000; // 5-15 seconds
      autoSaveRef.current = setTimeout(async () => {
        if (state.productDetails.name || state.justification.reason) {
          try {
            const result = await productRequestApi.autoSave(state);
            setState(prev => ({
              ...prev,
              metadata: { ...prev.metadata, lastSaved: result.timestamp },
            }));
          } catch (error) {
            // Silent fail for auto-save
          }
        }
        scheduleAutoSave();
      }, interval);
    };

    scheduleAutoSave();

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [state]);

  // Handle request type selection with overlay
  const handleRequestTypeSelect = async (type: 'new' | 'similar' | 'bulk') => {
    setLoading(true);
    setLoadingMessage('Processing selection...');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

    setState(prev => ({ ...prev, requestType: type, category: null, subcategory: null }));

    if (type === 'similar') {
      setLoadingMessage('Loading categories...');
      try {
        const cats = await productRequestApi.getCategories();
        setCategories(cats);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    }

    setLoading(false);
  };

  // Handle category selection with overlay
  const handleCategorySelect = async (categoryId: string) => {
    setLoading(true);
    setLoadingMessage('Loading subcategories...');

    setState(prev => ({ ...prev, category: categoryId, subcategory: null }));
    setSubcategories([]);

    try {
      const subs = await productRequestApi.getSubcategories(categoryId);
      setSubcategories(subs);
    } catch (error) {
      toast.error('Failed to load subcategories');
    }

    setLoading(false);
  };

  // Handle subcategory selection with overlay
  const handleSubcategorySelect = async (subcategoryId: string) => {
    setLoading(true);
    setLoadingMessage('Checking for related products...');

    setState(prev => ({ ...prev, subcategory: subcategoryId }));

    // Simulate checking for related products
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

    setLoading(false);
  };

  // Debounced product name search
  const handleProductNameChange = (name: string) => {
    setState(prev => ({
      ...prev,
      productDetails: { ...prev.productDetails, name },
    }));

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (name.length >= 3) {
      searchDebounceRef.current = setTimeout(async () => {
        setLoading(true);
        setLoadingMessage('Searching for similar products...');

        try {
          const products = await productRequestApi.searchSimilarProducts(name);
          setSimilarProducts(products);
          setShowSimilarProducts(products.length > 0);
        } catch (error) {
          setSimilarProducts([]);
          setShowSimilarProducts(false);
        }

        setLoading(false);
      }, 500 + Math.random() * 300);
    } else {
      setShowSimilarProducts(false);
      setSimilarProducts([]);
    }
  };

  // Handle budget range selection with overlay
  const handleBudgetRangeSelect = async (range: string) => {
    setLoading(true);
    setLoadingMessage('Determining approval requirements...');

    setState(prev => ({
      ...prev,
      justification: { ...prev.justification, budgetRange: range },
    }));

    // Determine approval level
    let level: 'standard' | 'manager' | 'executive' = 'standard';
    if (range === '100-500') level = 'manager';
    else if (range === 'over-500') level = 'executive';

    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

    setApprovalLevel(level);

    // Fetch vendors if budget > $100
    if (range !== 'under-100') {
      setLoadingMessage('Loading vendor options...');
      try {
        const vendorList = await productRequestApi.getVendors(range);
        setVendors(vendorList);
        setShowVendors(vendorList.length >= 3);
      } catch (error) {
        setVendors([]);
        setShowVendors(false);
      }
    } else {
      setVendors([]);
      setShowVendors(false);
    }

    setLoading(false);
  };

  // Handle urgency selection with overlay
  const handleUrgencySelect = async (urgency: 'low' | 'standard' | 'urgent') => {
    setLoading(true);
    setLoadingMessage('Calculating timeline...');

    setState(prev => ({
      ...prev,
      justification: { ...prev.justification, urgency },
    }));

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

    // Show timeline after delay
    setTimeout(() => {
      setShowTimeline(true);
    }, 2000 + Math.random() * 1000);

    setLoading(false);
  };

  // Check if current step is valid
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return state.requestType !== null;
      case 2:
        if (state.requestType === 'similar') {
          return !!(state.category && state.subcategory && state.productDetails.name);
        }
        return !!state.productDetails.name;
      case 3:
        return !!(
          state.justification.reason &&
          state.justification.urgency &&
          state.justification.budgetRange &&
          (state.justification.urgency !== 'urgent' || state.justification.deliveryDate)
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Handle step navigation with overlay
  const handleNext = async () => {
    if (!isStepValid(state.currentStep)) return;

    setLoading(true);
    setLoadingMessage('Preparing next step...');

    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));

    // Check if we should show approval preview
    if (state.currentStep === 3 && isStepValid(3)) {
      setTimeout(() => {
        setShowApprovalPreview(true);
      }, 1500 + Math.random() * 1000);
    }

    setLoading(false);
  };

  const handleBack = async () => {
    setLoading(true);
    setLoadingMessage('Going back...');

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    setLoading(false);
  };

  // Handle form submission with overlay
  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMessage('Submitting your request...');

    try {
      const result = await productRequestApi.submitRequest(state);
      setLoadingMessage('Request submitted successfully!');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Request ${result.id} submitted successfully!`);
      navigate('/my-orders');
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || 'Failed to submit request');
    }
  };

  // Generate dynamic IDs — regenerated per step so each step mount gets fresh
  // unstable identifiers (preserving the automation-challenge requirement) WITHOUT
  // causing inputs to remount on every keystroke.
  const dynamicIds = useMemo(() => {
    const gen = (base: string) =>
      `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      'request-type-new': gen('request-type-new'),
      'request-type-similar': gen('request-type-similar'),
      'request-type-bulk': gen('request-type-bulk'),
      category: gen('category'),
      subcategory: gen('subcategory'),
      'product-name': gen('product-name'),
      description: gen('description'),
      quantity: gen('quantity'),
      'estimated-price': gen('estimated-price'),
      'budget-range': gen('budget-range'),
      urgency: gen('urgency'),
      'delivery-date': gen('delivery-date'),
      reason: gen('reason'),
    };
    // Regenerate on step change so IDs still rotate (keeps the "unstable identifiers"
    // testing challenge intact for element locators), but they stay stable across
    // keystrokes within a step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentStep]);

  const getDynamicId = (base: string): string => {
    return (dynamicIds as Record<string, string>)[base] ?? base;
  };

  const getFieldGroupClass = () => {
    return `field-group-${state.currentStep}-${isStepValid(state.currentStep) ? 'valid' : 'invalid'}`;
  };

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay message={loadingMessage} />}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request New Product</h1>
        <p className="text-slate-500 mt-1">
          Submit a request for products not currently in our catalog
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                state.currentStep === step
                  ? 'border-primary bg-primary text-white'
                  : state.currentStep > step
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-slate-300 bg-white text-slate-400'
              }`}
            >
              {state.currentStep > step ? <Check className="h-5 w-5" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`w-24 h-1 mx-2 ${
                  state.currentStep > step ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Container with dynamic class */}
      <div className={`wizard-container-${state.metadata.sessionId}`}>
        <Card className="p-6 max-w-3xl mx-auto">
          <div className={`step-wrapper-${state.currentStep}`}>
            {/* Step 1: Request Type */}
            {state.currentStep === 1 && (
              <div className={getFieldGroupClass()} key={`step-1-${state.metadata.sessionId}`}>
                <h2 className="text-xl font-semibold mb-4">Select Request Type</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { value: 'new', label: 'New Product', desc: 'Request a completely new product', icon: Package },
                    { value: 'similar', label: 'Similar to Existing', desc: 'Request a product similar to catalog items', icon: FileText },
                    { value: 'bulk', label: 'Bulk Order', desc: 'Request large quantity of items', icon: AlertCircle },
                  ].map((type) => (
                    <Card
                      key={type.value}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        state.requestType === type.value ? 'border-primary border-2' : ''
                      }`}
                      onClick={() => handleRequestTypeSelect(type.value as any)}
                      id={getDynamicId(`request-type-${type.value}`)}
                    >
                      <type.icon className="h-8 w-8 mb-2 text-primary" />
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-sm text-slate-500 mt-1">{type.desc}</p>
                    </Card>
                  ))}
                </div>

                {/* Category selection for "similar" type */}
                {state.requestType === 'similar' && categories.length > 0 && (
                  <div className="mt-6 space-y-4 animate-in slide-in-from-bottom">
                    <div>
                      <Label htmlFor={getDynamicId('category')}>Category</Label>
                      <Select value={state.category || ''} onValueChange={handleCategorySelect}>
                        <SelectTrigger id={getDynamicId('category')}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {state.category && subcategories.length > 0 && (
                      <div className="animate-in slide-in-from-bottom">
                        <Label htmlFor={getDynamicId('subcategory')}>Subcategory</Label>
                        <Select value={state.subcategory || ''} onValueChange={handleSubcategorySelect}>
                          <SelectTrigger id={getDynamicId('subcategory')}>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Product Details */}
            {state.currentStep === 2 && (
              <div className={getFieldGroupClass()} key={`step-2-${state.metadata.sessionId}`}>
                <h2 className="text-xl font-semibold mb-4">Product Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={getDynamicId('product-name')}>Product Name *</Label>
                    <Input
                      id={getDynamicId('product-name')}
                      value={state.productDetails.name}
                      onChange={(e) => handleProductNameChange(e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>

                  {showSimilarProducts && similarProducts.length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg animate-in slide-in-from-top">
                      <p className="text-sm font-medium mb-2">Similar products found:</p>
                      <div className="space-y-2">
                        {similarProducts.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center justify-between text-sm">
                            <span>{product.name}</span>
                            <Badge variant={product.inStock ? 'default' : 'secondary'}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor={getDynamicId('description')}>Description</Label>
                    <Textarea
                      id={getDynamicId('description')}
                      value={state.productDetails.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setState(prev => ({
                          ...prev,
                          productDetails: { ...prev.productDetails, description: e.target.value },
                        }))
                      }
                      placeholder="Describe the product..."
                      rows={4}
                    />
                  </div>

                  {state.requestType === 'bulk' && (
                    <div className="animate-in slide-in-from-bottom">
                      <Label htmlFor={getDynamicId('quantity')}>Quantity Needed *</Label>
                      <Input
                        id={getDynamicId('quantity')}
                        type="number"
                        min="1"
                        value={state.productDetails.quantity}
                        onChange={(e) =>
                          setState(prev => ({
                            ...prev,
                            productDetails: { ...prev.productDetails, quantity: parseInt(e.target.value) || 1 },
                          }))
                        }
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor={getDynamicId('estimated-price')}>Estimated Price ($)</Label>
                    <Input
                      id={getDynamicId('estimated-price')}
                      type="number"
                      min="0"
                      step="0.01"
                      value={state.productDetails.estimatedPrice}
                      onChange={(e) =>
                        setState(prev => ({
                          ...prev,
                          productDetails: { ...prev.productDetails, estimatedPrice: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Justification */}
            {state.currentStep === 3 && (
              <div className={getFieldGroupClass()} key={`step-3-${state.metadata.sessionId}`}>
                <h2 className="text-xl font-semibold mb-4">Justification & Priority</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={getDynamicId('budget-range')}>Budget Range *</Label>
                    <Select
                      value={state.justification.budgetRange || ''}
                      onValueChange={handleBudgetRangeSelect}
                    >
                      <SelectTrigger id={getDynamicId('budget-range')}>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-100">Under $100</SelectItem>
                        <SelectItem value="100-500">$100 - $500</SelectItem>
                        <SelectItem value="over-500">Over $500</SelectItem>
                      </SelectContent>
                    </Select>
                    {state.justification.budgetRange && (
                      <p className="text-sm text-slate-500 mt-2">
                        Approval Level: <Badge>{approvalLevel}</Badge>
                      </p>
                    )}
                  </div>

                  {showVendors && vendors.length > 0 && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg animate-in slide-in-from-top">
                      <p className="text-sm font-medium mb-2">Recommended Vendors:</p>
                      <div className="space-y-2">
                        {vendors.slice(0, 3).map((vendor) => (
                          <div key={vendor.id} className="flex items-center justify-between text-sm">
                            <span>{vendor.name}</span>
                            <span className="text-xs text-slate-500">★ {vendor.rating}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor={getDynamicId('urgency')}>Urgency *</Label>
                    <Select
                      value={state.justification.urgency || ''}
                      onValueChange={handleUrgencySelect}
                    >
                      <SelectTrigger id={getDynamicId('urgency')}>
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showTimeline && state.justification.urgency && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center gap-2 animate-in fade-in">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        Estimated Timeline:{' '}
                        {state.justification.urgency === 'urgent'
                          ? '1-2 days'
                          : state.justification.urgency === 'standard'
                          ? '3-5 days'
                          : '1-2 weeks'}
                      </span>
                    </div>
                  )}

                  {state.justification.urgency === 'urgent' && (
                    <div className="animate-in slide-in-from-bottom">
                      <Label htmlFor={getDynamicId('delivery-date')}>Required Delivery Date *</Label>
                      <Input
                        id={getDynamicId('delivery-date')}
                        type="date"
                        value={state.justification.deliveryDate}
                        onChange={(e) =>
                          setState(prev => ({
                            ...prev,
                            justification: { ...prev.justification, deliveryDate: e.target.value },
                          }))
                        }
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor={getDynamicId('reason')}>Justification *</Label>
                    <Textarea
                      id={getDynamicId('reason')}
                      value={state.justification.reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setState(prev => ({
                          ...prev,
                          justification: { ...prev.justification, reason: e.target.value },
                        }))
                      }
                      placeholder="Explain why this product is needed..."
                      rows={4}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {state.justification.reason.length} / 500 characters
                    </p>
                  </div>

                  {showApprovalPreview && isStepValid(3) && (
                    <div className="p-4 border-2 border-green-500 rounded-lg animate-in slide-in-from-bottom">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="font-semibold">Ready for Review</p>
                      </div>
                      <p className="text-sm text-slate-600">
                        Your request will be sent to {approvalLevel} approval.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {state.currentStep === 4 && (
              <div className={getFieldGroupClass()} key={`step-4-${state.metadata.sessionId}`}>
                <h2 className="text-xl font-semibold mb-4">Review Your Request</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <h3 className="font-semibold mb-2">Request Type</h3>
                    <p className="text-sm capitalize">{state.requestType}</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <h3 className="font-semibold mb-2">Product Details</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Name:</dt>
                        <dd className="font-medium">{state.productDetails.name}</dd>
                      </div>
                      {state.productDetails.description && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Description:</dt>
                          <dd className="font-medium">{state.productDetails.description}</dd>
                        </div>
                      )}
                      {state.requestType === 'bulk' && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Quantity:</dt>
                          <dd className="font-medium">{state.productDetails.quantity}</dd>
                        </div>
                      )}
                      {state.productDetails.estimatedPrice > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Estimated Price:</dt>
                          <dd className="font-medium">${state.productDetails.estimatedPrice.toFixed(2)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <h3 className="font-semibold mb-2">Justification</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Budget Range:</dt>
                        <dd className="font-medium capitalize">{state.justification.budgetRange?.replace('-', ' - $')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Urgency:</dt>
                        <dd className="font-medium capitalize">{state.justification.urgency}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Approval Level:</dt>
                        <dd><Badge>{approvalLevel}</Badge></dd>
                      </div>
                      <div className="mt-2">
                        <dt className="text-slate-500 mb-1">Reason:</dt>
                        <dd className="text-sm">{state.justification.reason}</dd>
                      </div>
                    </dl>
                  </div>

                  {state.metadata.lastSaved && (
                    <p className="text-xs text-slate-500 text-center">
                      Last auto-saved: {state.metadata.lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={state.currentStep === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {state.currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(state.currentStep) || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                Submit Request
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
