'use client';

import { useEffect, useState } from 'react';
import { studentsAPI, coursesAPI, batchesAPI } from '@/lib/api';

interface Student {
  id: number;
  user: number;
  name: string;
  email: string;
  phone: string;
  enrollment_date: string;
  enrollments?: any[];
  // Personal Details
  photo_url?: string;
  date_of_birth?: string;
  gender?: string;
  nid_number?: string;
  birth_certificate_number?: string;
  nid_document_url?: string;
  birth_certificate_document_url?: string;
  // Address
  present_address?: string;
  permanent_address?: string;
  // Educational Info
  educational_qualification?: string;
  institution_name?: string;
  // Family Info
  father_name?: string;
  father_nid_number?: string;
  father_phone?: string;
  mother_name?: string;
  mother_nid_number?: string;
  mother_phone?: string;
  // Guardian Info
  guardian_name?: string;
  guardian_relation?: string;
  guardian_phone?: string;
  guardian_nid_number?: string;
  // Payment Info
  total_fees?: number;
  total_paid?: number;
  due_amount?: number;
  payment_status?: 'FULL_PAID' | 'PARTIAL' | 'UNPAID' | 'NO_COURSE';
}

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  enrollment_date: new Date().toISOString().split('T')[0],
  password: '',
  // Personal Details
  date_of_birth: '',
  gender: '',
  nid_number: '',
  birth_certificate_number: '',
  // Address
  present_address: '',
  permanent_address: '',
  // Educational Info
  educational_qualification: '',
  institution_name: '',
  // Family Info
  father_name: '',
  father_nid_number: '',
  father_phone: '',
  mother_name: '',
  mother_nid_number: '',
  mother_phone: '',
  // Guardian Info
  guardian_name: '',
  guardian_relation: '',
  guardian_phone: '',
  guardian_nid_number: '',
};

