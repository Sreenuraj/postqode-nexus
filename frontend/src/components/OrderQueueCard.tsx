import React, { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, XCircle, User, Package, Clock } from 'lucide-react';
import { formatRelativeTimeLive } from '../utils/relativeTime';

interface OrderQueueItem {
  id: string;
  requesterName: string;
  productName: string;
  quantity: number;
  createdAt: string;
  status: string;
}

interface OrderQueueCardProps {
  order: OrderQueueItem;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const OrderQueueCard: React.FC<OrderQueueCardProps> = ({
  order,
  selected,
  onSelect,
  onApprove,
  onReject,
}) => {
  const [actionState, setActionState] = useState<'idle' | 'approving' | 'rejecting'>('idle');

  const handleApprove = async () => {
    if (actionState !== 'idle') return;
    setActionState('approving');
    try {
      await onApprove(order.id);
    } finally {
      setActionState('idle');
    }
  };

  const handleReject = async () => {
    if (actionState !== 'idle') return;
    setActionState('rejecting');
    try {
      await onReject(order.id);
    } finally {
      setActionState('idle');
    }
  };

  return (
    <div
      className="relative p-4 rounded-lg border bg-white dark:bg-slate-950 space-y-3 transition-all"
      id={`command-center-card-${order.id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`command-center-checkbox-${order.id}`}
          checked={selected}
          onCheckedChange={(checked) => onSelect(checked as boolean)}
          aria-label={`Select order ${order.id}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm font-medium truncate">{order.requesterName}</span>
            <Badge variant="outline" className="text-xs ml-auto shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              {formatRelativeTimeLive(order.createdAt)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Package className="h-3.5 w-3.5" />
            <span className="truncate">{order.productName}</span>
            <span className="text-slate-400 shrink-0">× {order.quantity}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          id={`command-center-button-approve-${order.id}`}
          size="sm"
          variant="default"
          className="flex-1"
          disabled={actionState !== 'idle'}
          aria-busy={actionState === 'approving'}
          onClick={handleApprove}
        >
          {actionState === 'approving' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          Approve
        </Button>
        <Button
          id={`command-center-button-reject-${order.id}`}
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={actionState !== 'idle'}
          aria-busy={actionState === 'rejecting'}
          onClick={handleReject}
        >
          {actionState === 'rejecting' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <XCircle className="h-4 w-4 mr-1" />
          )}
          Reject
        </Button>
      </div>
    </div>
  );
};
