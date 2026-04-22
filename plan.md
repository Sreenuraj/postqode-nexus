# Implementation Plan: Product Request Wizard Page

## Overview

A new **Product Request Wizard** page for standard users that allows them to submit detailed product requests when items are out of stock or not in the catalog. This page will feature multi-step progressive disclosure, dynamic form fields, conditional validation, and asynchronous behavior that mimics real-world enterprise applications.

## Page Purpose

- **User Role**: Standard User (non-admin)
- **Business Context**: When users can't find what they need in the catalog, they can submit a detailed request for admins to review
- **Navigation**: Accessible from Product Catalog page via "Request New Product" button
- **Route**: `/product-request`

## Why This Fits Naturally

1. **Extends existing workflow**: Users browse catalog → can't find item → request it
2. **Complements order system**: Similar to placing orders, but for items not yet in catalog
3. **Admin review pattern**: Follows same approval pattern as Order Management
4. **Inventory integration**: Approved requests could eventually become catalog items
5. **User empowerment**: Gives non-admin users a voice in inventory decisions

## Dynamic UI Behaviors

### 1. Multi-Step Progressive Disclosure

**Steps:**
- Step 1: Request Type Selection (determines subsequent fields)
- Step 2: Product Details (fields vary based type)
- Step 3: Justification & Priority
- Step 4: Review & Submit

**Dynamic Behavior:**
- Steps appear/disappear based on selections
- Progress indicator updates
- "Next" button disabled until current step valid
- Can't skip steps, but can go back

### 2. Chained Dependencies (A → B → C)

**Chain 1: Request Type → Category → Subcategory**
```
Request Type Selection
    ↓
If "Similar to Existing" → Load existing categories
    ↓
Category Selection → Fetch subcategories (async)
    ↓
Subcategory Selection → Show related products
```

**Chain 2: Budget Range → Approval Level → Required Fields**
```
Budget Range Selection
    ↓
< $100 → Standard approval (fewer fields)
$100-$500 → Manager approval (more fields)
> $500 → Executive approval (full justification required)
    ↓
Required fields dynamically appear/disappear
```

**Chain 3: Urgency → Delivery Date → Vendor Options**
```
Urgency Level
    ↓
"Urgent" → Delivery date required + expedited vendors shown
"Standard" → Delivery date optional + all vendors shown
"Low Priority" → Delivery date hidden + budget vendors only
```

### 3. Asynchronous Behavior with Delays

**Simulated API Calls:**
- **Category fetch**: 300-800ms delay (varies)
- **Subcategory fetch**: 400-1200ms delay (varies)
- **Similar products search**: 600-1500ms delay (varies)
- **Vendor availability check**: 500-1000ms delay (varies)
- **Budget validation**: 200-600ms delay (varies)

**Loading States:**
- **Full-page overlay**: Appears after each significant action (button click, selection change)
- **Overlay behavior**: Shows loading spinner, blocks all interaction
- **Overlay dismissal**: Only disappears when next element/content is fully loaded
- **Progressive delays**: Each action → overlay → delay → content load → overlay dismiss
- Skeleton loaders for dropdowns
- Spinner overlays for sections
- Disabled states during fetches
- Progressive content reveal (not all at once)

**Action-Overlay Pattern:**
```
User Action (click/select)
    ↓
Full-page overlay appears immediately
    ↓
Simulated API delay (300-1500ms variable)
    ↓
Content/element loads
    ↓
Overlay fades out
    ↓
Next interaction enabled
```

### 4. Unstable Identifiers

**Dynamic ID Generation:**
- Element IDs include timestamps: `request-field-${Date.now()}`
- Class names change based on state: `form-section-${step}-${validationState}`
- Data attributes rotate: `data-field-id="${Math.random()}"`
- Form field names include session tokens

**Re-render Triggers:**
- Changing request type re-mounts entire form section
- Validation errors cause field re-creation
- Step navigation replaces DOM nodes instead of hiding/showing

### 5. Conditional Rendering & State-Driven UI

