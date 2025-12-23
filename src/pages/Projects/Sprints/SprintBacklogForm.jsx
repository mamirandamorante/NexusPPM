import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

/**
 * Sprint Backlog Form Component
 * 
 * Allows adding existing work items (User Stories or Tasks) to a sprint.
 */

const SprintBacklogForm = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  sprintId,
}) => {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableItems();
      setSelectedItemIds([]);
      setError(null);
    }
  }, [isOpen, projectId, sprintId]);

  const fetchAvailableItems = async () => {
    setLoading(true);
    try {
      // Fetch User Stories and Tasks that are not already in a sprint or in this sprint
      const { data, error: fetchError } = await supabase
        .from('work_items')
        .select('id, title, type, status, effort_estimate, effort_unit, assignee_id')
        .eq('project_id', projectId)
        .in('type', ['UserStory', 'Task'])
        .or(`sprint_id.is.null,sprint_id.eq.${sprintId}`)
        .order('type', { ascending: true })
        .order('title', { ascending: true });

      if (fetchError) throw fetchError;
      setAvailableItems(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching available items:', err);
      setError('Failed to load available work items');
      setLoading(false);
    }
  };

  const handleToggleItem = (itemId) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItemIds.length === 0) {
      setError('Please select at least one work item to add to the sprint');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('work_items')
        .update({ sprint_id: sprintId })
        .in('id', selectedItemIds);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err) {
      console.error('Error adding items to sprint:', err);
      setError('Failed to add items to sprint. Please try again.');
      setSubmitting(false);
    }
  };

  const getTypeBadgeClass = (type) => {
    const typeMap = {
      'UserStory': 'bg-purple-100 text-purple-800 border-purple-200',
      'Task': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return typeMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Backlog': 'bg-gray-100 text-gray-800 border-gray-200',
      'ToDo': 'bg-blue-100 text-blue-800 border-blue-200',
      'InProgress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'InReview': 'bg-purple-100 text-purple-800 border-purple-200',
      'Done': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Work Items to Sprint</DialogTitle>
          <DialogDescription>
            Select work items (User Stories or Tasks) to add to this sprint backlog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm">Loading available work items...</p>
              </div>
            ) : availableItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available work items found.</p>
                <p className="text-sm mt-2">All User Stories and Tasks are already assigned to sprints.</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {availableItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTypeBadgeClass(item.type)}`}>
                            {item.type === 'UserStory' ? 'User Story' : 'Task'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                          {item.effort_estimate && (
                            <span className="text-xs text-gray-500">
                              {item.effort_estimate} {item.effort_unit === 'StoryPoints' ? 'SP' : 'h'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedItemIds.length > 0 && (
              <div className="text-sm text-gray-600">
                {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || selectedItemIds.length === 0}
            >
              {submitting ? 'Adding...' : `Add ${selectedItemIds.length} Item${selectedItemIds.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SprintBacklogForm;

