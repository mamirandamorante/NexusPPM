import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import WorkItemForm from './WorkItemForm';

/**
 * Epic Detail Page
 * 
 * Shows detailed information about an Epic including:
 * - Epic details
 * - List of Features
 * - Progress metrics
 */

const EpicDetail = () => {
  const { id: projectId, epicId } = useParams();
  const navigate = useNavigate();
  const [epic, setEpic] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  useEffect(() => {
    if (epicId) {
      fetchEpicData();
    }
  }, [epicId]);

  const fetchEpicData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Epic
      const { data: epicData, error: epicError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('id', epicId)
        .eq('type', 'Epic')
        .single();

      if (epicError) throw epicError;
      setEpic(epicData);

      // Fetch Features
      const { data: featuresData, error: featuresError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('project_id', projectId)
        .eq('parent_id', epicId)
        .eq('type', 'Feature')
        .order('created_at', { ascending: false });

      if (featuresError) throw featuresError;
      setFeatures(featuresData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching epic data:', err);
      setError('Failed to load epic details');
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    setEditingFeature(null);
    setIsFormOpen(true);
  };

  const handleEditFeature = (feature) => {
    setEditingFeature(feature);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchEpicData();
    setIsFormOpen(false);
    setEditingFeature(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Backlog': 'bg-gray-100 text-gray-800 border-gray-200',
      'ToDo': 'bg-blue-100 text-blue-800 border-blue-200',
      'InProgress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'InReview': 'bg-purple-100 text-purple-800 border-purple-200',
      'Done': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading epic details...</p>
        </div>
      </div>
    );
  }

  if (error || !epic) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Epic not found'}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/epics`)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Epics
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
              <Link to={`/projects/${projectId}/epics`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{epic.title}</h1>
            </div>
            <p className="text-gray-600 text-sm">Epic Details and Features</p>
          </div>
          <Button onClick={handleAddFeature}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Epic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Epic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(epic.status)}`}>
                {epic.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Priority</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{epic.priority}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Description</label>
            <p className="text-sm text-gray-900 mt-1">{epic.description || '—'}</p>
          </div>
          {epic.acceptance_criteria && (
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 uppercase tracking-wide">Acceptance Criteria</label>
              <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{epic.acceptance_criteria}</p>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Progress</label>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${epic.completion_percent || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {epic.completion_percent || 0}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Story Points</label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {epic.completed_effort || 0} / {epic.total_effort || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Features ({features.length})</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Story Points</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No features yet. Click "Add Feature" to create one.
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature) => (
                <TableRow key={feature.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/features/${feature.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {feature.title}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {feature.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{feature.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(feature.status)}`}>
                      {feature.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${feature.completion_percent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {feature.completion_percent || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {feature.total_effort ? `${feature.completed_effort || 0} / ${feature.total_effort}` : '—'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleEditFeature(feature)}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Feature Form Dialog */}
      <WorkItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFeature(null);
        }}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        workItemType="Feature"
        editingItem={editingFeature}
        parentId={epicId}
      />
    </div>
  );
};

export default EpicDetail;

