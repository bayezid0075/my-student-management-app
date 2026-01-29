'use client';

import { useEffect, useState } from 'react';
import { studentsAPI, coursesAPI, batchesAPI, authAPI } from '@/lib/api';

interface Student {
  id: number;
  user: number;
  name: string;
  email: string;
  phone: string;
  enrollment_date: string;
  enrollments?: any[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    password: '',
  });
  const [enrollData, setEnrollData] = useState({
    course: '',
    batch: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes, batchesRes] = await Promise.all([
        studentsAPI.getAll(),
        coursesAPI.getAll(),
        batchesAPI.getAll(),
      ]);
      setStudents(studentsRes.data.results || studentsRes.data);
      setCourses(coursesRes.data.results || coursesRes.data);
      setBatches(batchesRes.data.results || batchesRes.data);
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
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, formData);
        setSuccess('Student updated successfully!');
      } else {
        await studentsAPI.create(formData);
        setSuccess('Student created successfully!');
      }
      fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save student');
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingStudent) return;

    setError('');
    setSuccess('');

    try {
      // Convert field names to match backend expectations
      const enrollmentData = {
        course_id: parseInt(enrollData.course),
        batch_id: enrollData.batch ? parseInt(enrollData.batch) : null,
      };
      await studentsAPI.enroll(enrollingStudent.id, enrollmentData);
      setSuccess('Student enrolled successfully!');
      fetchData();
      handleCloseEnrollModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to enroll student');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        setSuccess('Student deleted successfully!');
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete student');
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      enrollment_date: student.enrollment_date,
      password: '',
    });
    setShowModal(true);
  };

  const openEnrollModal = (student: Student) => {
    setEnrollingStudent(student);
    setEnrollData({ course: '', batch: '' });
    setShowEnrollModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      password: '',
    });
    setError('');
  };

  const handleCloseEnrollModal = () => {
    setShowEnrollModal(false);
    setEnrollingStudent(null);
    setEnrollData({ course: '', batch: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-lavender"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 retro-font mb-2">Students</h1>
          <p className="text-gray-600">Manage student records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn-primary">
          + Add Student
        </button>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-retro text-green-700">
          {success}
        </div>
      )}

      {error && !showModal && !showEnrollModal && (
        <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700">
          {error}
        </div>
      )}

      <div className="retro-card overflow-x-auto">
        <table className="retro-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Enrollment Date</th>
              <th>Enrollments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No students found. Add your first student!
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="font-semibold">{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                  <td>{student.enrollments?.length || 0} courses</td>
                  <td>
                    <button
                      onClick={() => openEnrollModal(student)}
                      className="mr-2 px-3 py-1 bg-retro-mint text-white rounded hover:opacity-90 text-sm"
                    >
                      Enroll
                    </button>
                    <button
                      onClick={() => handleEdit(student)}
                      className="mr-2 px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-retro-lavender mb-6">
              {editingStudent ? 'Edit Student' : 'Create New Student'}
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="retro-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="retro-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="retro-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Date *
                </label>
                <input
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                  className="retro-input"
                  required
                />
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="retro-input"
                    required={!editingStudent}
                    placeholder="Minimum 8 characters"
                  />
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-primary">
                  {editingStudent ? 'Update Student' : 'Create Student'}
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

      {/* Enroll Modal */}
      {showEnrollModal && enrollingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-md w-full">
            <h2 className="text-2xl font-bold text-retro-mint mb-4">
              Enroll {enrollingStudent.name}
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={enrollData.course}
                  onChange={(e) => setEnrollData({ ...enrollData, course: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch (Optional)
                </label>
                <select
                  value={enrollData.batch}
                  onChange={(e) => setEnrollData({ ...enrollData, batch: e.target.value })}
                  className="retro-input"
                >
                  <option value="">No batch</option>
                  {batches
                    .filter((b) => !enrollData.course || b.course.toString() === enrollData.course)
                    .map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-success">
                  Enroll Student
                </button>
                <button
                  type="button"
                  onClick={handleCloseEnrollModal}
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