const EDUCATION_OPTIONS = [
  { value: '', label: 'Select Qualification' },
  { value: 'PSC', label: 'Primary School Certificate (PSC)' },
  { value: 'JSC', label: 'Junior School Certificate (JSC)' },
  { value: 'SSC', label: 'Secondary School Certificate (SSC)' },
  { value: 'HSC', label: 'Higher Secondary Certificate (HSC)' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'BACHELORS', label: "Bachelor's Degree" },
  { value: 'MASTERS', label: "Master's Degree" },
  { value: 'PHD', label: 'PhD' },
  { value: 'OTHER', label: 'Other' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState<{
    photo?: File;
    nid_document?: File;
    birth_certificate_document?: File;
  }>({});
  const [enrollData, setEnrollData] = useState({ course: '', batch: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');

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
      // Create FormData for file uploads
      const data = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      // Add files
      if (files.photo) data.append('photo', files.photo);
      if (files.nid_document) data.append('nid_document', files.nid_document);
      if (files.birth_certificate_document) data.append('birth_certificate_document', files.birth_certificate_document);

      if (editingStudent) {
        await studentsAPI.updateWithFiles(editingStudent.id, data);
        setSuccess('Student updated successfully!');
      } else {
        await studentsAPI.createWithFiles(data);
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
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      enrollment_date: student.enrollment_date || '',
      password: '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      nid_number: student.nid_number || '',
      birth_certificate_number: student.birth_certificate_number || '',
      present_address: student.present_address || '',
      permanent_address: student.permanent_address || '',
      educational_qualification: student.educational_qualification || '',
      institution_name: student.institution_name || '',
      father_name: student.father_name || '',
      father_nid_number: student.father_nid_number || '',
      father_phone: student.father_phone || '',
      mother_name: student.mother_name || '',
      mother_nid_number: student.mother_nid_number || '',
      mother_phone: student.mother_phone || '',
      guardian_name: student.guardian_name || '',
      guardian_relation: student.guardian_relation || '',
      guardian_phone: student.guardian_phone || '',
      guardian_nid_number: student.guardian_nid_number || '',
    });
    setFiles({});
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleViewDetails = (student: Student) => {
    setViewingStudent(student);
    setShowDetailsModal(true);
  };

  const openEnrollModal = (student: Student) => {
    setEnrollingStudent(student);
    setEnrollData({ course: '', batch: '' });
    setShowEnrollModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData(initialFormData);
    setFiles({});
    setActiveTab('basic');
    setError('');
  };

  const handleCloseEnrollModal = () => {
    setShowEnrollModal(false);
    setEnrollingStudent(null);
    setEnrollData({ course: '', batch: '' });
    setError('');
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'personal', label: 'Personal', icon: '📋' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
    { id: 'guardian', label: 'Guardian', icon: '🛡️' },
  ];

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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-retro-lavender to-retro-mint bg-clip-text text-transparent retro-font mb-2">
            Students
          </h1>
          <p className="text-gray-700 font-semibold text-lg">Manage student records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn-primary text-lg">
          ✨ Add Student
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="retro-input pl-12 w-full"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {students.filter(s =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.phone.includes(searchQuery)
            ).length} student(s) matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      <div className="retro-card overflow-x-auto">
        <table className="retro-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredStudents = students.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.phone.includes(searchQuery)
              );

              if (filteredStudents.length === 0) {
                return (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {searchQuery ? `No students found matching "${searchQuery}"` : 'No students found. Add your first student!'}
                    </td>
                  </tr>
                );
              }

              return filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-retro-lavender"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-retro-lavender to-retro-pink flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="font-semibold">{student.name}</td>
                  <td>{student.phone}</td>
                  <td>
                    {student.enrollments && student.enrollments.length > 0 ? (
                      <div className="space-y-1">
                        {student.enrollments.map((enrollment: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-gradient-to-r from-retro-lavender to-retro-lavender-light text-white rounded text-xs font-semibold mr-1"
                          >
                            {enrollment.course_details?.name || 'Course'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No course</span>
                    )}
                  </td>
                  <td>
                    {student.enrollments && student.enrollments.length > 0 ? (
                      <div className="space-y-1">
                        {student.enrollments.map((enrollment: any, idx: number) => (
                          enrollment.batch_details ? (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-gradient-to-r from-retro-blue to-retro-blue-light text-white rounded text-xs font-semibold mr-1 shadow-sm"
                            >
                              {enrollment.batch_details?.name || 'Batch'}
                            </span>
                          ) : (
                            <span key={idx} className="text-gray-400 text-xs block">No batch</span>
                          )
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td>
                    {student.payment_status === 'FULL_PAID' ? (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-bold shadow-sm">
                        ✓ Full Paid
                      </span>
                    ) : student.payment_status === 'PARTIAL' ? (
                      <div className="text-center">
                        <span className="px-3 py-1 bg-gradient-to-r from-retro-peach to-retro-peach-light text-white rounded-full text-sm font-bold shadow-sm block">
                          Due: ৳{student.due_amount?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 mt-1 block">
                          Paid: ৳{student.total_paid?.toLocaleString()}
                        </span>
                      </div>
                    ) : student.payment_status === 'UNPAID' ? (
                      <div className="text-center">
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-bold shadow-sm block">
                          Unpaid: ৳{student.total_fees?.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-sm font-bold shadow-sm">
                        No Course
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEnrollModal(student)}
                        className="px-3 py-1 bg-retro-mint text-white rounded hover:opacity-90 text-sm"
                      >
                        Enroll
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="px-3 py-1 bg-retro-peach text-white rounded hover:opacity-90 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:opacity-90 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold text-retro-lavender mb-4">
              {editingStudent ? 'Edit Student' : 'Create New Student'}
            </h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 border-b-2 border-gray-200 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-retro font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-retro-lavender to-retro-lavender-light text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="retro-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="retro-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="retro-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFiles({ ...files, photo: e.target.files?.[0] })}
                        className="retro-input"
                      />
                      {editingStudent?.photo_url && (
                        <p className="text-xs text-gray-500 mt-1">Current photo exists. Upload new to replace.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="retro-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="retro-input"
                      >
                        {GENDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NID Number</label>
                      <input
                        type="text"
                        value={formData.nid_number}
                        onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                        className="retro-input"
                        placeholder="National ID Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Birth Certificate Number</label>
                      <input
                        type="text"
                        value={formData.birth_certificate_number}
                        onChange={(e) => setFormData({ ...formData, birth_certificate_number: e.target.value })}
                        className="retro-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NID Document</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, nid_document: e.target.files?.[0] })}
                        className="retro-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Birth Certificate Document</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles({ ...files, birth_certificate_document: e.target.files?.[0] })}
                        className="retro-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Present Address</label>
                    <textarea
                      value={formData.present_address}
                      onChange={(e) => setFormData({ ...formData, present_address: e.target.value })}
                      className="retro-input"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                    <textarea
                      value={formData.permanent_address}
                      onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                      className="retro-input"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Educational Qualification</label>
                      <select
                        value={formData.educational_qualification}
                        onChange={(e) => setFormData({ ...formData, educational_qualification: e.target.value })}
                        className="retro-input"
                      >
                        {EDUCATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                      <input
                        type="text"
                        value={formData.institution_name}
                        onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                        className="retro-input"
                        placeholder="Last attended institution"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Family Tab */}
              {activeTab === 'family' && (
                <div className="space-y-6">
                  <div className="bg-retro-pink/10 p-4 rounded-retro">
                    <h3 className="text-lg font-bold text-retro-pink mb-4">Father&apos;s Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Father&apos;s Name</label>
                        <input
                          type="text"
                          value={formData.father_name}
                          onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Father&apos;s NID</label>
                        <input
                          type="text"
                          value={formData.father_nid_number}
                          onChange={(e) => setFormData({ ...formData, father_nid_number: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Father&apos;s Phone</label>
                        <input
                          type="tel"
                          value={formData.father_phone}
                          onChange={(e) => setFormData({ ...formData, father_phone: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-retro-mint/10 p-4 rounded-retro">
                    <h3 className="text-lg font-bold text-retro-mint mb-4">Mother&apos;s Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother&apos;s Name</label>
                        <input
                          type="text"
                          value={formData.mother_name}
                          onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother&apos;s NID</label>
                        <input
                          type="text"
                          value={formData.mother_nid_number}
                          onChange={(e) => setFormData({ ...formData, mother_nid_number: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mother&apos;s Phone</label>
                        <input
                          type="tel"
                          value={formData.mother_phone}
                          onChange={(e) => setFormData({ ...formData, mother_phone: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guardian Tab */}
              {activeTab === 'guardian' && (
                <div className="space-y-4">
                  <div className="bg-retro-lavender/10 p-4 rounded-retro">
                    <h3 className="text-lg font-bold text-retro-lavender mb-4">Guardian Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                        <input
                          type="text"
                          value={formData.guardian_name}
                          onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relation with Student</label>
                        <input
                          type="text"
                          value={formData.guardian_relation}
                          onChange={(e) => setFormData({ ...formData, guardian_relation: e.target.value })}
                          className="retro-input"
                          placeholder="e.g., Uncle, Aunt, Brother"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</label>
                        <input
                          type="tel"
                          value={formData.guardian_phone}
                          onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardian NID</label>
                        <input
                          type="text"
                          value={formData.guardian_nid_number}
                          onChange={(e) => setFormData({ ...formData, guardian_nid_number: e.target.value })}
                          className="retro-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6 mt-4 border-t-2 border-gray-200">
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

      {/* View Details Modal */}
      {showDetailsModal && viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-retro-lavender">Student Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Section */}
              <div className="md:col-span-1 text-center">
                {viewingStudent.photo_url ? (
                  <img
                    src={viewingStudent.photo_url}
                    alt={viewingStudent.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-retro-lavender"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-retro-lavender to-retro-pink flex items-center justify-center text-white font-bold text-4xl mx-auto">
                    {viewingStudent.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-xl font-bold mt-4">{viewingStudent.name}</h3>
                <p className="text-gray-600">{viewingStudent.email}</p>
                <p className="text-gray-600">{viewingStudent.phone}</p>
              </div>

              {/* Details Section */}
              <div className="md:col-span-2 space-y-6">
                {/* Personal Info */}
                <div className="bg-gray-50 p-4 rounded-retro">
                  <h4 className="font-bold text-retro-lavender mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">Date of Birth:</span> {viewingStudent.date_of_birth || 'N/A'}</p>
                    <p><span className="font-semibold">Gender:</span> {viewingStudent.gender === 'M' ? 'Male' : viewingStudent.gender === 'F' ? 'Female' : viewingStudent.gender === 'O' ? 'Other' : 'N/A'}</p>
                    <p><span className="font-semibold">NID:</span> {viewingStudent.nid_number || 'N/A'}</p>
                    <p><span className="font-semibold">Birth Cert:</span> {viewingStudent.birth_certificate_number || 'N/A'}</p>
                  </div>
                </div>

                {/* Education */}
                <div className="bg-gray-50 p-4 rounded-retro">
                  <h4 className="font-bold text-retro-mint mb-3">Education</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">Qualification:</span> {viewingStudent.educational_qualification || 'N/A'}</p>
                    <p><span className="font-semibold">Institution:</span> {viewingStudent.institution_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Family */}
                <div className="bg-gray-50 p-4 rounded-retro">
                  <h4 className="font-bold text-retro-pink mb-3">Family Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">Father:</span> {viewingStudent.father_name || 'N/A'}</p>
                    <p><span className="font-semibold">Father Phone:</span> {viewingStudent.father_phone || 'N/A'}</p>
                    <p><span className="font-semibold">Mother:</span> {viewingStudent.mother_name || 'N/A'}</p>
                    <p><span className="font-semibold">Mother Phone:</span> {viewingStudent.mother_phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Guardian */}
                <div className="bg-gray-50 p-4 rounded-retro">
                  <h4 className="font-bold text-retro-blue mb-3">Guardian Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">Name:</span> {viewingStudent.guardian_name || 'N/A'}</p>
                    <p><span className="font-semibold">Relation:</span> {viewingStudent.guardian_relation || 'N/A'}</p>
                    <p><span className="font-semibold">Phone:</span> {viewingStudent.guardian_phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-gray-50 p-4 rounded-retro">
                  <h4 className="font-bold text-retro-peach mb-3">Address</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="font-semibold">Present:</span> {viewingStudent.present_address || 'N/A'}</p>
                    <p><span className="font-semibold">Permanent:</span> {viewingStudent.permanent_address || 'N/A'}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className={`p-4 rounded-retro ${
                  viewingStudent.payment_status === 'FULL_PAID'
                    ? 'bg-green-50 border-2 border-green-200'
                    : viewingStudent.payment_status === 'PARTIAL'
                    ? 'bg-orange-50 border-2 border-orange-200'
                    : viewingStudent.payment_status === 'UNPAID'
                    ? 'bg-red-50 border-2 border-red-200'
                    : 'bg-gray-50'
                }`}>
                  <h4 className="font-bold text-retro-dark mb-3">💰 Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs uppercase">Total Fees</p>
                      <p className="text-xl font-bold text-retro-lavender">৳{viewingStudent.total_fees?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs uppercase">Total Paid</p>
                      <p className="text-xl font-bold text-green-600">৳{viewingStudent.total_paid?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs uppercase">Due Amount</p>
                      <p className={`text-xl font-bold ${viewingStudent.due_amount && viewingStudent.due_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ৳{viewingStudent.due_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-xs uppercase">Status</p>
                      <p className={`text-xl font-bold ${
                        viewingStudent.payment_status === 'FULL_PAID' ? 'text-green-600' :
                        viewingStudent.payment_status === 'PARTIAL' ? 'text-orange-600' :
                        viewingStudent.payment_status === 'UNPAID' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {viewingStudent.payment_status === 'FULL_PAID' ? '✓ Full Paid' :
                         viewingStudent.payment_status === 'PARTIAL' ? 'Partial' :
                         viewingStudent.payment_status === 'UNPAID' ? 'Unpaid' : 'No Course'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full retro-btn-secondary"
              >
                Close
              </button>
            </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch (Optional)</label>
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
