import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuickQtyStepperProps {
  productId: string;
  initialValue: number;
  onSave: (id: string, quantity: number) => Promise<void>;
}

export const QuickQtyStepper: React.FC<QuickQtyStepperProps> = ({
  productId,
  initialValue,
  onSave,
}) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const triggerSave = (newValue: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await onSave(productId, newValue);
        toast.success('Quantity updated');
      } catch (error) {
        toast.error('Failed to update quantity');
        setValue(initialValue); // rollback
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  const decrement = () => {
    const newValue = Math.max(0, value - 1);
    setValue(newValue);
    triggerSave(newValue);
  };

  const increment = () => {
    const newValue = value + 1;
    setValue(newValue);
    triggerSave(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    const newValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setValue(newValue);
    triggerSave(newValue);
  };

  return (
    <div className="flex items-center gap-1" id={`command-center-stepper-${productId}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={decrement}
        disabled={saving}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="relative">
        <Input
          type="number"
          min={0}
          value={value}
          onChange={handleInputChange}
          className="h-8 w-16 text-center px-1"
          disabled={saving}
          aria-label="Quantity"
        />
        {saving && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 rounded-md">
            <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={increment}
        disabled={saving}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
