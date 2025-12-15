import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from 'date-fns';

/**
 * Resource Availability Calendar Page
 * 
 * Features:
 * - Calendar view showing availability periods
 * - Add/edit/delete availability periods
 * - Capacity visualization (allocated vs available)
 * - Over-allocation warnings
 * - Month navigation
 */

const ResourceAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [availabilityPeriods, setAvailabilityPeriods] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    availability_percent: '100',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch resource
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (resourceError) throw resourceError;
      setResource(resourceData);

      // Fetch all availability periods for the table
      // For calendar, we'll filter client-side
      const { data: periodsData, error: periodsError } = await supabase
        .from('resource_availability_periods')
        .select('*')
        .eq('resource_id', id)
        .order('start_date', { ascending: true });

      if (periodsError) throw periodsError;
      setAvailabilityPeriods(periodsData || []);

      // Fetch capacity data
      const { data: capacityData, error: capacityError } = await supabase
        .from('vw_resource_capacity')
        .select('*')
        .eq('resource_id', id)
        .single();

      if (capacityError && capacityError.code !== 'PGRST116') {
        console.error('Error fetching capacity:', capacityError);
      }
      setCapacity(capacityData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load resource availability data');
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPeriod(null);
    const today = format(new Date(), 'yyyy-MM-dd');
    setFormData({
      start_date: today,
      end_date: today,
      availability_percent: resource?.availability?.toString() || '100',
      notes: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (period) => {
    setEditingPeriod(period);
    setFormData({
      start_date: period.start_date,
      end_date: period.end_date,
      availability_percent: period.availability_percent.toString(),
      notes: period.notes || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = async (period) => {
    if (!window.confirm(`Are you sure you want to delete this availability period?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('resource_availability_periods')
        .delete()
        .eq('id', period.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error deleting period:', err);
      alert('Failed to delete availability period. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.end_date = 'End date must be after start date';
    }
    if (!formData.availability_percent || isNaN(formData.availability_percent) || 
        parseFloat(formData.availability_percent) < 0 || parseFloat(formData.availability_percent) > 100) {
      errors.availability_percent = 'Availability must be a number between 0 and 100';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const periodData = {
        resource_id: id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        availability_percent: parseInt(formData.availability_percent),
        notes: formData.notes.trim() || null,
      };

      if (editingPeriod) {
        const { error: updateError } = await supabase
          .from('resource_availability_periods')
          .update(periodData)
          .eq('id', editingPeriod.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('resource_availability_periods')
          .insert([periodData]);

        if (insertError) throw insertError;
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving availability period:', err);
      if (err.code === '23P01') {
        setFormErrors({ 
          general: 'This period overlaps with an existing availability period. Please adjust the dates.' 
        });
      } else {
        setFormErrors({ general: 'Failed to save availability period. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailabilityForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const period = availabilityPeriods.find(p => 
      dateStr >= p.start_date && dateStr <= p.end_date
    );
    return period ? period.availability_percent : (resource?.availability || 100);
  };

  const getDayClass = (date) => {
    const availability = getAvailabilityForDate(date);
    if (availability === 0) return 'bg-red-100 text-red-800';
    if (availability < 50) return 'bg-orange-100 text-orange-800';
    if (availability < 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading availability data...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Resource not found'}</p>
          <Button onClick={() => navigate('/resources')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/resources">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">
                Resource Availability: {resource.name}
              </h1>
            </div>
            <p className="text-gray-600 text-sm">
              Manage time-based availability periods and view capacity allocation
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Availability Period
          </Button>
        </div>
      </div>

      {/* Capacity Summary */}
      {capacity && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Available Capacity</div>
            <div className="text-2xl font-semibold text-gray-900">{capacity.available_capacity}%</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Allocated Capacity</div>
            <div className="text-2xl font-semibold text-gray-900">{capacity.allocated_capacity}%</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Remaining Capacity</div>
            <div className={`text-2xl font-semibold ${
              capacity.remaining_capacity < 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {capacity.remaining_capacity}%
            </div>
          </div>
          <div className={`border rounded-lg p-4 ${
            capacity.is_over_allocated 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {capacity.is_over_allocated ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div className="text-sm font-medium">
                {capacity.is_over_allocated ? 'Over-allocated' : 'Within Capacity'}
              </div>
            </div>
            <div className="text-2xl font-semibold">
              {capacity.utilization_percent}% utilized
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Calendar View</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              ← Previous
            </Button>
            <div className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              Next →
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month start */}
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="p-2"></div>
          ))}
          
          {/* Days of month */}
          {daysInMonth.map(day => {
            const availability = getAvailabilityForDate(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`p-2 border border-gray-200 rounded text-center cursor-pointer hover:bg-gray-50 ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } ${getDayClass(day)}`}
                title={`${format(day, 'MMM d, yyyy')}: ${availability}% available`}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                <div className="text-xs mt-1">{availability}%</div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>100% Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>50-99% Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span>1-49% Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>0% Available</span>
          </div>
        </div>
      </div>

      {/* Availability Periods Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Availability Periods</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availabilityPeriods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No availability periods defined. Default availability: {resource.availability || 100}%
                </TableCell>
              </TableRow>
            ) : (
              availabilityPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{format(parseISO(period.start_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(parseISO(period.end_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{period.availability_percent}%</TableCell>
                  <TableCell className="text-gray-600">{period.notes || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(period)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(period)}
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
              {editingPeriod ? 'Edit Availability Period' : 'Add Availability Period'}
            </DialogTitle>
            <DialogDescription>
              {editingPeriod
                ? 'Update the availability period details.'
                : 'Define a time period with specific availability percentage.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formErrors.general}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    disabled={submitting}
                    className={formErrors.start_date ? 'border-red-500' : ''}
                  />
                  {formErrors.start_date && (
                    <p className="text-sm text-red-500">{formErrors.start_date}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end_date">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    disabled={submitting}
                    className={formErrors.end_date ? 'border-red-500' : ''}
                  />
                  {formErrors.end_date && (
                    <p className="text-sm text-red-500">{formErrors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="availability_percent">
                  Availability (%) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="availability_percent"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.availability_percent}
                    onChange={(e) => setFormData({ ...formData, availability_percent: e.target.value })}
                    placeholder="100"
                    disabled={submitting}
                    className={`pr-8 ${formErrors.availability_percent ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                {formErrors.availability_percent && (
                  <p className="text-sm text-red-500">{formErrors.availability_percent}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about this period"
                  disabled={submitting}
                />
              </div>
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
                {submitting ? 'Saving...' : editingPeriod ? 'Update Period' : 'Add Period'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceAvailability;