**Visibility Rules:**
- "Quantity Needed" field: Only if request type is "Bulk Order"
- "Alternative Products" section: Only if similar items found (async check)
- "Vendor Preferences" section: Only if budget > $100
- "Approval Preview" panel: Only appears after all required fields filled
- "Estimated Timeline" badge: Appears 2-3 seconds after urgency selection

**Intermediate States:**
- Fields temporarily disabled while dependencies load
- "Checking availability..." message appears/disappears
- Validation messages appear with delay (not immediate)
- Success indicators fade in after async validation

### 6. Non-Deterministic Behavior

**Variable Timing:**
- API response times vary by ±40%
- Validation debounce: 300-800ms (random)
- Auto-save triggers: Every 5-15 seconds (random interval)
- "Suggested products" appear after 1-4 seconds

**Conditional Rendering:**
- "Similar requests" panel: 60% chance to appear
- "Vendor recommendations": Only if 3+ vendors available (async check)
- "Budget warning": Appears if estimated cost > user's typical order value (requires calculation)

### 7. Nested DOM & Partial Updates

**Complex Structure:**
```
<div class="wizard-container-${sessionId}">
  <div class="step-wrapper-${currentStep}">
    <div class="field-group-${groupId}">
      <div class="input-container-${fieldId}">
        <input id="dynamic-${timestamp}-${fieldName}" />
      </div>
    </div>
  </div>
</div>
```

**Partial Re-renders:**
- Changing budget range re-renders only approval section
- Selecting category replaces subcategory dropdown entirely
- Validation errors inject new DOM nodes inline
- Auto-save updates timestamp without full re-render

### 8. Debounced & Throttled Interactions

**Debounced:**
- Product name search: 500ms debounce
- Budget input validation: 800ms debounce
- Justification text analysis: 1000ms debounce

**Throttled:**
- Auto-save: Max once per 10 seconds
- Similar products fetch: Max once per 5 seconds
- Vendor availability check: Max once per 3 seconds

## Technical Implementation

### Component Structure

```
ProductRequestWizardPage.tsx
├── WizardProgress (step indicator)
├── Step1RequestType
│   ├── RequestTypeSelector (radio cards)
│   └── CategoryLoader (async)
├── Step2ProductDetails
│   ├── DynamicFieldGroup (conditional fields)
│   ├── SubcategorySelector (depends on category)
│   └── SimilarProductsPanel (async, conditional)
├── Step3Justification
│   ├── BudgetRangeSelector (triggers approval level)
│   ├── UrgencySelector (triggers delivery fields)
│   ├── JustificationTextarea (debounced validation)
│   └── ApprovalPreviewPanel (conditional)
└── Step4Review
    ├── RequestSummary
    ├── EditableFields (inline editing)
    └── SubmitButton (async with loading)
```

### State Management

```typescript
interface RequestState {
  currentStep: number;
  requestType: 'new' | 'similar' | 'bulk' | null;
  category: string | null;
  subcategory: string | null;
  productDetails: {
    name: string;
    description: string;
    quantity?: number;
    estimatedPrice?: number;
  };
  justification: {
    reason: string;
    urgency: 'low' | 'standard' | 'urgent' | null;
    budgetRange: string | null;
    deliveryDate?: string;
  };
  metadata: {
    sessionId: string;
    lastSaved: Date | null;
    validationState: Record<string, boolean>;
    loadingStates: Record<string, boolean>;
  };
}
```

### API Endpoints (Simulated)

```typescript
// Simulated with setTimeout and random delays
- GET /api/v1/product-requests/categories
- GET /api/v1/product-requests/subcategories/:categoryId
- GET /api/v1/product-requests/similar-products?name=...
- GET /api/v1/product-requests/vendors?budget=...
- POST /api/v1/product-requests/validate
- POST /api/v1/product-requests/submit
- POST /api/v1/product-requests/auto-save
```

### Styling Patterns

- Follows existing shadcn/ui components
- Uses Tailwind classes matching other pages
- Card-based layout similar to CommandCenterPage
- Form styling consistent with ProductFormDialog
- Loading states match existing Skeleton components

## Integration Points

### Navigation
- Add "Request Product" button to ProductCatalogPage (for users)
- Add to Layout navigation menu under "My Orders"
- Route: `/product-request`

