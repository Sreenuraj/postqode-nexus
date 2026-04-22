import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { X, Plus, Bookmark, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

interface SavedViewsChipsProps {
  pageKey: string;
  currentFilters: Record<string, any>;
  onApplyView: (filters: Record<string, any>) => void;
}

const STORAGE_KEY = 'nexus:saved-views';

export const SavedViewsChips: React.FC<SavedViewsChipsProps> = ({
  pageKey,
  currentFilters,
  onApplyView,
}) => {
  const [views, setViews] = useState<SavedView[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const allViews = JSON.parse(raw);
        setViews(allViews[pageKey] || []);
      } catch {
        setViews([]);
      }
    }
  }, [pageKey]);

  const persistViews = (updated: SavedView[]) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allViews = raw ? JSON.parse(raw) : {};
    allViews[pageKey] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allViews));
    setViews(updated);
  };

  const handleCreate = () => {
    if (!newViewName.trim()) return;
    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name: newViewName.trim(),
      filters: { ...currentFilters },
      createdAt: new Date().toISOString(),
    };
    persistViews([...views, newView]);
    setNewViewName('');
    setShowCreateDialog(false);
    toast.success('Saved view created');
  };

  const handleDelete = (id: string) => {
    persistViews(views.filter((v) => v.id !== id));
    toast.success('Saved view removed');
  };

  const handleRename = () => {
    if (!editingView || !renameValue.trim()) return;
    persistViews(
      views.map((v) => (v.id === editingView.id ? { ...v, name: renameValue.trim() } : v))
    );
    setEditingView(null);
    setRenameValue('');
    toast.success('Saved view renamed');
  };

  const isActive = (view: SavedView) => {
    return JSON.stringify(view.filters) === JSON.stringify(currentFilters);
    };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Saved Views</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setShowCreateDialog(true)}
          id="my-activity-button-save-view"
        >
          <Plus className="h-3 w-3" />
          Save current
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {views.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No saved views yet</p>
        ) : (
          views.map((view) => (
            <div
              key={view.id}
              className="flex items-center gap-1 shrink-0"
              id={`my-activity-chip-${view.id}`}
            >
              <Button
                variant={isActive(view) ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs rounded-full px-3"
                onClick={() => onApplyView(view.filters)}
              >
                {view.name}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setEditingView(view);
                  setRenameValue(view.name);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600"
                onClick={() => handleDelete(view.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="View name (e.g., Pending Orders)"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              id="my-activity-input-view-name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newViewName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!editingView} onOpenChange={() => setEditingView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              id="my-activity-input-rename-view"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingView(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
