import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { formatRelativeTimeLive } from '../utils/relativeTime';
import { ChevronDown, ChevronUp, ShoppingCart, Box, XCircle, Minus } from 'lucide-react';

export type TimelineType = 'order' | 'inventory';

interface TimelineEntryProps {
  id: string;
  type: TimelineType;
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  amount?: number;
  onCancel?: (id: string) => Promise<void>;
  onConsume?: (id: string) => Promise<void>;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  id,
  type,
  title,
  subtitle,
  status,
  createdAt,
  amount,
  onCancel,
  onConsume,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await action();
    } finally {
      setActionLoading(false);
    }
  };

  const isPendingOrder = type === 'order' && status === 'PENDING';

  return (
    <div className="relative pl-6 pb-6 last:pb-0" id={`my-activity-timeline-${id}`}>
      {/* Timeline dot and line */}
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />
      <div className="absolute left-[5px] top-4 bottom-0 w-px bg-border" />

      <Card className="overflow-hidden transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-0.5">
                {type === 'order' ? (
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                ) : (
                  <Box className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      status === 'APPROVED' || status === 'ACTIVE' ? 'default' :
                      status === 'PENDING' ? 'secondary' :
                      status === 'REJECTED' || status === 'OUT_OF_STOCK' ? 'destructive' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-slate-400">{formatRelativeTimeLive(createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {amount !== undefined && (
                <span className="text-sm font-semibold">${amount.toFixed(2)}</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setExpanded(!expanded)}
                id={`my-activity-expand-${id}`}
                aria-expanded={expanded}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Expandable actions */}
          <div
            className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40 mt-3 pt-3 border-t' : 'max-h-0'}`}
          >
            <div className="flex gap-2">
              {isPendingOrder && onCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => onCancel!(id))}
                  id={`my-activity-button-cancel-${id}`}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Order
                </Button>
              )}
              {type === 'inventory' && onConsume && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => onConsume!(id))}
                  id={`my-activity-button-consume-${id}`}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Consume
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
