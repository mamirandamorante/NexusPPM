import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

/**
 * Project Form Component
 * 
 * Used for both creating and editing projects.
 * 
 * Props:
 * - open: boolean - Controls dialog visibility
 * - onClose: function - Called when dialog should close
 * - project: object|null - Project data for editing (null for new project)
 * - onSuccess: function - Called after successful save
 */

const ProjectForm = ({ open, onClose, project, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    manager_id: '',
    sponsor_id: '',
    status: 'Planning',
    priority: 'Medium',
    start_date: '',
    end_date: '',
    budget: '',
    phase: '',
    size: '',
    business_unit_id: '',
    program_id: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [managers, setManagers] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [programs, setPrograms] = useState([]);

  const isEditMode = !!project;

  // Common status and priority options
  const statusOptions = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const phaseOptions = ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closing'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Enterprise'];

  // Load dropdown data when dialog opens
  useEffect(() => {
    if (open) {
      fetchManagers();
      fetchSponsors();
      fetchBusinessUnits();
      fetchPrograms();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        manager_id: project.manager_id || '',
        sponsor_id: project.sponsor_id || '',
        status: project.status || 'Planning',
        priority: project.priority || 'Medium',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        budget: project.budget?.toString() || '',
        phase: project.phase || '',
        size: project.size || '',
        business_unit_id: project.business_unit_id?.toString() || '',
        program_id: project.program_id?.toString() || '',
      });
      setErrors({});
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        manager_id: '',
        sponsor_id: '',
        status: 'Planning',
        priority: 'Medium',
        start_date: '',
        end_date: '',
        budget: '',
        phase: '',
        size: '',
        business_unit_id: '',
        program_id: '',
      });
      setErrors({});
    }
  }, [project, open]);

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, name')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setManagers(data || []);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, name')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setSponsors(data || []);
    } catch (err) {
      console.error('Error fetching sponsors:', err);
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('business_units')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBusinessUnits(data || []);
    } catch (err) {
      console.error('Error fetching business units:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      // Assuming there's a programs table - if not, this can be removed
      const { data, error } = await supabase
        .from('programs')
        .select('id, name')
        .order('name');

      if (error) {
        // If programs table doesn't exist, just set empty array
        console.log('Programs table not found, skipping');
        setPrograms([]);
        return;
      }
      setPrograms(data || []);
    } catch (err) {
      console.log('Programs table not available');
      setPrograms([]);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.manager_id) {
      newErrors.manager_id = 'Project manager is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
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
      const projectData = {
        name: formData.name.trim(),
        manager_id: formData.manager_id || null,
        sponsor_id: formData.sponsor_id || null,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        phase: formData.phase || null,
        size: formData.size || null,
        business_unit_id: formData.business_unit_id ? parseInt(formData.business_unit_id) : null,
        program_id: formData.program_id ? parseInt(formData.program_id) : null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      setErrors({ submit: err.message || 'Failed to save project' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update project information below.' 
              : 'Fill in the details to create a new project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Project Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter project name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Manager and Sponsor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="manager_id">Project Manager *</Label>
                <select
                  id="manager_id"
                  value={formData.manager_id}
                  onChange={(e) => handleChange('manager_id', e.target.value)}
                  className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    errors.manager_id ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
                {errors.manager_id && <p className="text-sm text-red-500">{errors.manager_id}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sponsor_id">Project Sponsor</Label>
                <select
                  id="sponsor_id"
                  value={formData.sponsor_id}
                  onChange={(e) => handleChange('sponsor_id', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select sponsor</option>
                  {sponsors.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id}>
                      {sponsor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className={errors.end_date ? 'border-red-500' : ''}
                />
                {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
              </div>
            </div>

            {/* Budget */}
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="0.00"
                className={errors.budget ? 'border-red-500' : ''}
              />
              {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
            </div>

            {/* Phase and Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phase">Phase</Label>
                <select
                  id="phase"
                  value={formData.phase}
                  onChange={(e) => handleChange('phase', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select phase</option>
                  {phaseOptions.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select size</option>
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Business Unit and Program */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="business_unit_id">Business Unit</Label>
                <select
                  id="business_unit_id"
                  value={formData.business_unit_id}
                  onChange={(e) => handleChange('business_unit_id', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select business unit</option>
                  {businessUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="program_id">Program</Label>
                <select
                  id="program_id"
                  value={formData.program_id}
                  onChange={(e) => handleChange('program_id', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={programs.length === 0}
                >
                  <option value="">{programs.length === 0 ? 'No programs available' : 'Select program'}</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errors.submit && (
              <div className="text-sm text-red-500">{errors.submit}</div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;

