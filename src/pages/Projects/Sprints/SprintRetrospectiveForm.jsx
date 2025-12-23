import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
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
 * Sprint Retrospective Form Component
 * 
 * Form for creating/editing sprint retrospectives.
 */

const SprintRetrospectiveForm = ({
  isOpen,
  onClose,
  onSuccess,
  sprintId,
  retrospective,
}) => {
  const [formData, setFormData] = useState({
    retrospective_date: '',
    what_went_well: '',
    what_could_be_improved: '',
    action_items: [],
    team_sentiment: '',
    sprint_rating: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [newActionItem, setNewActionItem] = useState({
    item: '',
    owner_id: '',
    due_date: '',
    status: 'Pending',
  });

  useEffect(() => {
    if (isOpen) {
      if (retrospective) {
        setFormData({
          retrospective_date: retrospective.retrospective_date || new Date().toISOString().split('T')[0],
          what_went_well: retrospective.what_went_well || '',
          what_could_be_improved: retrospective.what_could_be_improved || '',
          action_items: retrospective.action_items || [],
          team_sentiment: retrospective.team_sentiment || '',
          sprint_rating: retrospective.sprint_rating?.toString() || '',
          notes: retrospective.notes || '',
        });
      } else {
        setFormData({
          retrospective_date: new Date().toISOString().split('T')[0],
          what_went_well: '',
          what_could_be_improved: '',
          action_items: [],
          team_sentiment: '',
          sprint_rating: '',
          notes: '',
        });
      }
      setErrors({});
      setNewActionItem({
        item: '',
        owner_id: '',
        due_date: '',
        status: 'Pending',
      });
      fetchResources();
    }
  }, [isOpen, retrospective, sprintId]);

  const fetchResources = async () => {
    try {
      const { data } = await supabase
        .from('resources')
        .select('id, name, role')
        .eq('status', 'Active')
        .order('name');

      if (data) {
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddActionItem = () => {
    if (!newActionItem.item.trim()) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      action_items: [...prev.action_items, { ...newActionItem }],
    }));

    setNewActionItem({
      item: '',
      owner_id: '',
      due_date: '',
      status: 'Pending',
    });
  };

  const handleRemoveActionItem = (index) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateActionItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      action_items: prev.action_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.retrospective_date) {
      newErrors.retrospective_date = 'Retrospective date is required';
    }

    if (formData.sprint_rating && (isNaN(formData.sprint_rating) || 
        parseFloat(formData.sprint_rating) < 1 || parseFloat(formData.sprint_rating) > 5)) {
      newErrors.sprint_rating = 'Sprint rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const retrospectiveData = {
        sprint_id: sprintId,
        retrospective_date: formData.retrospective_date,
        what_went_well: formData.what_went_well.trim() || null,
        what_could_be_improved: formData.what_could_be_improved.trim() || null,
        action_items: formData.action_items,
        team_sentiment: formData.team_sentiment || null,
        sprint_rating: formData.sprint_rating ? parseInt(formData.sprint_rating) : null,
        notes: formData.notes.trim() || null,
      };

      if (retrospective) {
        const { error } = await supabase
          .from('sprint_retrospectives')
          .update(retrospectiveData)
          .eq('id', retrospective.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sprint_retrospectives')
          .insert([retrospectiveData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving retrospective:', err);
      setErrors({ general: 'Failed to save retrospective. Please try again.' });
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (retrospective) {
      return 'Edit Retrospective';
    }
    return 'Create Retrospective';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {retrospective
              ? 'Update the sprint retrospective details.'
              : 'Create a new retrospective for this sprint.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Retrospective Date */}
              <div className="grid gap-2">
                <Label htmlFor="retrospective_date">
                  Retrospective Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="retrospective_date"
                  type="date"
                  value={formData.retrospective_date}
                  onChange={(e) => handleChange('retrospective_date', e.target.value)}
                  disabled={submitting}
                  className={errors.retrospective_date ? 'border-red-500' : ''}
                />
                {errors.retrospective_date && (
                  <p className="text-sm text-red-500">{errors.retrospective_date}</p>
                )}
              </div>

              {/* Team Sentiment */}
              <div className="grid gap-2">
                <Label htmlFor="team_sentiment">Team Sentiment</Label>
                <select
                  id="team_sentiment"
                  value={formData.team_sentiment}
                  onChange={(e) => handleChange('team_sentiment', e.target.value)}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Not Set</option>
                  <option value="Very Positive">Very Positive</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                  <option value="Very Negative">Very Negative</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sprint Rating */}
              <div className="grid gap-2">
                <Label htmlFor="sprint_rating">Sprint Rating (1-5)</Label>
                <Input
                  id="sprint_rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.sprint_rating}
                  onChange={(e) => handleChange('sprint_rating', e.target.value)}
                  placeholder="1-5"
                  disabled={submitting}
                  className={errors.sprint_rating ? 'border-red-500' : ''}
                />
                {errors.sprint_rating && (
                  <p className="text-sm text-red-500">{errors.sprint_rating}</p>
                )}
              </div>
            </div>

            {/* What Went Well */}
            <div className="grid gap-2">
              <Label htmlFor="what_went_well">What Went Well</Label>
              <textarea
                id="what_went_well"
                value={formData.what_went_well}
                onChange={(e) => handleChange('what_went_well', e.target.value)}
                placeholder="List the positive aspects of this sprint..."
                disabled={submitting}
                rows={4}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* What Could Be Improved */}
            <div className="grid gap-2">
              <Label htmlFor="what_could_be_improved">What Could Be Improved</Label>
              <textarea
                id="what_could_be_improved"
                value={formData.what_could_be_improved}
                onChange={(e) => handleChange('what_could_be_improved', e.target.value)}
                placeholder="List areas for improvement..."
                disabled={submitting}
                rows={4}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Action Items */}
            <div className="grid gap-2">
              <Label>Action Items</Label>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                {formData.action_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.item}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {item.owner_id && (
                          <span>Owner: {item.owner_name || 'Unassigned'}</span>
                        )}
                        {item.due_date && (
                          <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                        )}
                        <span>Status: {item.status}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <Input
                    placeholder="Action item description"
                    value={newActionItem.item}
                    onChange={(e) => setNewActionItem(prev => ({ ...prev, item: e.target.value }))}
                    disabled={submitting}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newActionItem.owner_id}
                      onChange={(e) => setNewActionItem(prev => ({ ...prev, owner_id: e.target.value }))}
                      disabled={submitting}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">No Owner</option>
                      {resources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="date"
                      placeholder="Due date"
                      value={newActionItem.due_date}
                      onChange={(e) => setNewActionItem(prev => ({ ...prev, due_date: e.target.value }))}
                      disabled={submitting}
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newActionItem.status}
                        onChange={(e) => setNewActionItem(prev => ({ ...prev, status: e.target.value }))}
                        disabled={submitting}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <Button
                        type="button"
                        onClick={handleAddActionItem}
                        disabled={submitting || !newActionItem.item.trim()}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes or observations..."
                disabled={submitting}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : retrospective ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SprintRetrospectiveForm;

