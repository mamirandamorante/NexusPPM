import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Edit, Trash2, MoreVertical, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import ResourceForm from './ResourceForm';
import DeleteResourceDialog from './DeleteResourceDialog';

/**
 * Resource List Page
 * 
 * Features:
 * - Table view with columns: Name, Email, Role, Status, Hourly Rate, Availability
 * - Search functionality (name, email)
 * - Filter by status and role
 * - Pagination
 * - Sort by columns
 * - Actions: Edit, Delete (to be implemented)
 */

const ITEMS_PER_PAGE = 10;

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sort states
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get unique values for filters
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [uniqueRoles, setUniqueRoles] = useState([]);

  // Form dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  // Fetch resources from database
  useEffect(() => {
    fetchResources();
  }, []);

  // Apply filters and pagination when data or filters change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [resources, searchQuery, statusFilter, roleFilter, currentPage, sortColumn, sortDirection]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch resources
      const { data: resourcesData, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        console.error('Error fetching resources:', fetchError);
        setError('Failed to load resources');
        setLoading(false);
        return;
      }

      // Fetch business units and resource managers separately for joins
      const businessUnitIds = [...new Set((resourcesData || []).map(r => r.business_unit_id).filter(Boolean))];
      const managerIds = [...new Set((resourcesData || []).map(r => r.resource_manager_id).filter(Boolean))];

      // Fetch business units
      let businessUnitsMap = {};
      if (businessUnitIds.length > 0) {
        const { data: buData } = await supabase
          .from('business_units')
          .select('id, name')
          .in('id', businessUnitIds);
        
        if (buData) {
          businessUnitsMap = buData.reduce((acc, bu) => {
            acc[bu.id] = bu.name;
            return acc;
          }, {});
        }
      }

      // Fetch resource managers
      let managersMap = {};
      if (managerIds.length > 0) {
        const { data: managerData } = await supabase
          .from('resources')
          .select('id, name')
          .in('id', managerIds);
        
        if (managerData) {
          managersMap = managerData.reduce((acc, manager) => {
            acc[manager.id] = manager.name;
            return acc;
          }, {});
        }
      }

      // Flatten the data with joined names
      const flattenedData = (resourcesData || []).map(resource => ({
        ...resource,
        business_unit_name: resource.business_unit_id ? businessUnitsMap[resource.business_unit_id] || null : null,
        resource_manager_name: resource.resource_manager_id ? managersMap[resource.resource_manager_id] || null : null,
      }));

      setResources(flattenedData);

      // Extract unique values for filters
      // Normalize statuses to avoid duplicates (case-insensitive)
      const statuses = [...new Set((flattenedData || []).map(r => r.status).filter(Boolean).map(s => {
        // Normalize to title case
        if (s.toLowerCase() === 'active') return 'Active';
        if (s.toLowerCase() === 'inactive') return 'Inactive';
        return s;
      }))];
      const roles = [...new Set((flattenedData || []).map(r => r.role).filter(Boolean))];
      setUniqueStatuses(statuses.sort());
      setUniqueRoles(roles.sort());

      setLoading(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load resources');
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = useCallback(() => {
    let filtered = [...resources];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.name?.toLowerCase().includes(query) ||
        resource.email?.toLowerCase().includes(query) ||
        resource.company?.toLowerCase().includes(query) ||
        resource.business_unit_name?.toLowerCase().includes(query) ||
        resource.resource_manager_name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter (case-insensitive matching)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(resource => 
        resource.status && resource.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(resource => resource.role === roleFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    // Calculate pagination
    const total = filtered.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    setTotalPages(pages || 1);

    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredResources(paginated);
  }, [resources, searchQuery, statusFilter, roleFilter, currentPage, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddResource = () => {
    console.log('Add Resource clicked');
    setEditingResource(null);
    setIsFormOpen(true);
    console.log('Form should be open:', true);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    // Refresh the resource list after successful save
    fetchResources();
    setIsFormOpen(false);
    setEditingResource(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingResource(null);
  };

  const handleDeleteResource = (resource) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchResources();
    setIsDeleteDialogOpen(false);
    setResourceToDelete(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
    setResourceToDelete(null);
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatAvailability = (availability) => {
    if (availability == null) return '—';
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

  const SortableHeader = ({ column, children }) => {
    const isActive = sortColumn === column;
    return (
      <TableHead
        className="cursor-pointer select-none hover:bg-gray-50"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isActive && (
            <span className="text-gray-400 text-xs">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </TableHead>
    );
  };

  // Calculate total count for display
  const getTotalFilteredCount = () => {
    let filtered = [...resources];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.name?.toLowerCase().includes(query) ||
        resource.email?.toLowerCase().includes(query) ||
        resource.company?.toLowerCase().includes(query) ||
        resource.business_unit_name?.toLowerCase().includes(query) ||
        resource.resource_manager_name?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(resource => resource.status === statusFilter);
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(resource => resource.role === roleFilter);
    }
    return filtered.length;
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
          <p className="text-gray-600 text-sm mt-1">Manage team members and resources</p>
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
          <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
          <p className="text-gray-600 text-sm mt-1">Manage team members and resources</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchResources}
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
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
            <p className="text-gray-600 text-sm mt-1">Manage team members and resources</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/resources/rates"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Rate Cards
            </Link>
            <button
              onClick={handleAddResource}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredResources.length} of {getTotalFilteredCount()} resources
          {getTotalFilteredCount() !== resources.length && ` (${resources.length} total)`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="name">Name</SortableHeader>
              <SortableHeader column="email">Email</SortableHeader>
              <SortableHeader column="role">Role</SortableHeader>
              <SortableHeader column="type">Type</SortableHeader>
              <SortableHeader column="company">Company</SortableHeader>
              <SortableHeader column="business_unit_name">Business Unit</SortableHeader>
              <SortableHeader column="resource_manager_name">Resource Manager</SortableHeader>
              <SortableHeader column="status">Status</SortableHeader>
              <SortableHeader column="hourly_rate">Hourly Rate</SortableHeader>
              <SortableHeader column="availability">Availability</SortableHeader>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                  {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'No resources match your filters'
                    : 'No resources found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredResources.map((resource) => (
                <TableRow key={resource.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <Link
                      to={`/resources/${resource.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {resource.name || '—'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">{resource.email || '—'}</TableCell>
                  <TableCell>{resource.role || '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {resource.type || '—'}
                    </span>
                  </TableCell>
                  <TableCell>{resource.company || '—'}</TableCell>
                  <TableCell>{resource.business_unit_name || '—'}</TableCell>
                  <TableCell>{resource.resource_manager_name || '—'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(resource.status)}`}
                    >
                      {resource.status || '—'}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(resource.hourly_rate)}</TableCell>
                  <TableCell>{formatAvailability(resource.availability)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/resources/${resource.id}/availability`}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="View Availability"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </Link>
                      <button
                        onClick={() => handleEditResource(resource)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-lg text-sm ${
                          currentPage === page
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resource Form Dialog */}
      <ResourceForm
        open={isFormOpen}
        onClose={handleFormClose}
        resource={editingResource}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteResourceDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        resource={resourceToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default ResourceList;
