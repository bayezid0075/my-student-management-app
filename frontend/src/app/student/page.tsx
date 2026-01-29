'use client';

import { useEffect, useState } from 'react';
import { studentsAPI, invoicesAPI, certificatesAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Fetch student profile and enrollments
      const studentsRes = await studentsAPI.getAll();
      const students = studentsRes.data.results || studentsRes.data;
      const currentStudent = students.find((s: any) => s.user === user?.id);
      setStudentData(currentStudent);

      if (currentStudent) {
        setEnrollments(currentStudent.enrollments || []);
      }

      // Fetch invoices
      const invoicesRes = await invoicesAPI.getAll();
      setInvoices(invoicesRes.data.results || invoicesRes.data);

      // Fetch certificates
      const certificatesRes = await certificatesAPI.getAll();
      setCertificates(certificatesRes.data.results || certificatesRes.data);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-mint"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 retro-font mb-2">My Dashboard</h1>
        <p className="text-gray-600">Track your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-retro-mint rounded-retro-lg p-6 text-white shadow-retro-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Enrolled Courses</p>
              <p className="text-4xl font-bold">{enrollments.length}</p>
            </div>
            <div className="text-5xl opacity-80">📚</div>
          </div>
        </div>

        <div className="bg-retro-peach rounded-retro-lg p-6 text-white shadow-retro-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Invoices</p>
              <p className="text-4xl font-bold">{invoices.length}</p>
            </div>
            <div className="text-5xl opacity-80">🧾</div>
          </div>
        </div>

        <div className="bg-retro-blue rounded-retro-lg p-6 text-white shadow-retro-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Certificates</p>
              <p className="text-4xl font-bold">{certificates.length}</p>
            </div>
            <div className="text-5xl opacity-80">🏆</div>
          </div>
        </div>
      </div>

      {/* Student Info */}
      {studentData && (
        <div className="retro-card mb-8">
          <h2 className="text-2xl font-bold text-retro-mint mb-4">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{studentData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{studentData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{studentData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Enrollment Date</p>
              <p className="font-semibold">{new Date(studentData.enrollment_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="retro-card mb-8">
        <h2 className="text-2xl font-bold text-retro-mint mb-4">My Courses</h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">You are not enrolled in any courses yet.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment: any) => (
              <div
                key={enrollment.id}
                className="p-4 bg-gray-50 rounded-retro border-2 border-gray-200 hover:border-retro-mint transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-800">
                  {enrollment.course_details?.name || 'Course'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {enrollment.course_details?.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-600">
                    Duration: {enrollment.course_details?.duration} months
                  </span>
                  {enrollment.batch_details && (
                    <span className="px-3 py-1 bg-retro-mint text-white rounded-full text-xs font-semibold">
                      Batch: {enrollment.batch_details.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="retro-card">
          <h2 className="text-2xl font-bold text-retro-peach mb-4">Recent Invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 3).map((invoice: any) => (
                <div key={invoice.id} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">{invoice.invoice_number}</span>
                  <span className="font-semibold">${invoice.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="retro-card">
          <h2 className="text-2xl font-bold text-retro-blue mb-4">My Certificates</h2>
          {certificates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No certificates issued yet.</p>
          ) : (
            <div className="space-y-2">
              {certificates.slice(0, 3).map((cert: any) => (
                <div key={cert.id} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">{cert.course_details?.name}</span>
                  <span className="text-xs text-gray-600">{cert.certificate_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
