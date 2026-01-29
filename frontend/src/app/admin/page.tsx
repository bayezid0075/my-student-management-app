'use client';

import { useEffect, useState } from 'react';
import { coursesAPI, studentsAPI, batchesAPI, invoicesAPI, certificatesAPI } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    batches: 0,
    invoices: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, studentsRes, batchesRes, invoicesRes, certificatesRes] = await Promise.all([
        coursesAPI.getAll(),
        studentsAPI.getAll(),
        batchesAPI.getAll(),
        invoicesAPI.getAll(),
        certificatesAPI.getAll(),
      ]);

      setStats({
        courses: coursesRes.data.count || coursesRes.data.length || 0,
        students: studentsRes.data.count || studentsRes.data.length || 0,
        batches: batchesRes.data.count || batchesRes.data.length || 0,
        invoices: invoicesRes.data.count || invoicesRes.data.length || 0,
        certificates: certificatesRes.data.count || certificatesRes.data.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Courses', value: stats.courses, gradient: 'from-retro-pink to-retro-pink-light', icon: '📚' },
    { label: 'Total Students', value: stats.students, gradient: 'from-retro-mint to-retro-mint-light', icon: '🎓' },
    { label: 'Total Batches', value: stats.batches, gradient: 'from-retro-lavender to-retro-lavender-light', icon: '👥' },
    { label: 'Invoices Issued', value: stats.invoices, gradient: 'from-retro-peach to-retro-peach-light', icon: '🧾' },
    { label: 'Certificates Issued', value: stats.certificates, gradient: 'from-retro-blue to-retro-blue-light', icon: '🏆' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-lavender"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-retro-pink via-retro-lavender to-retro-blue bg-clip-text text-transparent retro-font mb-3">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 font-medium">Overview of your student management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.gradient} rounded-retro-lg p-8 text-white shadow-retro-xl hover:scale-105 transition-transform duration-300 border-4 border-white/30`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">{card.label}</p>
                <p className="text-5xl font-bold drop-shadow-lg">{card.value}</p>
              </div>
              <div className="text-6xl opacity-90 drop-shadow-lg">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="retro-card">
          <h2 className="text-2xl font-bold text-retro-lavender mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/students" className="block retro-btn-primary text-center">
              + Add New Student
            </a>
            <a href="/admin/courses" className="block retro-btn-secondary text-center">
              + Create Course
            </a>
            <a href="/admin/batches" className="block retro-btn-success text-center">
              + Create Batch
            </a>
          </div>
        </div>

        <div className="retro-card">
          <h2 className="text-2xl font-bold text-retro-mint mb-4">System Info</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between py-2 border-b">
              <span>Active Courses</span>
              <span className="font-semibold">{stats.courses}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Enrolled Students</span>
              <span className="font-semibold">{stats.students}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Running Batches</span>
              <span className="font-semibold">{stats.batches}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Completion Rate</span>
              <span className="font-semibold">
                {stats.students > 0 ? Math.round((stats.certificates / stats.students) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
