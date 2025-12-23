import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, FolderKanban, Calendar, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import ProjectForm from './ProjectForm';

/**
 * Project List Page
 * 
 * Features:
 * - Table view with columns: Name, Manager, Status, Priority, Start Date, End Date, Budget, Progress
 * - Search functionality (name, manager, sponsor)
 * - Filter by status and priority
 * - Pagination
 * - Sort by columns
 * - Actions: View Dashboard, View Epics, View Features
 */

const ITEMS_PER_PAGE = 10;

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sort states
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get unique values for filters
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [uniquePriorities, setUniquePriorities] = useState([]);

  // Form dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch projects from database
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters and pagination when data or filters change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [projects, searchQuery, statusFilter, priorityFilter, currentPage, sortColumn, sortDirection]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch projects with manager and sponsor info
      const { data: projectsData, error: fetchError } = await supabase
        .from('vw_project_overview')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError('Failed to load projects');
        setLoading(false);
        return;
      }

      setProjects(projectsData || []);

      // Extract unique statuses and priorities for filters
      const statuses = [...new Set((projectsData || []).map(p => p.status).filter(Boolean))];
      const priorities = [...new Set((projectsData || []).map(p => p.priority).filter(Boolean))];
      
      setUniqueStatuses(statuses.sort());
      setUniquePriorities(priorities.sort());

      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = useCallback(() => {
    // Filter projects
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(query) ||
        project.manager_name?.toLowerCase().includes(query) ||
        project.sponsor_name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Calculate pagination
    const total = filtered.length;
    setTotalFilteredCount(total);
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    setTotalPages(pages || 1);

    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredProjects(paginated);
  }, [projects, searchQuery, statusFilter, priorityFilter, currentPage, sortColumn, sortDirection]);

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

  const formatCurrency = (amount) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active' || statusLower === 'in progress') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (statusLower === 'completed' || statusLower === 'done') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower === 'on hold' || statusLower === 'paused') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityLower = (priority || '').toLowerCase();
    if (priorityLower === 'critical' || priorityLower === 'high') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (priorityLower === 'medium') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (priorityLower === 'low') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const SortableHeader = ({ column, children, className = '' }) => (
    <TableHead
      className={`cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && (
          <span className="text-xs text-gray-400">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchProjects} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track all projects</p>
          </div>
          <Button onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
          }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects, managers, sponsors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          {uniquePriorities.map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>

      {/* Projects Table - Borderless Design with Shadow */}
      <style>{`
        div.project-table-wrapper.bg-white.rounded-lg {
          border: none !important;
          border-width: 0 !important;
          border-style: none !important;
          border-color: transparent !important;
          outline: none !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg > div {
          border: none !important;
          border-width: 0 !important;
          border-style: none !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg table {
          border: none !important;
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          border-bottom: none !important;
          border-width: 0 !important;
          border-style: none !important;
          border-collapse: collapse !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg table tbody tr {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg table tbody tr:last-child {
          border-bottom: none !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg table tbody td {
          border: none !important;
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          border-bottom: none !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg table thead th {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          border-bottom: none !important;
        }
        div.project-table-wrapper.bg-white.rounded-lg table thead tr {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          border-bottom: 1px solid #d1d5db !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
      <div 
        className="project-table-wrapper bg-white rounded-lg" 
        style={{ 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: 'none',
          borderWidth: '0px',
          borderStyle: 'none',
          borderColor: 'transparent',
          outline: 'none'
        }}
      >
        <div className="overflow-x-auto" style={{ border: '0', borderWidth: '0' }}>
          <Table className="border-0" style={{ border: '0', borderWidth: '0' }}>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <SortableHeader column="name" className="px-6 py-4">Project Name</SortableHeader>
                <SortableHeader column="manager_name" className="px-6 py-4">Manager</SortableHeader>
                <SortableHeader column="status" className="px-6 py-4">Status</SortableHeader>
                <SortableHeader column="priority" className="px-6 py-4">Priority</SortableHeader>
                <SortableHeader column="start_date" className="px-6 py-4">Start Date</SortableHeader>
                <SortableHeader column="end_date" className="px-6 py-4">End Date</SortableHeader>
                <SortableHeader column="budget" className="px-6 py-4">Budget</SortableHeader>
                <TableHead className="px-6 py-4">Progress</TableHead>
                <TableHead className="px-6 py-4 w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500 px-6">
                    {projects.length === 0 
                      ? 'No projects found. Create a project to get started.'
                      : 'No projects match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project, index) => (
                  <TableRow 
                    key={project.id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {project.name}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 px-6 py-4">{project.manager_name || '—'}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(project.status)}`}>
                        {project.status || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityBadgeClass(project.priority)}`}>
                        {project.priority || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">{formatDate(project.start_date)}</TableCell>
                    <TableCell className="px-6 py-4">{formatDate(project.end_date)}</TableCell>
                    <TableCell className="px-6 py-4">{formatCurrency(project.budget)}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.completed_milestones && project.total_milestones ? Math.round((project.completed_milestones / project.total_milestones) * 100) : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {project.completed_milestones && project.total_milestones 
                            ? Math.round((project.completed_milestones / project.total_milestones) * 100)
                            : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/projects/${project.id}`}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="View Dashboard"
                        >
                          <FolderKanban className="w-4 h-4 text-blue-600" />
                        </Link>
                        <Link
                          to={`/projects/${project.id}/epics`}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="View Epics"
                        >
                          <Layers className="w-4 h-4 text-purple-600" />
                        </Link>
                        <Link
                          to={`/projects/${project.id}/features`}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="View Features"
                        >
                          <Calendar className="w-4 h-4 text-green-600" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredCount)} of{' '}
            {totalFilteredCount} projects
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSuccess={() => {
          fetchProjects();
        }}
      />
    </div>
  );
};

export default ProjectList;
