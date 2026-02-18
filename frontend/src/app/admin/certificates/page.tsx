'use client';

import { useEffect, useState, useRef } from 'react';
import { certificatesAPI, studentsAPI, coursesAPI, batchesAPI } from '@/lib/api';

interface Certificate {
  id: number;
  certificate_id: string;
  student: number;
  student_details?: { name: string };
  course: number;
  course_details?: { name: string; duration?: number };
  batch?: number;
  batch_details?: { name: string };
  completion_date: string;
  issued_at: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    batch: '',
    completion_date: new Date().toISOString().split('T')[0],
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
      const [certificatesRes, studentsRes, coursesRes, batchesRes] = await Promise.all([
        certificatesAPI.getAll(),
        studentsAPI.getAll(),
        coursesAPI.getAll(),
        batchesAPI.getAll(),
      ]);
      setCertificates(certificatesRes.data.results || certificatesRes.data);
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
      await certificatesAPI.create(formData);
      setSuccess('Certificate issued successfully!');
      fetchData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to issue certificate');
    }
  };

  const handleDownload = async (id: number, certificateId: string) => {
    try {
      const response = await certificatesAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download certificate');
    }
  };

  const handlePreview = (cert: Certificate) => {
    setPreviewCertificate(cert);
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
          <title>Certificate - ${previewCertificate?.certificate_id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; }
            @page { size: A4 landscape; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      student: '',
      course: '',
      batch: '',
      completion_date: new Date().toISOString().split('T')[0],
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

  const filteredCertificates = certificates.filter(cert =>
    cert.certificate_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.student_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.course_details?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-lavender"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-retro-peach to-retro-pink bg-clip-text text-transparent retro-font mb-2">
            Certificates
          </h1>
          <p className="text-gray-700 font-semibold text-lg">Issue and manage academic certificates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn-primary text-lg">
          + Issue Certificate
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
            placeholder="Search by certificate ID, student or course..."
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
              <th>Certificate ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Completion Date</th>
              <th>Issued At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {searchQuery ? `No certificates found matching "${searchQuery}"` : 'No certificates issued yet!'}
                </td>
              </tr>
            ) : (
              filteredCertificates.map((cert) => (
                <tr key={cert.id}>
                  <td className="font-semibold text-retro-lavender">{cert.certificate_id}</td>
                  <td>{cert.student_details?.name || `Student ${cert.student}`}</td>
                  <td>
                    <span className="px-2 py-1 bg-gradient-to-r from-retro-lavender to-retro-lavender-light text-white rounded text-xs font-semibold">
                      {cert.course_details?.name || `Course ${cert.course}`}
                    </span>
                  </td>
                  <td>
                    {cert.batch_details?.name ? (
                      <span className="px-2 py-1 bg-gradient-to-r from-retro-blue to-retro-blue-light text-white rounded text-xs font-semibold">
                        {cert.batch_details.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{formatDate(cert.completion_date)}</td>
                  <td>{formatDate(cert.issued_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handlePreview(cert)} className="px-3 py-1 bg-retro-blue text-white rounded hover:opacity-90 text-sm">
                        Preview
                      </button>
                      <button onClick={() => handleDownload(cert.id, cert.certificate_id)} className="px-3 py-1 bg-retro-mint text-white rounded hover:opacity-90 text-sm">
                        Save PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Issue Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="retro-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-retro-blue mb-6">Issue New Certificate</h2>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="retro-input"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
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
                  {batches
                    .filter((b) => !formData.course || b.course.toString() === formData.course)
                    .map((batch) => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date *</label>
                <input
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  className="retro-input"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="flex-1 retro-btn-primary">Issue Certificate</button>
                <button type="button" onClick={handleCloseModal} className="flex-1 retro-btn bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreviewModal && previewCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header with Actions */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Certificate Preview - {previewCertificate.certificate_id}</h2>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-retro-blue text-white rounded-lg hover:opacity-90 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button onClick={() => handleDownload(previewCertificate.id, previewCertificate.certificate_id)} className="flex items-center gap-2 px-4 py-2 bg-retro-mint text-white rounded-lg hover:opacity-90 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Save PDF
                </button>
                <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">Close</button>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-200">
              <div ref={printRef}>
                <div style={{
                  width: '297mm',
                  height: '210mm',
                  margin: '0 auto',
                  background: '#FFF9F0',
                  position: 'relative',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                }}>

                  {/* Watermark */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(30deg)',
                    fontSize: '80px',
                    fontWeight: 'bold',
                    color: 'rgba(200, 169, 81, 0.08)',
                    fontFamily: "'Georgia', serif",
                    letterSpacing: '15px',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}>CERTIFIED</div>

                  {/* Outer Border - Navy */}
                  <div style={{
                    position: 'absolute',
                    top: '12mm',
                    left: '15mm',
                    right: '15mm',
                    bottom: '12mm',
                    border: '4px solid #1B2A4A',
                  }}></div>

                  {/* Second Border - Gold */}
                  <div style={{
                    position: 'absolute',
                    top: '16mm',
                    left: '19mm',
                    right: '19mm',
                    bottom: '16mm',
                    border: '2px solid #C8A951',
                  }}></div>

                  {/* Third Border - Navy thin */}
                  <div style={{
                    position: 'absolute',
                    top: '18mm',
                    left: '21mm',
                    right: '21mm',
                    bottom: '18mm',
                    border: '0.5px solid #1B2A4A',
                  }}></div>

                  {/* Inner Border - Gold Light */}
                  <div style={{
                    position: 'absolute',
                    top: '20mm',
                    left: '23mm',
                    right: '23mm',
                    bottom: '20mm',
                    border: '0.8px solid #E8D5A3',
                  }}></div>

                  {/* Corner Ornaments */}
                  {[
                    { top: '23mm', left: '26mm' },
                    { top: '23mm', right: '26mm' },
                    { bottom: '23mm', left: '26mm' },
                    { bottom: '23mm', right: '26mm' },
                  ].map((pos, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      ...pos,
                      width: '14mm',
                      height: '14mm',
                      borderTop: (pos.top ? '2px' : '0') + ' solid #C8A951',
                      borderBottom: (pos.bottom ? '2px' : '0') + ' solid #C8A951',
                      borderLeft: (pos.left ? '2px' : '0') + ' solid #C8A951',
                      borderRight: (pos.right ? '2px' : '0') + ' solid #C8A951',
                    }}></div>
                  ))}

                  {/* Content Container */}
                  <div style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28mm 40mm',
                  }}>

                    {/* Institution Name */}
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#1B2A4A',
                      letterSpacing: '4px',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                    }}>Student Management System</div>

                    {/* Gold line under institution */}
                    <div style={{
                      width: '100mm',
                      height: '1px',
                      background: 'linear-gradient(to right, transparent, #C8A951, transparent)',
                      marginBottom: '4px',
                    }}></div>

                    {/* Tagline */}
                    <div style={{
                      fontSize: '8px',
                      color: '#888',
                      letterSpacing: '2px',
                      marginBottom: '14px',
                    }}>Excellence in Education | Empowering Future Leaders</div>

                    {/* Decorative divider with diamond */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '14px',
                      width: '70%',
                    }}>
                      <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(to right, transparent, #C8A951)' }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#C8A951',
                        transform: 'rotate(45deg)',
                      }}></div>
                      <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(to left, transparent, #C8A951)' }}></div>
                    </div>

                    {/* Certificate Title */}
                    <div style={{
                      fontSize: '42px',
                      fontWeight: 'bold',
                      color: '#1B2A4A',
                      fontFamily: "'Georgia', serif",
                      lineHeight: 1,
                      marginBottom: '2px',
                    }}>Certificate</div>

                    <div style={{
                      fontSize: '19px',
                      color: '#C8A951',
                      fontFamily: "'Georgia', serif",
                      fontStyle: 'italic',
                      marginBottom: '16px',
                    }}>of Completion</div>

                    {/* Presented to */}
                    <div style={{
                      fontSize: '12px',
                      color: '#555',
                      marginBottom: '10px',
                      letterSpacing: '1px',
                    }}>This certificate is proudly presented to</div>

                    {/* Student Name with underlines */}
                    <div style={{ position: 'relative', textAlign: 'center', marginBottom: '10px' }}>
                      <div style={{
                        width: '180mm',
                        height: '1px',
                        background: '#C8A951',
                        position: 'absolute',
                        top: '-3px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}></div>
                      <div style={{
                        fontSize: '34px',
                        fontWeight: 'bold',
                        color: '#1B2A4A',
                        fontFamily: "'Georgia', serif",
                        padding: '4px 30px',
                      }}>{previewCertificate.student_details?.name}</div>
                      <div style={{
                        width: '180mm',
                        height: '0.6px',
                        background: '#C8A951',
                        position: 'absolute',
                        bottom: '-3px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}></div>
                    </div>

                    {/* Completion text */}
                    <div style={{
                      fontSize: '12px',
                      color: '#555',
                      marginBottom: '8px',
                      letterSpacing: '1px',
                    }}>for successfully completing the course</div>

                    {/* Course Name */}
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#C8A951',
                      fontFamily: "'Georgia', serif",
                      marginBottom: '8px',
                    }}>{previewCertificate.course_details?.name}</div>

                    {/* Details line */}
                    <div style={{
                      fontSize: '10px',
                      color: '#888',
                      marginBottom: '20px',
                      letterSpacing: '1px',
                    }}>
                      {previewCertificate.batch_details?.name && `Batch: ${previewCertificate.batch_details.name}  |  `}
                      {previewCertificate.course_details?.duration && `Duration: ${previewCertificate.course_details.duration} months  |  `}
                      Completed: {formatDate(previewCertificate.completion_date)}
                    </div>

                    {/* Signatures Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      width: '100%',
                      maxWidth: '240mm',
                      marginTop: 'auto',
                    }}>
                      {/* Left Signature */}
                      <div style={{ textAlign: 'center', width: '70mm' }}>
                        <div style={{ width: '55mm', height: '0.8px', background: '#2C2C2C', margin: '0 auto 5px' }}></div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1B2A4A' }}>Program Director</div>
                        <div style={{ fontSize: '8px', color: '#888' }}>Student Management System</div>
                      </div>

                      {/* Center Seal */}
                      <div style={{
                        width: '28mm',
                        height: '28mm',
                        borderRadius: '50%',
                        border: '2px solid #C8A951',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                        <div style={{
                          width: '22mm',
                          height: '22mm',
                          borderRadius: '50%',
                          border: '0.8px solid #C8A951',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#C8A951', letterSpacing: '1px' }}>OFFICIAL</div>
                          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#C8A951' }}>SEAL</div>
                          <div style={{ fontSize: '6px', color: '#C8A951', letterSpacing: '1px' }}>VERIFIED</div>
                        </div>
                      </div>

                      {/* Right Signature */}
                      <div style={{ textAlign: 'center', width: '70mm' }}>
                        <div style={{ width: '55mm', height: '0.8px', background: '#2C2C2C', margin: '0 auto 5px' }}></div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1B2A4A' }}>Chairman</div>
                        <div style={{ fontSize: '8px', color: '#888' }}>Board of Education</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      maxWidth: '240mm',
                      marginTop: '10px',
                      paddingTop: '5px',
                    }}>
                      <div style={{ fontSize: '8px', color: '#888' }}>Certificate ID: {previewCertificate.certificate_id}</div>
                      <div style={{ fontSize: '7px', color: '#aaa' }}>Verify at www.sms.edu/verify</div>
                      <div style={{ fontSize: '8px', color: '#888' }}>Date of Issue: {formatDate(previewCertificate.issued_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
