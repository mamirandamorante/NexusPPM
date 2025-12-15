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
 * Resource Form Component
 * 
 * Used for both creating and editing resources.
 * 
 * Props:
 * - open: boolean - Controls dialog visibility
 * - onClose: function - Called when dialog should close
 * - resource: object|null - Resource data for editing (null for new resource)
 * - onSuccess: function - Called after successful save
 */

const ResourceForm = ({ open, onClose, resource, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'Active',
    hourly_rate: '',
    availability: '',
    company: '',
    type: 'Internal',
    business_unit_id: '',
    resource_manager_id: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [resourceManagers, setResourceManagers] = useState([]);
  const [roleRates, setRoleRates] = useState([]);

  const isEditMode = !!resource;

  // Common status options
  const statusOptions = ['Active', 'Inactive'];
  const typeOptions = ['Internal', 'External'];

  // Load existing roles, business units, resource managers, and role rates from database
  useEffect(() => {
    if (open) {
      fetchUniqueRoles();
      fetchBusinessUnits();
      fetchResourceManagers();
      fetchRoleRates();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        email: resource.email || '',
        role: resource.role || '',
        status: resource.status || 'Active',
        hourly_rate: resource.hourly_rate?.toString() || '',
        availability: resource.availability?.toString() || '',
        company: resource.company || '',
        type: resource.type || 'Internal',
        business_unit_id: resource.business_unit_id?.toString() || '',
        resource_manager_id: resource.resource_manager_id || '',
      });
      setErrors({});
    } else {
      // Reset form for new resource
      setFormData({
        name: '',
        email: '',
        role: '',
        status: 'Active',
        hourly_rate: '',
        availability: '',
        company: '',
        type: 'Internal',
        business_unit_id: '',
        resource_manager_id: '',
      });
      setErrors({});
    }
  }, [resource, open]);

  const fetchUniqueRoles = async () => {
    try {
      // Fetch roles from both resources and role_rates
      const [resourcesResult, roleRatesResult] = await Promise.all([
        supabase
          .from('resources')
          .select('role')
          .not('role', 'is', null),
        supabase
          .from('role_rates')
          .select('role')
      ]);

      const rolesFromResources = resourcesResult.data 
        ? [...new Set(resourcesResult.data.map(r => r.role).filter(Boolean))]
        : [];
      
      const rolesFromRates = roleRatesResult.data 
        ? roleRatesResult.data.map(rr => rr.role).filter(Boolean)
        : [];

      // Combine and deduplicate
      const allRoles = [...new Set([...rolesFromResources, ...rolesFromRates])];
      setUniqueRoles(allRoles.sort());
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('business_units')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setBusinessUnits(data || []);
    } catch (error) {
      console.error('Error fetching business units:', error);
    }
  };

  const fetchResourceManagers = async () => {
    try {
      // Fetch resources that could be managers (exclude current resource if editing)
      let query = supabase
        .from('resources')
        .select('id, name')
        .order('name', { ascending: true });

      // If editing, exclude the current resource from manager list
      if (isEditMode && resource?.id) {
        query = query.neq('id', resource.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResourceManagers(data || []);
    } catch (error) {
      console.error('Error fetching resource managers:', error);
    }
  };

  const fetchRoleRates = async () => {
    try {
      const { data, error } = await supabase
        .from('role_rates')
        .select('role, default_hourly_rate')
        .order('role', { ascending: true });

      if (error) throw error;
      setRoleRates(data || []);
    } catch (error) {
      console.error('Error fetching role rates:', error);
      // Don't fail the form if role_rates table doesn't exist yet
      setRoleRates([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    // Numeric validations
    if (formData.hourly_rate && (isNaN(formData.hourly_rate) || parseFloat(formData.hourly_rate) < 0)) {
      newErrors.hourly_rate = 'Hourly rate must be a positive number';
    }

    if (formData.availability) {
      const availability = parseFloat(formData.availability);
      if (isNaN(availability) || availability < 0 || availability > 100) {
        newErrors.availability = 'Availability must be a number between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const resourceData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role.trim(),
        status: formData.status,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        availability: formData.availability ? parseFloat(formData.availability) : null,
        company: formData.company.trim() || null,
        type: formData.type || null,
        business_unit_id: formData.business_unit_id ? parseInt(formData.business_unit_id) : null,
        resource_manager_id: formData.resource_manager_id || null,
      };

      let result;
      if (isEditMode) {
        // Update existing resource
        const { data, error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from('resources')
          .insert([resourceData])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Success
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
      
      // Handle specific Supabase errors
      if (error.code === '23505') { // Unique constraint violation
        setErrors({ email: 'An resource with this email already exists' });
      } else {
        setErrors({ submit: error.message || 'Failed to save resource. Please try again.' });
      }
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

  const handleRoleChange = (newRole) => {
    handleChange('role', newRole);
    
    // Auto-populate hourly rate if a default exists for this role
    const roleRate = roleRates.find(rr => rr.role.toLowerCase() === newRole.trim().toLowerCase());
    if (roleRate && !isEditMode) {
      // Only auto-populate if hourly_rate is empty (new resource)
      if (!formData.hourly_rate) {
        handleChange('hourly_rate', roleRate.default_hourly_rate.toString());
      }
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Resource' : 'Add New Resource'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the resource information below.'
              : 'Fill in the details to add a new resource to the system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                disabled={submitting}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john.doe@example.com"
                disabled={submitting}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={submitting}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.role ? 'border-red-500' : ''}`}
              >
                <option value="">Select a role...</option>
                {(() => {
                  // Include current role if it exists and isn't in uniqueRoles
                  const allRoles = [...uniqueRoles];
                  if (formData.role && !allRoles.includes(formData.role)) {
                    allRoles.push(formData.role);
                  }
                  // Also include roles from role_rates
                  roleRates.forEach(rr => {
                    if (!allRoles.includes(rr.role)) {
                      allRoles.push(rr.role);
                    }
                  });
                  return allRoles.sort().map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ));
                })()}
              </select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
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
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Hourly Rate */}
            <div className="grid gap-2">
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => handleChange('hourly_rate', e.target.value)}
                  placeholder="0.00"
                  disabled={submitting}
                  className={`pl-7 ${errors.hourly_rate ? 'border-red-500' : ''}`}
                />
              </div>
              {(() => {
                const roleRate = roleRates.find(rr => 
                  rr.role.toLowerCase() === formData.role.trim().toLowerCase()
                );
                if (roleRate && formData.hourly_rate === roleRate.default_hourly_rate.toString()) {
                  return (
                    <p className="text-xs text-gray-500">
                      Using default rate for {formData.role || 'this role'}
                    </p>
                  );
                }
                if (roleRate && !formData.hourly_rate) {
                  return (
                    <p className="text-xs text-blue-600">
                      Default: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(roleRate.default_hourly_rate)}/hr
                    </p>
                  );
                }
                return null;
              })()}
              {errors.hourly_rate && (
                <p className="text-sm text-red-500">{errors.hourly_rate}</p>
              )}
            </div>

            {/* Availability */}
            <div className="grid gap-2">
              <Label htmlFor="availability">Availability (%)</Label>
              <div className="relative">
                <Input
                  id="availability"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.availability}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  placeholder="100"
                  disabled={submitting}
                  className={errors.availability ? 'border-red-500' : ''}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {errors.availability && (
                <p className="text-sm text-red-500">{errors.availability}</p>
              )}
              <p className="text-xs text-gray-500">
                Percentage of time available (0-100)
              </p>
            </div>

            {/* Company */}
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Company name"
                disabled={submitting}
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={submitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Unit */}
            <div className="grid gap-2">
              <Label htmlFor="business_unit_id">Business Unit</Label>
              <select
                id="business_unit_id"
                value={formData.business_unit_id}
                onChange={(e) => handleChange('business_unit_id', e.target.value)}
                disabled={submitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Business Unit</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    {bu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Manager */}
            <div className="grid gap-2">
              <Label htmlFor="resource_manager_id">Resource Manager</Label>
              <select
                id="resource_manager_id"
                value={formData.resource_manager_id}
                onChange={(e) => handleChange('resource_manager_id', e.target.value)}
                disabled={submitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Resource Manager</option>
                {resourceManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {errors.submit}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Update Resource' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceForm;

