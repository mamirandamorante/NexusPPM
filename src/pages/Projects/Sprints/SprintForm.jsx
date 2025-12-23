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
 * Sprint Form Component
 * 
 * Reusable form for creating/editing sprints.
 */

const SprintForm = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  editingSprint,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    velocity: '',
    status: 'Planning',
    prince2_stage_id: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [prince2Stages, setPrince2Stages] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (editingSprint) {
        setFormData({
          name: editingSprint.name || '',
          goal: editingSprint.goal || '',
          start_date: editingSprint.start_date || '',
          end_date: editingSprint.end_date || '',
          velocity: editingSprint.velocity?.toString() || '',
          status: editingSprint.status || 'Planning',
          prince2_stage_id: editingSprint.prince2_stage_id || '',
        });
      } else {
        // Set default dates (2 weeks from today)
        const today = new Date();
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(today.getDate() + 14);

        setFormData({
          name: '',
          goal: '',
          start_date: today.toISOString().split('T')[0],
          end_date: twoWeeksLater.toISOString().split('T')[0],
          velocity: '',
          status: 'Planning',
          prince2_stage_id: '',
        });
      }
      setErrors({});
      fetchPrince2Stages();
    }
  }, [isOpen, editingSprint, projectId]);

  const fetchPrince2Stages = async () => {
    try {
      const { data } = await supabase
        .from('prince2_stages')
        .select('id, stage_name, stage_number')
        .eq('project_id', projectId)
        .order('stage_number', { ascending: true });

      if (data) {
        setPrince2Stages(data);
      }
    } catch (error) {
      console.error('Error fetching PRINCE2 stages:', error);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Sprint name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.velocity && (isNaN(formData.velocity) || parseFloat(formData.velocity) < 0)) {
      newErrors.velocity = 'Velocity must be a positive number';
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
      const sprintData = {
        project_id: projectId,
        name: formData.name.trim(),
        goal: formData.goal.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        velocity: formData.velocity ? parseFloat(formData.velocity) : 0,
        status: formData.status,
        prince2_stage_id: formData.prince2_stage_id || null,
      };

      if (editingSprint) {
        const { error } = await supabase
          .from('sprints')
          .update(sprintData)
          .eq('id', editingSprint.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sprints')
          .insert([sprintData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving sprint:', err);
      setErrors({ general: 'Failed to save sprint. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (editingSprint) {
      return 'Edit Sprint';
    }
    return 'Create Sprint';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {editingSprint
              ? 'Update the sprint details.'
              : 'Create a new sprint for this project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {/* Sprint Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Sprint Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Sprint 1, Sprint 2024-01"
                disabled={submitting}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Goal */}
            <div className="grid gap-2">
              <Label htmlFor="goal">Sprint Goal</Label>
              <textarea
                id="goal"
                value={formData.goal}
                onChange={(e) => handleChange('goal', e.target.value)}
                placeholder="What is the goal of this sprint?"
                disabled={submitting}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="grid gap-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  disabled={submitting}
                  className={errors.start_date ? 'border-red-500' : ''}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">{errors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div className="grid gap-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  disabled={submitting}
                  className={errors.end_date ? 'border-red-500' : ''}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Velocity */}
              <div className="grid gap-2">
                <Label htmlFor="velocity">Planned Velocity (Story Points)</Label>
                <Input
                  id="velocity"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.velocity}
                  onChange={(e) => handleChange('velocity', e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                  className={errors.velocity ? 'border-red-500' : ''}
                />
                {errors.velocity && (
                  <p className="text-sm text-red-500">{errors.velocity}</p>
                )}
              </div>

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
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* PRINCE2 Stage (Optional) */}
            {prince2Stages.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="prince2_stage_id">PRINCE2 Stage (Optional)</Label>
                <select
                  id="prince2_stage_id"
                  value={formData.prince2_stage_id}
                  onChange={(e) => handleChange('prince2_stage_id', e.target.value)}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">No Stage</option>
                  {prince2Stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.stage_name} - Stage {stage.stage_number}
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
              {submitting ? 'Saving...' : editingSprint ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SprintForm;

