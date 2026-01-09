import React, { useState, useEffect } from 'react';
import { userInventoryApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Box, Minus } from 'lucide-react';

interface InventoryItem {
  id: string;
  userId: string;
  productId?: string;
  name: string;
  quantity: number;
  source: 'PURCHASED' | 'MANUAL';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const MyInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);


  const [isConsumeDialogOpen, setIsConsumeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [consumeQuantity, setConsumeQuantity] = useState(1);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await userInventoryApi.getMyInventory();
      // Only show items that were purchased via orders
      setInventory(data.filter((item: InventoryItem) => item.source === 'PURCHASED'));
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const openConsumeDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setConsumeQuantity(1);
    setIsConsumeDialogOpen(true);
  };

  const handleConsume = async () => {
    if (!selectedItem) return;
    try {
      if (consumeQuantity <= 0) {
        toast.error('Quantity must be greater than 0');
        return;
      }
      if (consumeQuantity > selectedItem.quantity) {
        toast.error('Cannot consume more than available quantity');
        return;
      }

      await userInventoryApi.consumeItem(selectedItem.id, consumeQuantity);
      toast.success('Item consumed successfully');
      setIsConsumeDialogOpen(false);
      setSelectedItem(null);
      loadInventory();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to consume item');
    }
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      PURCHASED: 'default',
      MANUAL: 'secondary',
    };
    return <Badge variant={variants[source] || 'secondary'}>{source}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Inventory</h1>
          <p className="text-slate-500">Manage your personal inventory</p>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Box className="h-12 w-12 text-slate-400" />
                    <p className="text-slate-500">No items in inventory</p>
                    <p className="text-sm text-slate-400">
                      Purchase products to build your inventory
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{getSourceBadge(item.source)}</TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConsumeDialog(item)}
                      title="Consume Item"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Consume Dialog */}
      <Dialog open={isConsumeDialogOpen} onOpenChange={setIsConsumeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consume Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">
              How many <b>{selectedItem?.name}</b> would you like to consume?
              <br />
              Current quantity: {selectedItem?.quantity}
            </p>
            <div className="space-y-2">
              <Label htmlFor="consume-quantity">Quantity to Consume</Label>
              <Input
                id="consume-quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity}
                value={consumeQuantity}
                onChange={(e) => setConsumeQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            {consumeQuantity === selectedItem?.quantity && (
              <p className="text-xs text-red-500">
                Warning: Consuming all stock will remove this item from your inventory.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsumeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConsume}>Consume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
