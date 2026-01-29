'use client';

import { useEffect, useState, useRef } from 'react';
import { invoicesAPI, studentsAPI, coursesAPI, batchesAPI } from '@/lib/api';

interface Invoice {
  id: number;
  invoice_number: string;
  student: number;
  student_details?: {
    name: string;
    email: string;
    phone: string;
    present_address?: string;
    total_fees?: number;
    total_paid?: number;
    due_amount?: number;
    payment_status?: string;
  };
  course: number;
  course_details?: {
    name: string;
    fee: string;
    duration: number;
    description?: string;
  };
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    batch: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

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

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${previewInvoice?.invoice_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              color: #333;
              background: white;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
            .invoice-container {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 3px solid #9D4EDD;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #9D4EDD;
            }
            .company-info {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
            .invoice-title {
              font-size: 36px;
              font-weight: bold;
              color: #333;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
            }
            .bill-to h3, .invoice-details h3 {
              font-size: 11px;
              color: #666;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .bill-to p, .invoice-details p {
              margin: 4px 0;
              font-size: 11px;
            }
            .invoice-details {
              text-align: right;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              background: #9D4EDD;
              color: white;
              padding: 12px 10px;
              text-align: left;
              font-size: 10px;
              text-transform: uppercase;
            }
            .items-table td {
              padding: 12px 10px;
              border-bottom: 1px solid #eee;
              font-size: 11px;
            }
            .items-table tr:nth-child(even) {
              background: #fafafa;
            }
            .totals {
              margin-left: auto;
              width: 250px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 11px;
            }
            .totals-row.total {
              border-top: 2px solid #9D4EDD;
              font-weight: bold;
              font-size: 14px;
              color: #9D4EDD;
            }
            .status-box {
              background: #00CBA9;
              color: white;
              text-align: center;
              padding: 12px;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .payment-info, .notes {
              margin: 15px 0;
            }
            .payment-info h4, .notes h4 {
              font-size: 11px;
              color: #666;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .payment-info p, .notes p {
              font-size: 10px;
              color: #666;
              margin: 3px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 9px;
              color: #999;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `৳${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.student_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.course_details?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-retro-peach to-retro-pink bg-clip-text text-transparent retro-font mb-2">
            Invoices
          </h1>
          <p className="text-gray-700 font-semibold text-lg">Generate and manage invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn-primary text-lg">
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by invoice number, student or course..."
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
      </div>

      <div className="retro-card overflow-x-auto">
        <table className="retro-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Amount</th>
              <th>Student Due</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {searchQuery ? `No invoices found matching "${searchQuery}"` : 'No invoices found. Generate your first invoice!'}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => {
                // Find student to get current due amount
                const student = students.find(s => s.id === invoice.student);
                const studentDue = student?.due_amount || 0;
                const paymentStatus = student?.payment_status;

                return (
                  <tr key={invoice.id}>
                    <td className="font-semibold text-retro-lavender">{invoice.invoice_number}</td>
                    <td>{invoice.student_details?.name || `Student ${invoice.student}`}</td>
                    <td>
                      <span className="px-2 py-1 bg-gradient-to-r from-retro-lavender to-retro-lavender-light text-white rounded text-xs font-semibold">
                        {invoice.course_details?.name || `Course ${invoice.course}`}
                      </span>
                    </td>
                    <td>
                      {invoice.batch_details?.name ? (
                        <span className="px-2 py-1 bg-gradient-to-r from-retro-blue to-retro-blue-light text-white rounded text-xs font-semibold">
                          {invoice.batch_details.name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="font-bold text-retro-mint">{formatCurrency(invoice.amount)}</td>
                    <td>
                      {paymentStatus === 'FULL_PAID' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                          ✓ Paid
                        </span>
                      ) : studentDue > 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          {formatCurrency(studentDue)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td>{formatDate(invoice.payment_date)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(invoice)}
                          className="px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90 text-sm"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(invoice.id, invoice.invoice_number)}
                          className="px-3 py-1 bg-retro-mint text-white rounded hover:opacity-90 text-sm"
                        >
                          Save PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
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

              {/* Student Due Information */}
              {formData.student && (() => {
                const selectedStudent = students.find(s => s.id.toString() === formData.student);
                if (!selectedStudent) return null;

                return (
                  <div className={`p-4 rounded-retro border-2 ${
                    selectedStudent.payment_status === 'FULL_PAID'
                      ? 'bg-green-50 border-green-300'
                      : selectedStudent.payment_status === 'PARTIAL'
                      ? 'bg-orange-50 border-orange-300'
                      : selectedStudent.payment_status === 'UNPAID'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {selectedStudent.name}&apos;s Payment Status
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Fees</p>
                        <p className="text-lg font-bold text-retro-lavender">
                          {formatCurrency(selectedStudent.total_fees || 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Paid</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(selectedStudent.total_paid || 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Due Amount</p>
                        <p className={`text-lg font-bold ${
                          (selectedStudent.due_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(selectedStudent.due_amount || 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                        <p className={`text-sm font-bold px-2 py-1 rounded ${
                          selectedStudent.payment_status === 'FULL_PAID'
                            ? 'bg-green-100 text-green-700'
                            : selectedStudent.payment_status === 'PARTIAL'
                            ? 'bg-orange-100 text-orange-700'
                            : selectedStudent.payment_status === 'UNPAID'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedStudent.payment_status === 'FULL_PAID' ? '✓ Full Paid' :
                           selectedStudent.payment_status === 'PARTIAL' ? 'Partial' :
                           selectedStudent.payment_status === 'UNPAID' ? 'Unpaid' : 'No Course'}
                        </p>
                      </div>
                    </div>
                    {(selectedStudent.due_amount || 0) > 0 && (
                      <p className="mt-3 text-sm text-gray-600 bg-white p-2 rounded">
                        💡 <strong>Tip:</strong> This student has a due of <strong className="text-red-600">{formatCurrency(selectedStudent.due_amount)}</strong>.
                        You can enter any amount for this payment.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => {
                    const selectedCourse = courses.find(c => c.id.toString() === e.target.value);
                    setFormData({
                      ...formData,
                      course: e.target.value,
                      amount: selectedCourse ? selectedCourse.fee : ''
                    });
                  }}
                  className="retro-input"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {formatCurrency(course.fee)}
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
                    Amount (৳) *
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

      {/* Invoice Preview Modal */}
      {showPreviewModal && previewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header with Actions */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                Invoice Preview - {previewInvoice.invoice_number}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-retro-blue text-white rounded-lg hover:opacity-90 font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => handleDownload(previewInvoice.id, previewInvoice.invoice_number)}
                  className="flex items-center gap-2 px-4 py-2 bg-retro-mint text-white rounded-lg hover:opacity-90 font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Invoice Content - A4 Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div
                ref={printRef}
                className="invoice-container bg-white mx-auto shadow-lg"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm',
                }}
              >
                {/* Header */}
                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '15px', borderBottom: '3px solid #9D4EDD' }}>
                  <div>
                    <div className="company-name" style={{ fontSize: '28px', fontWeight: 'bold', color: '#9D4EDD' }}>
                      Student Management System
                    </div>
                    <div className="company-info" style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                      123 Education Street, Learning City, LC 12345<br />
                      Phone: +1 (555) 123-4567 | Email: billing@sms.edu
                    </div>
                  </div>
                  <div className="invoice-title" style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>
                    INVOICE
                  </div>
                </div>

                {/* Bill To & Invoice Details */}
                <div className="info-section" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                  <div className="bill-to">
                    <h3 style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Bill To:</h3>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>{previewInvoice.student_details?.name}</p>
                    <p style={{ fontSize: '11px', margin: '4px 0', color: '#555' }}>{previewInvoice.student_details?.email}</p>
                    <p style={{ fontSize: '11px', margin: '4px 0', color: '#555' }}>{previewInvoice.student_details?.phone}</p>
                    {previewInvoice.student_details?.present_address && (
                      <p style={{ fontSize: '11px', margin: '4px 0', color: '#555' }}>{previewInvoice.student_details.present_address}</p>
                    )}
                  </div>
                  <div className="invoice-details" style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', margin: '4px 0' }}><strong>Invoice Number:</strong> {previewInvoice.invoice_number}</p>
                    <p style={{ fontSize: '11px', margin: '4px 0' }}><strong>Invoice Date:</strong> {formatDate(previewInvoice.created_at)}</p>
                    <p style={{ fontSize: '11px', margin: '4px 0' }}><strong>Payment Date:</strong> {formatDate(previewInvoice.payment_date)}</p>
                    <p style={{ fontSize: '11px', margin: '4px 0' }}><strong>Due Date:</strong> {formatDate(previewInvoice.payment_date)}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '25px 0' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>#</th>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Description</th>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Duration</th>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Rate</th>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '12px 10px', borderBottom: '1px solid #eee', fontSize: '11px' }}>1</td>
                      <td style={{ padding: '12px 10px', borderBottom: '1px solid #eee', fontSize: '11px' }}>
                        <strong>{previewInvoice.course_details?.name}</strong>
                        {previewInvoice.batch_details?.name && (
                          <><br /><span style={{ color: '#666' }}>Batch: {previewInvoice.batch_details.name}</span></>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'center' }}>
                        {previewInvoice.course_details?.duration} months
                      </td>
                      <td style={{ padding: '12px 10px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'right' }}>
                        {previewInvoice.course_details?.fee ? formatCurrency(previewInvoice.course_details.fee) : '-'}
                      </td>
                      <td style={{ padding: '12px 10px', borderBottom: '1px solid #eee', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(previewInvoice.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ marginLeft: 'auto', width: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '11px' }}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(previewInvoice.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '11px' }}>
                    <span>Tax (0%):</span>
                    <span>৳0.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', fontWeight: 'bold', borderTop: '2px solid #9D4EDD', color: '#9D4EDD' }}>
                    <span>TOTAL:</span>
                    <span>{formatCurrency(previewInvoice.amount)}</span>
                  </div>
                </div>

                {/* Student Account Summary */}
                {(() => {
                  const student = students.find(s => s.id === previewInvoice.student);
                  if (!student) return null;

                  return (
                    <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '5px', padding: '15px', margin: '20px 0' }}>
                      <h4 style={{ fontSize: '11px', color: '#666', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Student Account Summary
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'white', borderRadius: '5px' }}>
                          <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>Total Fees</p>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#9D4EDD' }}>{formatCurrency(student.total_fees || 0)}</p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'white', borderRadius: '5px' }}>
                          <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>Total Paid</p>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#00CBA9' }}>{formatCurrency(student.total_paid || 0)}</p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'white', borderRadius: '5px' }}>
                          <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>Balance Due</p>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', color: (student.due_amount || 0) > 0 ? '#dc3545' : '#00CBA9' }}>
                            {formatCurrency(student.due_amount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Payment Status */}
                {(() => {
                  const student = students.find(s => s.id === previewInvoice.student);
                  const isPaid = student?.payment_status === 'FULL_PAID';
                  const statusColor = isPaid ? '#00CBA9' : (student?.due_amount || 0) > 0 ? '#FF6B35' : '#00CBA9';
                  const statusText = isPaid ? 'FULLY PAID' : (student?.due_amount || 0) > 0 ? `BALANCE DUE: ${formatCurrency(student?.due_amount || 0)}` : 'PAID';

                  return (
                    <div style={{ background: statusColor, color: 'white', textAlign: 'center', padding: '12px', borderRadius: '5px', fontWeight: 'bold', margin: '25px 0', fontSize: '14px' }}>
                      {statusText}
                    </div>
                  );
                })()}

                {/* Payment Information */}
                <div style={{ margin: '20px 0' }}>
                  <h4 style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Payment Information</h4>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}><strong>Payment Method:</strong> Cash/Bank Transfer</p>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}><strong>Account Name:</strong> Student Management System</p>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}><strong>Bank:</strong> National Education Bank</p>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}><strong>Account Number:</strong> 1234-5678-9012-3456</p>
                </div>

                {/* Notes */}
                <div style={{ margin: '20px 0' }}>
                  <h4 style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Notes & Terms</h4>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}>1. This invoice is computer generated and does not require a signature.</p>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}>2. Please keep this invoice for your records.</p>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}>3. For any queries regarding this invoice, please contact our billing department.</p>
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}>4. Thank you for choosing our educational services!</p>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '9px', color: '#999' }}>
                  <p>Student Management System | www.sms.edu | billing@sms.edu</p>
                  <p>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>This is an electronically generated document.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
