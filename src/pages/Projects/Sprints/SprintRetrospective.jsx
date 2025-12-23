import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Trash2, Calendar, Target } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import SprintRetrospectiveForm from './SprintRetrospectiveForm';

/**
 * Sprint Retrospective Page
 * 
 * Displays and manages sprint retrospective data including:
 * - What went well
 * - What could be improved
 * - Action items
 * - Team sentiment and rating
 */

const SprintRetrospective = () => {
  const { id: projectId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [retrospective, setRetrospective] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (sprintId) {
      fetchSprintData();
      fetchRetrospective();
    }
  }, [sprintId]);

  const fetchSprintData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single();

      if (fetchError) throw fetchError;
      setSprint(data);
    } catch (err) {
      console.error('Error fetching sprint:', err);
    }
  };

  const fetchRetrospective = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', sprintId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setRetrospective(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching retrospective:', err);
      setError('Failed to load retrospective');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this retrospective? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sprint_retrospectives')
        .delete()
        .eq('id', retrospective.id);

      if (error) throw error;
      setRetrospective(null);
    } catch (err) {
      console.error('Error deleting retrospective:', err);
      alert('Failed to delete retrospective. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    fetchRetrospective();
    setIsFormOpen(false);
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

  const getSentimentColor = (sentiment) => {
    const colorMap = {
      'Very Positive': 'text-green-600 bg-green-100 border-green-200',
      'Positive': 'text-green-600 bg-green-50 border-green-200',
      'Neutral': 'text-gray-600 bg-gray-100 border-gray-200',
      'Negative': 'text-red-600 bg-red-50 border-red-200',
      'Very Negative': 'text-red-600 bg-red-100 border-red-200',
    };
    return colorMap[sentiment] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getRatingStars = (rating) => {
    if (!rating) return '—';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading retrospective...</p>
        </div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Sprint not found'}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/sprints/${sprintId}`)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sprint
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
              <Link to={`/projects/${projectId}/sprints/${sprintId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{sprint.name} - Retrospective</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
              </div>
              {sprint.goal && (
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {sprint.goal}
                </div>
              )}
            </div>
          </div>
          {retrospective ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          ) : (
            <Button onClick={handleEdit}>
              <Plus className="w-4 h-4 mr-2" />
              Create Retrospective
            </Button>
          )}
        </div>
      </div>

      {/* Retrospective Content */}
      {retrospective ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Team Sentiment</div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium border ${getSentimentColor(retrospective.team_sentiment)}`}>
                  {retrospective.team_sentiment || 'Not Set'}
                </span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Sprint Rating</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {getRatingStars(retrospective.sprint_rating)}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Action Items</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {retrospective.action_items?.length || 0}
              </div>
            </div>
          </div>

          {/* What Went Well */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What Went Well</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {retrospective.what_went_well || 'No feedback provided.'}
              </p>
            </div>
          </div>

          {/* What Could Be Improved */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What Could Be Improved</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {retrospective.what_could_be_improved || 'No feedback provided.'}
              </p>
            </div>
          </div>

          {/* Action Items */}
          {retrospective.action_items && retrospective.action_items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
              <div className="space-y-3">
                {retrospective.action_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.item || 'Action item'}</p>
                        {item.owner_id && (
                          <p className="text-sm text-gray-500 mt-1">Owner: {item.owner_name || 'Unassigned'}</p>
                        )}
                        {item.due_date && (
                          <p className="text-sm text-gray-500 mt-1">Due: {formatDate(item.due_date)}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                        item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {retrospective.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{retrospective.notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">
              Retrospective Date: {formatDate(retrospective.retrospective_date)}
              {retrospective.updated_at && (
                <span className="ml-4">Last Updated: {formatDate(retrospective.updated_at)}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No retrospective has been created for this sprint yet.</p>
          <Button onClick={handleEdit}>
            <Plus className="w-4 h-4 mr-2" />
            Create Retrospective
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <SprintRetrospectiveForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        sprintId={sprintId}
        retrospective={retrospective}
      />
    </div>
  );
};

export default SprintRetrospective;

