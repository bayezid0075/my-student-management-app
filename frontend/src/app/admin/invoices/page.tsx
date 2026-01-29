'use client';

import { useEffect, useState, useRef } from 'react';
import { invoicesAPI, customInvoicesAPI, studentsAPI, coursesAPI, batchesAPI } from '@/lib/api';

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

interface CustomInvoice {
  id: number;
  invoice_number: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_address?: string;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  subtotal: string;
  tax_percentage: string;
  tax_amount: string;
  discount: string;
  total_amount: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
}

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<'student' | 'custom'>('student');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customInvoices, setCustomInvoices] = useState<CustomInvoice[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCustomPreviewModal, setShowCustomPreviewModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewCustomInvoice, setPreviewCustomInvoice] = useState<CustomInvoice | null>(null);

  // Student invoice form
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    batch: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  // Custom invoice form
  const [customFormData, setCustomFormData] = useState({
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    items: [{ name: '', quantity: 1, unit_price: 0 }] as InvoiceItem[],
    tax_percentage: 0,
    discount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
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
      const [invoicesRes, customInvoicesRes, studentsRes, coursesRes, batchesRes] = await Promise.all([
        invoicesAPI.getAll(),
        customInvoicesAPI.getAll(),
        studentsAPI.getAll(),
        coursesAPI.getAll(),
        batchesAPI.getAll(),
      ]);
      setInvoices(invoicesRes.data.results || invoicesRes.data);
      setCustomInvoices(customInvoicesRes.data.results || customInvoicesRes.data);
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

  // Student invoice handlers
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

  // Custom invoice handlers
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Calculate total
    const subtotal = customFormData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (customFormData.tax_percentage / 100);
    const total = subtotal + taxAmount - customFormData.discount;

    try {
      await customInvoicesAPI.create({
        ...customFormData,
        total_amount: total,
      });
      setSuccess('Custom invoice generated successfully!');
      fetchData();
      handleCloseCustomModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to generate custom invoice');
    }
  };

  const handleCustomDownload = async (id: number, invoiceNumber: string) => {
    try {
      const response = await customInvoicesAPI.download(id);
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

  const handleDeleteCustomInvoice = async (id: number) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await customInvoicesAPI.delete(id);
        setSuccess('Invoice deleted successfully!');
        fetchData();
      } catch (err: any) {
        setError('Failed to delete invoice');
      }
    }
  };

  // Item management for custom invoice
  const addItem = () => {
    setCustomFormData({
      ...customFormData,
      items: [...customFormData.items, { name: '', quantity: 1, unit_price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (customFormData.items.length > 1) {
      setCustomFormData({
        ...customFormData,
        items: customFormData.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...customFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCustomFormData({ ...customFormData, items: newItems });
  };

  // Calculate totals for custom invoice form
  const calculateSubtotal = () => {
    return customFormData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (customFormData.tax_percentage / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - customFormData.discount;
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleCustomPreview = (invoice: CustomInvoice) => {
    setPreviewCustomInvoice(invoice);
    setShowCustomPreviewModal(true);
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
          <title>Invoice</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; font-size: 12px; color: #333; background: white; }
            @page { size: A4; margin: 15mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
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

  const handleCloseCustomModal = () => {
    setShowCustomModal(false);
    setCustomFormData({
      recipient_name: '',
      recipient_email: '',
      recipient_phone: '',
      recipient_address: '',
      items: [{ name: '', quantity: 1, unit_price: 0 }],
      tax_percentage: 0,
      discount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
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

  // Filter invoices
  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.student_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.course_details?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomInvoices = customInvoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.recipient_name.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="retro-btn-primary text-lg">
            + Student Invoice
          </button>
          <button onClick={() => setShowCustomModal(true)} className="retro-btn-success text-lg">
            + Custom Invoice
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-retro text-green-700">
          {success}
        </div>
      )}

      {error && !showModal && !showCustomModal && (
        <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('student')}
          className={`px-6 py-3 rounded-retro font-bold transition-all ${
            activeTab === 'student'
              ? 'bg-gradient-to-r from-retro-lavender to-retro-lavender-light text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Student Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-6 py-3 rounded-retro font-bold transition-all ${
            activeTab === 'custom'
              ? 'bg-gradient-to-r from-retro-mint to-retro-mint-light text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom Invoices ({customInvoices.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder={activeTab === 'student' ? "Search by invoice number, student or course..." : "Search by invoice number or recipient..."}
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

      {/* Student Invoices Table */}
      {activeTab === 'student' && (
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
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">✓ Paid</span>
                        ) : studentDue > 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">{formatCurrency(studentDue)}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td>{formatDate(invoice.payment_date)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handlePreview(invoice)} className="px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90 text-sm">Preview</button>
                          <button onClick={() => handleDownload(invoice.id, invoice.invoice_number)} className="px-3 py-1 bg-retro-mint text-white rounded hover:opacity-90 text-sm">Save PDF</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Invoices Table */}
      {activeTab === 'custom' && (
        <div className="retro-card overflow-x-auto">
          <table className="retro-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Recipient</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery ? `No invoices found matching "${searchQuery}"` : 'No custom invoices found. Create your first custom invoice!'}
                  </td>
                </tr>
              ) : (
                filteredCustomInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-semibold text-retro-mint">{invoice.invoice_number}</td>
                    <td>
                      <div>
                        <p className="font-semibold">{invoice.recipient_name}</p>
                        {invoice.recipient_email && <p className="text-xs text-gray-500">{invoice.recipient_email}</p>}
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 bg-gradient-to-r from-retro-peach to-retro-peach-light text-white rounded text-xs font-semibold">
                        {invoice.items.length} item(s)
                      </span>
                    </td>
                    <td className="font-bold text-retro-lavender">{formatCurrency(invoice.total_amount)}</td>
                    <td>{formatDate(invoice.payment_date)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleCustomPreview(invoice)} className="px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90 text-sm">Preview</button>
                        <button onClick={() => handleCustomDownload(invoice.id, invoice.invoice_number)} className="px-3 py-1 bg-retro-mint text-white rounded hover:opacity-90 text-sm">Save PDF</button>
                        <button onClick={() => handleDeleteCustomInvoice(invoice.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:opacity-90 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-retro-peach mb-6">Generate Student Invoice</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="retro-input"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                  ))}
                </select>
              </div>

              {/* Student Due Info */}
              {formData.student && (() => {
                const selectedStudent = students.find(s => s.id.toString() === formData.student);
                if (!selectedStudent) return null;

                return (
                  <div className={`p-4 rounded-retro border-2 ${
                    selectedStudent.payment_status === 'FULL_PAID' ? 'bg-green-50 border-green-300' :
                    selectedStudent.payment_status === 'PARTIAL' ? 'bg-orange-50 border-orange-300' :
                    selectedStudent.payment_status === 'UNPAID' ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <h4 className="font-bold text-gray-700 mb-3">{selectedStudent.name}&apos;s Payment Status</h4>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Total Fees</p>
                        <p className="font-bold text-retro-lavender">{formatCurrency(selectedStudent.total_fees || 0)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Total Paid</p>
                        <p className="font-bold text-green-600">{formatCurrency(selectedStudent.total_paid || 0)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Due Amount</p>
                        <p className={`font-bold ${(selectedStudent.due_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(selectedStudent.due_amount || 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-bold text-sm">{selectedStudent.payment_status === 'FULL_PAID' ? '✓ Paid' : selectedStudent.payment_status}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                <select
                  value={formData.course}
                  onChange={(e) => {
                    const selectedCourse = courses.find(c => c.id.toString() === e.target.value);
                    setFormData({ ...formData, course: e.target.value, amount: selectedCourse ? selectedCourse.fee : '' });
                  }}
                  className="retro-input"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name} - {formatCurrency(course.fee)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch (Optional)</label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="retro-input"
                >
                  <option value="">No batch</option>
                  {batches.filter((b) => !formData.course || b.course.toString() === formData.course).map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (৳) *</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="retro-input" min="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} className="retro-input" required />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-primary">Generate Invoice</button>
                <button type="button" onClick={handleCloseModal} className="flex-1 retro-btn bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Invoice Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-retro-mint mb-6">Create Custom Invoice</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-retro text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={handleCustomSubmit} className="space-y-6">
              {/* Recipient Info */}
              <div className="bg-gray-50 p-4 rounded-retro">
                <h3 className="font-bold text-gray-700 mb-4">Recipient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name *</label>
                    <input type="text" value={customFormData.recipient_name} onChange={(e) => setCustomFormData({ ...customFormData, recipient_name: e.target.value })} className="retro-input" required placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={customFormData.recipient_email} onChange={(e) => setCustomFormData({ ...customFormData, recipient_email: e.target.value })} className="retro-input" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={customFormData.recipient_phone} onChange={(e) => setCustomFormData({ ...customFormData, recipient_phone: e.target.value })} className="retro-input" placeholder="Phone number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input type="text" value={customFormData.recipient_address} onChange={(e) => setCustomFormData({ ...customFormData, recipient_address: e.target.value })} className="retro-input" placeholder="Address" />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 p-4 rounded-retro">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Items</h3>
                  <button type="button" onClick={addItem} className="px-3 py-1 bg-retro-mint text-white rounded text-sm hover:opacity-90">+ Add Item</button>
                </div>

                <div className="space-y-3">
                  {customFormData.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end bg-white p-3 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Item Name *</label>
                        <input type="text" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} className="retro-input" placeholder="Item description" required />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-gray-500 mb-1">Qty *</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="retro-input" required />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs text-gray-500 mb-1">Unit Price *</label>
                        <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="retro-input" required />
                      </div>
                      <div className="w-28 text-right">
                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                        <p className="py-3 font-bold text-retro-lavender">{formatCurrency(item.quantity * item.unit_price)}</p>
                      </div>
                      {customFormData.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="px-2 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Other */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Percentage (%)</label>
                    <input type="number" min="0" step="0.01" value={customFormData.tax_percentage} onChange={(e) => setCustomFormData({ ...customFormData, tax_percentage: parseFloat(e.target.value) || 0 })} className="retro-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (৳)</label>
                    <input type="number" min="0" step="0.01" value={customFormData.discount} onChange={(e) => setCustomFormData({ ...customFormData, discount: parseFloat(e.target.value) || 0 })} className="retro-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                    <input type="date" value={customFormData.payment_date} onChange={(e) => setCustomFormData({ ...customFormData, payment_date: e.target.value })} className="retro-input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea value={customFormData.notes} onChange={(e) => setCustomFormData({ ...customFormData, notes: e.target.value })} className="retro-input" rows={3} placeholder="Additional notes..." />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-retro-lavender/10 to-retro-mint/10 p-6 rounded-retro">
                  <h3 className="font-bold text-gray-700 mb-4">Invoice Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({customFormData.tax_percentage}%):</span>
                      <span className="font-semibold">{formatCurrency(calculateTax())}</span>
                    </div>
                    {customFormData.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span className="font-semibold">-{formatCurrency(customFormData.discount)}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-retro-lavender pt-3 flex justify-between">
                      <span className="text-lg font-bold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-retro-lavender">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-success">Generate Custom Invoice</button>
                <button type="button" onClick={handleCloseCustomModal} className="flex-1 retro-btn bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Invoice Preview Modal */}
      {showPreviewModal && previewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Invoice Preview - {previewInvoice.invoice_number}</h2>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-retro-blue text-white rounded-lg hover:opacity-90 font-semibold">Print</button>
                <button onClick={() => handleDownload(previewInvoice.id, previewInvoice.invoice_number)} className="flex items-center gap-2 px-4 py-2 bg-retro-mint text-white rounded-lg hover:opacity-90 font-semibold">Save PDF</button>
                <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">Close</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div ref={printRef} className="bg-white mx-auto shadow-lg" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
                {/* Preview content same as before */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '3px solid #9D4EDD' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9D4EDD' }}>Student Management System</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>123 Education Street, Learning City<br/>Phone: +1 (555) 123-4567</div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>INVOICE</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                  <div>
                    <h3 style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>BILL TO:</h3>
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{previewInvoice.student_details?.name}</p>
                    <p style={{ fontSize: '11px', color: '#555' }}>{previewInvoice.student_details?.email}</p>
                    <p style={{ fontSize: '11px', color: '#555' }}>{previewInvoice.student_details?.phone}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px' }}><strong>Invoice #:</strong> {previewInvoice.invoice_number}</p>
                    <p style={{ fontSize: '11px' }}><strong>Date:</strong> {formatDate(previewInvoice.created_at)}</p>
                    <p style={{ fontSize: '11px' }}><strong>Payment Date:</strong> {formatDate(previewInvoice.payment_date)}</p>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '25px 0' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px', textAlign: 'left' }}>#</th>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px', textAlign: 'left' }}>Description</th>
                      <th style={{ background: '#9D4EDD', color: 'white', padding: '12px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>1</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <strong>{previewInvoice.course_details?.name}</strong>
                        {previewInvoice.batch_details?.name && <><br/><span style={{ color: '#666' }}>Batch: {previewInvoice.batch_details.name}</span></>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(previewInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#9D4EDD' }}>Total: {formatCurrency(previewInvoice.amount)}</p>
                </div>
                <div style={{ background: '#00CBA9', color: 'white', textAlign: 'center', padding: '12px', borderRadius: '5px', marginTop: '30px', fontWeight: 'bold' }}>PAID</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Invoice Preview Modal */}
      {showCustomPreviewModal && previewCustomInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Invoice Preview - {previewCustomInvoice.invoice_number}</h2>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-retro-blue text-white rounded-lg hover:opacity-90 font-semibold">Print</button>
                <button onClick={() => handleCustomDownload(previewCustomInvoice.id, previewCustomInvoice.invoice_number)} className="flex items-center gap-2 px-4 py-2 bg-retro-mint text-white rounded-lg hover:opacity-90 font-semibold">Save PDF</button>
                <button onClick={() => setShowCustomPreviewModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">Close</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div ref={printRef} className="bg-white mx-auto shadow-lg" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '3px solid #00CBA9' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00CBA9' }}>Student Management System</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>123 Education Street, Learning City<br/>Phone: +1 (555) 123-4567</div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>INVOICE</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                  <div>
                    <h3 style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>BILL TO:</h3>
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{previewCustomInvoice.recipient_name}</p>
                    {previewCustomInvoice.recipient_email && <p style={{ fontSize: '11px', color: '#555' }}>{previewCustomInvoice.recipient_email}</p>}
                    {previewCustomInvoice.recipient_phone && <p style={{ fontSize: '11px', color: '#555' }}>{previewCustomInvoice.recipient_phone}</p>}
                    {previewCustomInvoice.recipient_address && <p style={{ fontSize: '11px', color: '#555' }}>{previewCustomInvoice.recipient_address}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px' }}><strong>Invoice #:</strong> {previewCustomInvoice.invoice_number}</p>
                    <p style={{ fontSize: '11px' }}><strong>Date:</strong> {formatDate(previewCustomInvoice.created_at)}</p>
                    <p style={{ fontSize: '11px' }}><strong>Payment Date:</strong> {formatDate(previewCustomInvoice.payment_date)}</p>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '25px 0' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#00CBA9', color: 'white', padding: '12px', textAlign: 'left' }}>#</th>
                      <th style={{ background: '#00CBA9', color: 'white', padding: '12px', textAlign: 'left' }}>Item</th>
                      <th style={{ background: '#00CBA9', color: 'white', padding: '12px', textAlign: 'center' }}>Qty</th>
                      <th style={{ background: '#00CBA9', color: 'white', padding: '12px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ background: '#00CBA9', color: 'white', padding: '12px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewCustomInvoice.items.map((item, index) => (
                      <tr key={index} style={{ background: index % 2 === 0 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.name}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.quantity * item.unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginLeft: 'auto', width: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span>Subtotal:</span><span>{formatCurrency(previewCustomInvoice.subtotal)}</span></div>
                  {parseFloat(previewCustomInvoice.tax_percentage) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span>Tax ({previewCustomInvoice.tax_percentage}%):</span><span>{formatCurrency(previewCustomInvoice.tax_amount)}</span></div>
                  )}
                  {parseFloat(previewCustomInvoice.discount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#dc3545' }}><span>Discount:</span><span>-{formatCurrency(previewCustomInvoice.discount)}</span></div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 'bold', borderTop: '2px solid #00CBA9', color: '#00CBA9', fontSize: '16px' }}>
                    <span>TOTAL:</span><span>{formatCurrency(previewCustomInvoice.total_amount)}</span>
                  </div>
                </div>
                {previewCustomInvoice.notes && (
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
                    <h4 style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>NOTES:</h4>
                    <p style={{ fontSize: '10px', color: '#666' }}>{previewCustomInvoice.notes}</p>
                  </div>
                )}
                <div style={{ background: '#00CBA9', color: 'white', textAlign: 'center', padding: '12px', borderRadius: '5px', marginTop: '30px', fontWeight: 'bold' }}>PAID</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
