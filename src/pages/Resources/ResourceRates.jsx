import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

/**
 * Resource Rates Page
 * 
 * Manages default hourly rates by role.
 * Allows centralized rate management and bulk updates.
 */

const ResourceRates = () => {
  const [roleRates, setRoleRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    default_hourly_rate: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [affectedResourcesCount, setAffectedResourcesCount] = useState(0);

  useEffect(() => {
    fetchRoleRates();
  }, []);

  const fetchRoleRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('role_rates')
        .select('*')
        .order('role', { ascending: true });

      if (fetchError) throw fetchError;
      setRoleRates(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching role rates:', err);
      setError('Failed to load role rates');
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRate(null);
    setFormData({
      role: '',
      default_hourly_rate: '',
      description: '',
    });
    setFormErrors({});
    setAffectedResourcesCount(0);
    setIsFormOpen(true);
  };

  const handleEdit = async (rate) => {
    setEditingRate(rate);
    setFormData({
      role: rate.role,
      default_hourly_rate: rate.default_hourly_rate?.toString() || '',
      description: rate.description || '',
    });
    setFormErrors({});
    
    // Check how many resources have this role
    try {
      const { count, error } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('role', rate.role);
      
      if (!error) {
        setAffectedResourcesCount(count || 0);
      }
    } catch (err) {
      console.error('Error counting resources:', err);
    }
    
    setIsFormOpen(true);
  };

  const handleDelete = async (rate) => {
    if (!confirm(`Are you sure you want to delete the rate for "${rate.role}"?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('role_rates')
        .delete()
        .eq('id', rate.id);

      if (deleteError) throw deleteError;
      fetchRoleRates();
    } catch (err) {
      console.error('Error deleting role rate:', err);
      alert('Failed to delete role rate. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }
    if (!formData.default_hourly_rate || isNaN(formData.default_hourly_rate) || parseFloat(formData.default_hourly_rate) < 0) {
      errors.default_hourly_rate = 'Valid hourly rate is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const rateData = {
        role: formData.role.trim(),
        default_hourly_rate: parseFloat(formData.default_hourly_rate),
        description: formData.description.trim() || null,
      };

      if (editingRate) {
        // Update existing
        const { error: updateError } = await supabase
          .from('role_rates')
          .update(rateData)
          .eq('id', editingRate.id);

        if (updateError) throw updateError;

        // Automatically update all existing resources with this role to match the new default rate
        const { error: bulkUpdateError } = await supabase
          .from('resources')
          .update({ hourly_rate: rateData.default_hourly_rate })
          .eq('role', rateData.role);

        if (bulkUpdateError) {
          console.error('Error updating existing resources:', bulkUpdateError);
          // Don't fail the whole operation, just log it
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('role_rates')
          .insert([rateData]);

        if (insertError) throw insertError;
      }

      setIsFormOpen(false);
      setAffectedResourcesCount(0);
      fetchRoleRates();
    } catch (err) {
      console.error('Error saving role rate:', err);
      if (err.code === '23505') {
        setFormErrors({ role: 'A rate for this role already exists' });
      } else {
        setFormErrors({ submit: err.message || 'Failed to save role rate' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Resource Rate Cards</h1>
          <p className="text-gray-600 text-sm mt-1">Manage default hourly rates by role</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Resource Rate Cards</h1>
          <p className="text-gray-600 text-sm mt-1">Manage default hourly rates by role</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchRoleRates}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resource Rate Cards</h1>
            <p className="text-gray-600 text-sm mt-1">Manage default hourly rates by role</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role Rate
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Default Hourly Rate</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roleRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No role rates defined. Click "Add Role Rate" to get started.
                </TableCell>
              </TableRow>
            ) : (
              roleRates.map((rate) => (
                <TableRow key={rate.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{rate.role}</TableCell>
                  <TableCell>{formatCurrency(rate.default_hourly_rate)}</TableCell>
                  <TableCell className="text-gray-600">{rate.description || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(rate)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRate ? 'Edit Role Rate' : 'Add Role Rate'}
            </DialogTitle>
            <DialogDescription>
              {editingRate
                ? 'Update the default hourly rate for this role.'
                : 'Set a default hourly rate for a role. This will be used when creating new resources.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Developer, Project Manager"
                  disabled={submitting || !!editingRate}
                  className={formErrors.role ? 'border-red-500' : ''}
                />
                {formErrors.role && (
                  <p className="text-sm text-red-500">{formErrors.role}</p>
                )}
                {editingRate && (
                  <p className="text-xs text-gray-500">Role cannot be changed when editing</p>
                )}
              </div>

              {/* Default Hourly Rate */}
              <div className="grid gap-2">
                <Label htmlFor="default_hourly_rate">
                  Default Hourly Rate <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="default_hourly_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_hourly_rate}
                    onChange={(e) => setFormData({ ...formData, default_hourly_rate: e.target.value })}
                    placeholder="0.00"
                    disabled={submitting}
                    className={`pl-7 ${formErrors.default_hourly_rate ? 'border-red-500' : ''}`}
                  />
                </div>
                {formErrors.default_hourly_rate && (
                  <p className="text-sm text-red-500">{formErrors.default_hourly_rate}</p>
                )}
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  disabled={submitting}
                />
              </div>

              {/* Info message when editing (showing what will be updated) */}
              {editingRate && affectedResourcesCount > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                  <span className="font-medium">Note:</span> Updating this rate will automatically update the hourly rate for <span className="font-medium">{affectedResourcesCount} existing resource(s)</span> with role "<span className="font-medium">{editingRate.role}</span>" to match the new default rate. Individual resources can be edited separately if needed.
                </div>
              )}

              {/* Submit Error */}
              {formErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formErrors.submit}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingRate ? 'Update Rate' : 'Add Rate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceRates;

