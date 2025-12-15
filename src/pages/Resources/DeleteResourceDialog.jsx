import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

/**
 * Deactivate Resource Confirmation Dialog
 * 
 * Implements soft delete by setting resource status to "Inactive"
 * instead of hard deleting. This preserves all historical data.
 * 
 * Props:
 * - open: boolean - Controls dialog visibility
 * - onClose: function - Called when dialog should close
 * - resource: object - Resource to deactivate
 * - onSuccess: function - Called after successful deactivation
 */

const DeleteResourceDialog = ({ open, onClose, resource, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!resource) return;

    setDeleting(true);
    setError(null);

    try {
      // Soft delete: Set status to Inactive instead of deleting
      // This preserves all historical data (time entries, project assignments, etc.)
      const { error: updateError } = await supabase
        .from('resources')
        .update({ status: 'Inactive' })
        .eq('id', resource.id);

      if (updateError) throw updateError;

      // Success
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err) {
      console.error('Error deactivating resource:', err);
      setError(err.message || 'Failed to deactivate resource. Please try again.');
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      setError(null);
      onClose();
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Deactivate Resource</DialogTitle>
              <DialogDescription className="mt-1">
                This will set the resource status to Inactive. They will no longer appear in active resource lists, but all historical data will be preserved.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to deactivate <span className="font-semibold text-gray-900">{resource.name}</span>?
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deactivating...' : 'Deactivate Resource'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteResourceDialog;

