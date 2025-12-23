import React, { useState, useEffect } from 'react';
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
 * Work Item Form Component
 * 
 * Reusable form for creating/editing work items (Epic, Feature, UserStory, Task).
 * Adapts fields based on work item type.
 */

const WorkItemForm = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  workItemType,
  editingItem,
  parentId = null,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acceptance_criteria: '',
    status: 'Backlog',
    priority: 'Medium',
    effort_estimate: '',
    effort_unit: workItemType === 'Task' ? 'Hours' : 'StoryPoints',
    assignee_id: '',
    sprint_id: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          title: editingItem.title || '',
          description: editingItem.description || '',
          acceptance_criteria: editingItem.acceptance_criteria || '',
          status: editingItem.status || 'Backlog',
          priority: editingItem.priority || 'Medium',
          effort_estimate: editingItem.effort_estimate?.toString() || '',
          effort_unit: editingItem.effort_unit || (workItemType === 'Task' ? 'Hours' : 'StoryPoints'),
          assignee_id: editingItem.assignee_id || '',
          sprint_id: editingItem.sprint_id || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          acceptance_criteria: '',
          status: 'Backlog',
          priority: 'Medium',
          effort_estimate: '',
          effort_unit: workItemType === 'Task' ? 'Hours' : 'StoryPoints',
          assignee_id: '',
          sprint_id: '',
        });
      }
      setErrors({});
      fetchResources();
      fetchSprints();
    }
  }, [isOpen, editingItem, workItemType, projectId]);

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

  const fetchSprints = async () => {
    try {
      const { data } = await supabase
        .from('sprints')
        .select('id, name, status, start_date, end_date')
        .eq('project_id', projectId)
        .in('status', ['Planning', 'Active'])
        .order('start_date', { ascending: false });

      if (data) {
        setSprints(data);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.effort_estimate && (isNaN(formData.effort_estimate) || parseFloat(formData.effort_estimate) < 0)) {
      newErrors.effort_estimate = 'Effort estimate must be a positive number';
    }

    // Acceptance criteria is recommended for User Stories
    if (workItemType === 'UserStory' && !formData.acceptance_criteria.trim()) {
      newErrors.acceptance_criteria = 'Acceptance criteria is recommended for User Stories';
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
      const workItemData = {
        project_id: projectId,
        parent_id: parentId || null,
        type: workItemType,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        acceptance_criteria: formData.acceptance_criteria.trim() || null,
        status: formData.status,
        priority: formData.priority,
        effort_estimate: formData.effort_estimate ? parseFloat(formData.effort_estimate) : null,
        effort_unit: formData.effort_unit,
        assignee_id: formData.assignee_id || null,
        sprint_id: formData.sprint_id || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('work_items')
          .update(workItemData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('work_items')
          .insert([workItemData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving work item:', err);
      setErrors({ general: 'Failed to save work item. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (editingItem) {
      return `Edit ${workItemType}`;
    }
    return `Add ${workItemType}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {editingItem
              ? `Update the ${workItemType.toLowerCase()} details.`
              : `Create a new ${workItemType.toLowerCase()} for this project.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={`Enter ${workItemType.toLowerCase()} title`}
                disabled={submitting}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={`Describe the ${workItemType.toLowerCase()}`}
                disabled={submitting}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Acceptance Criteria (for User Stories and Features) */}
            {(workItemType === 'UserStory' || workItemType === 'Feature') && (
              <div className="grid gap-2">
                <Label htmlFor="acceptance_criteria">
                  Acceptance Criteria {workItemType === 'UserStory' && <span className="text-red-500">*</span>}
                </Label>
                <textarea
                  id="acceptance_criteria"
                  value={formData.acceptance_criteria}
                  onChange={(e) => handleChange('acceptance_criteria', e.target.value)}
                  placeholder="Define the acceptance criteria..."
                  disabled={submitting}
                  rows={4}
                  className={`flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.acceptance_criteria ? 'border-red-500' : ''}`}
                />
                {errors.acceptance_criteria && (
                  <p className="text-sm text-red-500">{errors.acceptance_criteria}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="InReview">In Review</option>
                  <option value="Done">Done</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority */}
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Effort Estimate */}
              <div className="grid gap-2">
                <Label htmlFor="effort_estimate">
                  Effort Estimate ({formData.effort_unit === 'StoryPoints' ? 'Story Points' : 'Hours'})
                </Label>
                <Input
                  id="effort_estimate"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.effort_estimate}
                  onChange={(e) => handleChange('effort_estimate', e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                  className={errors.effort_estimate ? 'border-red-500' : ''}
                />
                {errors.effort_estimate && (
                  <p className="text-sm text-red-500">{errors.effort_estimate}</p>
                )}
              </div>

              {/* Assignee (for Tasks and User Stories) */}
              {(workItemType === 'Task' || workItemType === 'UserStory') && (
                <div className="grid gap-2">
                  <Label htmlFor="assignee_id">Assignee</Label>
                  <select
                    id="assignee_id"
                    value={formData.assignee_id}
                    onChange={(e) => handleChange('assignee_id', e.target.value)}
                    disabled={submitting}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} ({resource.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Sprint Assignment (for User Stories and Tasks) */}
            {(workItemType === 'UserStory' || workItemType === 'Task') && (
              <div className="grid gap-2">
                <Label htmlFor="sprint_id">Sprint</Label>
                <select
                  id="sprint_id"
                  value={formData.sprint_id}
                  onChange={(e) => handleChange('sprint_id', e.target.value)}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">No Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkItemForm;

