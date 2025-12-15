import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Building2, Briefcase, Users, DollarSign, Calendar, User, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import DeleteResourceDialog from './DeleteResourceDialog';

/**
 * Resource Detail Page
 * 
 * Displays comprehensive information about a single resource including:
 * - Basic information (name, email, role, status)
 * - Company and type
 * - Business unit and resource manager
 * - Financial information (hourly rate)
 * - Availability
 * - Project assignments
 */

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [businessUnit, setBusinessUnit] = useState(null);
  const [resourceManager, setResourceManager] = useState(null);
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResourceData();
    }
  }, [id]);

  const fetchResourceData = async () => {
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
      if (!resourceData) {
        setError('Resource not found');
        setLoading(false);
        return;
      }

      setResource(resourceData);

      // Fetch business unit if exists
      if (resourceData.business_unit_id) {
        const { data: buData } = await supabase
          .from('business_units')
          .select('id, name, description')
          .eq('id', resourceData.business_unit_id)
          .single();
        setBusinessUnit(buData);
      }

      // Fetch resource manager if exists
      if (resourceData.resource_manager_id) {
        const { data: managerData } = await supabase
          .from('resources')
          .select('id, name, email')
          .eq('id', resourceData.resource_manager_id)
          .single();
        setResourceManager(managerData);
      }

      // Fetch project assignments
      const { data: assignmentsData } = await supabase
        .from('project_resources')
        .select(`
          *,
          project:projects(id, name, status, priority)
        `)
        .eq('resource_id', id);

      if (assignmentsData) {
        setProjectAssignments(assignmentsData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching resource data:', err);
      setError('Failed to load resource details');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatAvailability = (availability) => {
    if (availability == null) return 'Not set';
    return `${availability}%`;
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower === 'inactive') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    } else if (statusLower === 'on leave') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeBadgeClass = (type) => {
    const typeLower = (type || '').toLowerCase();
    if (typeLower === 'internal') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (typeLower === 'external') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDeleteSuccess = () => {
    navigate('/resources');
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div>
        <div className="mb-6">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Resource not found'}</p>
          <Link
            to="/resources"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{resource.name}</h1>
            <p className="text-gray-600 text-sm mt-1">Resource Details</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/resources/${resource.id}/availability`}>
              <Button variant="outline" size="sm">
                <CalendarDays className="w-4 h-4 mr-2" />
                View Availability
              </Button>
            </Link>
            <Link to="/resources">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit in List
              </Button>
            </Link>
            {resource.status !== 'Inactive' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{resource.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{resource.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Role
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{resource.role || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(resource.status)}`}
                  >
                    {resource.status || '—'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Type</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTypeBadgeClass(resource.type)}`}
                  >
                    {resource.type || '—'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Company
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{resource.company || '—'}</p>
              </div>
            </div>
          </div>

          {/* Organizational Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizational Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Business Unit</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {businessUnit?.name || '—'}
                </p>
                {businessUnit?.description && (
                  <p className="text-xs text-gray-500 mt-1">{businessUnit.description}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Resource Manager
                </label>
                {resourceManager ? (
                  <div className="mt-1">
                    <p className="text-sm font-medium text-gray-900">{resourceManager.name}</p>
                    <p className="text-xs text-gray-500">{resourceManager.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Assignments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Assignments</h2>
            {projectAssignments.length > 0 ? (
              <div className="space-y-3">
                {projectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/projects/${assignment.project_id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {assignment.project?.name || 'Unknown Project'}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>Role: {assignment.project_role}</span>
                          {assignment.allocated_hours && (
                            <span>• {assignment.allocated_hours} hours</span>
                          )}
                        </div>
                      </div>
                      {assignment.project && (
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                          {assignment.project.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No project assignments</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Hourly Rate</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatCurrency(resource.hourly_rate)}
                </p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Availability
            </h2>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Availability</label>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAvailability(resource.availability)}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              {resource.created_at && (
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {resource.updated_at && (
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(resource.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteResourceDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        resource={resource}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ResourceDetail;