### Backend (Mock)
- Create mock API responses in `services/api.ts`
- Simulate delays with `setTimeout`
- Return realistic data structures

### State
- Use React useState for local state
- No global state needed (self-contained)
- Auto-save to localStorage as backup

## User Flow

1. User clicks "Request New Product" from catalog
2. **Step 1**: Selects request type (new/similar/bulk)
   - If "similar": Categories load (async, 500ms)
   - If "new": Skip to product details
   - If "bulk": Show quantity field immediately
3. **Step 2**: Fills product details
   - Name field triggers similar products search (debounced, 1s)
   - Category selection loads subcategories (async, 800ms)
   - Fields appear/disappear based on request type
4. **Step 3**: Provides justification
   - Budget range selection determines approval level
   - Urgency selection shows/hides delivery date
   - Justification text validates length (debounced, 800ms)
   - Approval preview panel appears when all required fields filled
5. **Step 4**: Reviews and submits
   - Summary shows all entered data
   - Can edit inline (re-opens relevant step)
   - Submit button triggers async submission (2-3s)
   - Success: Redirect to "My Requests" page (new page showing submitted requests)
   - Error: Show error message, allow retry

## Testing Challenges (By Design)

This page will be challenging to automate because:

1. **Dynamic IDs**: Element identifiers change on every render
2. **Variable timing**: No consistent wait times
3. **Conditional elements**: Can't assume elements exist
4. **Chained dependencies**: Must wait for A before B before C
5. **Partial re-renders**: DOM nodes replaced, not just hidden
6. **Debounced inputs**: Typing too fast causes issues
7. **Non-deterministic**: Some elements appear randomly
8. **Nested structure**: Deep DOM trees with dynamic classes

## Success Criteria

- [ ] Page integrates seamlessly with existing UI/UX
- [ ] All dynamic behaviors implemented
- [ ] Realistic delays and loading states
- [ ] Unstable selectors throughout
- [ ] Chained dependencies working
- [ ] Non-deterministic elements present
- [ ] Follows existing code patterns
- [ ] No indication this is for testing

## Files to Create/Modify

### New Files
1. `frontend/src/pages/ProductRequestWizardPage.tsx` - Main page component
2. `frontend/src/components/RequestTypeSelector.tsx` - Step 1 component
3. `frontend/src/components/DynamicProductFields.tsx` - Step 2 component
4. `frontend/src/components/RequestJustification.tsx` - Step 3 component
5. `frontend/src/components/RequestReview.tsx` - Step 4 component
6. `reference.md` - Documentation of dynamic behaviors (gitignored)

### Modified Files
1. `frontend/src/App.tsx` - Add route
2. `frontend/src/components/Layout.tsx` - Add navigation item
3. `frontend/src/services/api.ts` - Add mock API functions
4. `frontend/.gitignore` - Add reference.md

## Estimated Complexity

- **Lines of Code**: ~800-1000 lines
- **Components**: 6 new components
- **State Variables**: ~15-20
- **Async Operations**: 8-10
- **Conditional Renders**: 20+
- **Dynamic IDs**: All interactive elements

## Additional Deliverables

### Reference Documentation
- Create `reference.md` (gitignored) - Similar to `DYNAMIC_UI_REFERENCE.md`
- Document all dynamic behaviors, selectors, timing, and flakiness risks
- Map to automation rules from `.postqoderules/dynamic-ui-automation.md`

### Functional Test Cases
- Create `docs/functional-tests-product-request.md`
- End-to-end test scenarios covering all wizard steps
- Include prerequisites, expected results, and cross-page verification

### Testing with Chrome DevTools
- Use browser automation to verify functionality
- Test all dynamic behaviors and state transitions
- Verify timing, loading states, and conditional rendering

## Next Steps

1. ✅ Get approval for this plan
2. Implement mock API functions
3. Build wizard components step by step
4. Add navigation integration
5. Create reference.md documentation (gitignored)
6. Create functional test cases document
7. Test with Chrome DevTools to verify all behaviors
8. Verify it feels natural within the application
