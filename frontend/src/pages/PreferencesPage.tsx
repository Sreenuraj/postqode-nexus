import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { preferencesApi } from '@/services/api';

type ProfileType = 'personal' | 'work' | 'notifications' | 'localization';

interface FieldMetadata {
  fieldId: string;
  logicalKey: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  defaultValue?: string;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: { fieldLogicalKey: string; equals: string[] };
}

interface FormMetadata {
  formId: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  fields: FieldMetadata[];
  generatedAt: string;
  latencyHintMs: number;
}

const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const PreferencesPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType>('personal');
  const [metadata, setMetadata] = useState<FormMetadata | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadMetadata(profile);
  }, [profile]);

  const loadMetadata = async (p: ProfileType) => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const md = await preferencesApi.getMetadata(p);
      
      const elapsed = Date.now() - startTime;
      const minDelay = 100;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      setMetadata(md);
      
      const seeded: Record<string, any> = {};
      md.fields.forEach((f: FieldMetadata) => {
        seeded[f.logicalKey] = f.defaultValue ?? '';
      });
      setValues(prev => ({ ...seeded, ...prev }));
    } catch (error) {
      console.error('Failed to load metadata:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const onFieldChange = (logicalKey: string, newVal: any) => {
    setValues(v => ({ ...v, [logicalKey]: newVal }));
    
    if (metadata?.fields.some(f => f.dependsOn?.fieldLogicalKey === logicalKey)) {
      const delay = 200 + Math.random() * 400;
      setTimeout(() => loadMetadata(profile), delay);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metadata) return;
    
    setSubmitting(true);
    try {
      const startTime = Date.now();
      await preferencesApi.submit({
        profile,
        formId: metadata.formId,
        values
      });
      
      const elapsed = Date.now() - startTime;
      const minDelay = 800;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      setLastSaved(new Date());
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowField = (field: FieldMetadata): boolean => {
    if (!field.dependsOn) return true;
    
    const controlValue = values[field.dependsOn.fieldLogicalKey];
    return field.dependsOn.equals.includes(controlValue);
  };

  const renderField = (field: FieldMetadata) => {
    if (!shouldShowField(field)) return null;

    const commonProps = {
      id: field.fieldId,
      required: field.required,
      disabled: loading || submitting,
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={values[field.logicalKey] || ''}
            onChange={(e) => onFieldChange(field.logicalKey, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={values[field.logicalKey] || ''}
            onChange={(e) => onFieldChange(field.logicalKey, e.target.value)}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select
            value={values[field.logicalKey] || field.defaultValue || ''}
            onValueChange={(val) => onFieldChange(field.logicalKey, val)}
            disabled={loading || submitting}
          >
            <SelectTrigger id={field.fieldId}>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {metadata?.title || 'Preferences'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {metadata?.subtitle || 'Update your preferences'}
        </p>
      </div>

      <Card className="p-6 relative">
        {loading && <LoadingOverlay />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="profile-selector">Preference Profile</Label>
            <Select
              value={profile}
              onValueChange={(val) => setProfile(val as ProfileType)}
              disabled={loading || submitting}
            >
              <SelectTrigger id="profile-selector" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="notifications">Notifications</SelectItem>
                <SelectItem value="localization">Localization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {metadata && (
            <>
              <div className="border-t pt-6 space-y-4">
                {metadata.fields.map((field) => (
                  <div key={field.fieldId}>
                    {shouldShowField(field) && (
                      <div>
                        <Label htmlFor={field.fieldId}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <div className="mt-1.5">
                          {renderField(field)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {lastSaved && `Last updated: ${lastSaved.toLocaleTimeString()}`}
                </div>
                <Button type="submit" disabled={loading || submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {metadata.submitLabel}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
};
