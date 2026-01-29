'use client';

import { useEffect, useState } from 'react';
import { invoicesAPI, studentsAPI, coursesAPI, batchesAPI } from '@/lib/api';

interface Invoice {
  id: number;
  invoice_number: string;
  student: number;
  student_details?: { name: string; email: string };
  course: number;
  course_details?: { name: string };
  batch?: number;
  batch_details?: { name: string };
  amount: string;
  payment_date: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    batch: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, studentsRes, coursesRes, batchesRes] = await Promise.all([
        invoicesAPI.getAll(),
        studentsAPI.getAll(),
        coursesAPI.getAll(),
        batchesAPI.getAll(),
      ]);
      setInvoices(invoicesRes.data.results || invoicesRes.data);
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
      await invoicesAPI.create(formData);
      setSuccess('Invoice generated successfully!');
      fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to generate invoice');
    }
  };

  const handleDownload = async (id: number, invoiceNumber: string) => {
    try {
      const response = await invoicesAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download invoice');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      student: '',
      course: '',
      batch: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-lavender"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 retro-font mb-2">Invoices</h1>
          <p className="text-gray-600">Generate and manage invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn-primary">
          + Generate Invoice
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
              <th>Invoice #</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No invoices found. Generate your first invoice!
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-semibold">{invoice.invoice_number}</td>
                  <td>{invoice.student_details?.name || `Student ${invoice.student}`}</td>
                  <td>{invoice.course_details?.name || `Course ${invoice.course}`}</td>
                  <td>{invoice.batch_details?.name || '-'}</td>
                  <td>${invoice.amount}</td>
                  <td>{new Date(invoice.payment_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDownload(invoice.id, invoice.invoice_number)}
                      className="px-3 py-1 bg-retro-peach text-white rounded hover:opacity-90"
                    >
                      Download PDF
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
            <h2 className="text-2xl font-bold text-retro-peach mb-6">
              Generate New Invoice
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="retro-input"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
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
                      {course.name} - ${course.fee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch (Optional)
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="retro-input"
                >
                  <option value="">No batch</option>
                  {batches
                    .filter((b) => !formData.course || b.course.toString() === formData.course)
                    .map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="retro-input"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="retro-input"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-primary">
                  Generate Invoice
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
