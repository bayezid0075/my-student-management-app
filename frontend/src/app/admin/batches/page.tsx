'use client';

import { useEffect, useState } from 'react';
import { batchesAPI, coursesAPI } from '@/lib/api';

interface Batch {
  id: number;
  name: string;
  course: number;
  course_details?: { id: number; name: string };
  start_date: string;
  end_date: string;
  instructor_name: string;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    start_date: '',
    end_date: '',
    instructor_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, coursesRes] = await Promise.all([
        batchesAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      setBatches(batchesRes.data.results || batchesRes.data);
      setCourses(coursesRes.data.results || coursesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingBatch) {
        await batchesAPI.update(editingBatch.id, formData);
        setSuccess('Batch updated successfully!');
      } else {
        await batchesAPI.create(formData);
        setSuccess('Batch created successfully!');
      }
      fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save batch');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      try {
        await batchesAPI.delete(id);
        setSuccess('Batch deleted successfully!');
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete batch');
      }
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      course: batch.course.toString(),
      start_date: batch.start_date,
      end_date: batch.end_date,
      instructor_name: batch.instructor_name,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBatch(null);
    setFormData({
      name: '',
      course: '',
      start_date: '',
      end_date: '',
      instructor_name: '',
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-lavender"></div>
          <p className="mt-4 text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 retro-font mb-2">Batches</h1>
          <p className="text-gray-600">Manage course batches</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn-primary">
          + Add Batch
        </button>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-retro text-green-700">
          {success}
        </div>
      )}

      {error && !showModal && (
        <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700">
          {error}
        </div>
      )}

      <div className="retro-card overflow-x-auto">
        <table className="retro-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Instructor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No batches found. Create your first batch!
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.id}>
                  <td className="font-semibold">{batch.name}</td>
                  <td>{batch.course_details?.name || `Course ${batch.course}`}</td>
                  <td>{new Date(batch.start_date).toLocaleDateString()}</td>
                  <td>{new Date(batch.end_date).toLocaleDateString()}</td>
                  <td>{batch.instructor_name}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(batch)}
                      className="mr-2 px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:opacity-90"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-retro-lavender mb-6">
              {editingBatch ? 'Edit Batch' : 'Create New Batch'}
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="retro-input"
                  placeholder="e.g., Batch 2024-A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="retro-input"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="retro-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="retro-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  className="retro-input"
                  placeholder="e.g., Dr. Jane Smith"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-primary">
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 retro-btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
