'use client';

import { useState, FormEvent } from 'react';
import { publicAPI } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertificateData {
  certificate_id: string;
  completion_date: string;
  issued_at: string;
  student_name: string;
  student_photo: string | null;
  student_enrollment_date: string;
  student_gender: string;
  course_name: string;
  course_description: string;
  course_duration: number;
  course_status: string;
  course_fee: string;
  batch_name: string | null;
  batch_start_date: string | null;
  batch_end_date: string | null;
  batch_instructor: string | null;
}

interface VerifyResponse {
  valid: boolean;
  certificate?: CertificateData;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Tiny shared components ───────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function Divider() {
  return <div className="border-t border-gray-100" />;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-500">
        {icon}
      </div>
      <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value ?? '—'}</div>
    </div>
  );
}

// ─── Icon set ─────────────────────────────────────────────────────────────────

const Icons = {
  shield: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  book: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  xmark: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
    </svg>
  ),
  badge: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.613 3.68 3.745 3.745 0 01-3.682.613A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.681-.613 3.745 3.745 0 01-.613-3.682A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.613-3.681 3.745 3.745 0 013.682-.613A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.681.613 3.746 3.746 0 01.613 3.682A3.745 3.745 0 0121 12z" />
    </svg>
  ),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyCertificatePage() {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [inputError, setInputError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = certificateId.trim();
    if (!trimmed) {
      setInputError('Please enter a certificate number.');
      return;
    }
    setInputError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await publicAPI.verifyCertificate(trimmed);
      setResult(response.data as VerifyResponse);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        'No certificate found with that ID. Please check and try again.';
      setResult({ valid: false, error: errorMsg });
    } finally {
      setLoading(false);
    }
  }

  const cert = result?.certificate;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              {Icons.book}
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              Student Management System
            </span>
          </div>
          <span className="hidden sm:block text-xs text-gray-400">
            Official Certificate Verification Portal
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 space-y-10">

        {/* Hero text */}
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-full tracking-wide">
            {Icons.badge}
            Certificate Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Verify a Certificate
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter the certificate number to instantly verify its authenticity,
            view course details, and confirm student information.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Certificate Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                  {Icons.search}
                </span>
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                  placeholder="CERT-2026-0001"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm font-mono rounded-lg border bg-white
                    outline-none transition placeholder:text-gray-300 text-gray-900
                    ${inputError
                      ? 'border-red-400 ring-2 ring-red-50'
                      : 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100'
                    }`}
                />
              </div>
              {inputError && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {inputError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                bg-gray-900 hover:bg-gray-800 active:bg-gray-950
                disabled:bg-gray-400 disabled:cursor-not-allowed
                text-white text-sm font-medium px-4 py-2.5 rounded-lg
                transition-colors duration-150"
            >
              {loading ? <><Spinner />Verifying…</> : <>{Icons.search}Verify Certificate</>}
            </button>
          </form>
        </div>

        {/* ── Result area ── */}
        {result && (
          <div className="max-w-3xl mx-auto w-full space-y-4">

            {/* Not found */}
            {!result.valid && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="flex items-start gap-4 bg-red-50 px-6 py-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 border border-red-200
                    flex items-center justify-center text-red-600">
                    {Icons.xmark}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Certificate Not Found</p>
                    <p className="text-sm text-red-500 mt-0.5">{result.error}</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-white border-t border-red-100">
                  <p className="text-xs text-gray-400">
                    Certificate IDs follow the format{' '}
                    <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">
                      CERT-YYYY-NNNN
                    </code>
                    . Double-check the number and try again.
                  </p>
                </div>
              </div>
            )}

            {/* Found */}
            {result.valid && cert && (
              <>
                {/* Verified banner */}
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                  <div className="flex flex-wrap items-center gap-4 bg-emerald-50 px-6 py-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200
                      flex items-center justify-center text-emerald-600">
                      {Icons.check}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-emerald-800">Certificate Verified</span>
                        <span className="inline-flex items-center gap-1 bg-emerald-200 text-emerald-800
                          text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          AUTHENTIC
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Officially issued by Student Management System.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500">
                        Certificate ID
                      </p>
                      <p className="font-mono text-sm font-bold text-emerald-800">
                        {cert.certificate_id}
                      </p>
                    </div>
                  </div>

                  {/* Quick stats strip */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-emerald-100 bg-white">
                    {[
                      { label: 'Issued On', value: fmt(cert.issued_at) },
                      { label: 'Completed', value: fmt(cert.completion_date) },
                      { label: 'Course', value: cert.course_name },
                    ].map(({ label, value }) => (
                      <div key={label} className="px-5 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                          {label}
                        </p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two-column detail cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                  {/* Student card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5">
                      <SectionHeader icon={Icons.user} title="Student Information" />

                      {/* Avatar + name */}
                      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
                        {cert.student_photo ? (
                          <img
                            src={cert.student_photo}
                            alt={cert.student_name}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-900 text-white text-xl font-bold
                            flex items-center justify-center flex-shrink-0">
                            {cert.student_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-base font-semibold text-gray-900 leading-snug">
                            {cert.student_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{cert.student_gender}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <Field label="Enrollment Date" value={fmt(cert.student_enrollment_date)} />
                        <Field label="Completion Date" value={fmt(cert.completion_date)} />
                      </div>
                    </div>

                    {/* Certificate meta — subtle tinted footer */}
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 grid grid-cols-2 gap-5">
                      <Field
                        label="Certificate ID"
                        value={<span className="font-mono text-xs text-gray-700">{cert.certificate_id}</span>}
                      />
                      <Field label="Date Issued" value={fmt(cert.issued_at)} />
                    </div>
                  </div>

                  {/* Course + optional Batch card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5">
                      <SectionHeader icon={Icons.book} title="Course Details" />
                      <div className="space-y-5">
                        <Field label="Course Name" value={cert.course_name} />
                        <div className="grid grid-cols-2 gap-5">
                          <Field
                            label="Duration"
                            value={`${cert.course_duration} month${cert.course_duration !== 1 ? 's' : ''}`}
                          />
                          <Field
                            label="Course Fee"
                            value={`৳ ${parseFloat(cert.course_fee).toLocaleString()}`}
                          />
                        </div>
                        <Field
                          label="Status"
                          value={
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold
                              px-2.5 py-0.5 rounded-full border
                              ${cert.course_status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                ${cert.course_status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {cert.course_status}
                            </span>
                          }
                        />
                        {cert.course_description && (
                          <Field
                            label="Description"
                            value={
                              <span className="text-xs text-gray-500 font-normal leading-relaxed">
                                {cert.course_description}
                              </span>
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Batch block — only when a batch exists */}
                    {cert.batch_name && (
                      <>
                        <Divider />
                        <div className="bg-gray-50 px-6 py-5">
                          <SectionHeader icon={Icons.users} title="Batch Details" />
                          <div className="grid grid-cols-2 gap-5">
                            <Field label="Batch Name" value={cert.batch_name} />
                            <Field label="Instructor" value={cert.batch_instructor ?? '—'} />
                            <Field label="Start Date" value={fmt(cert.batch_start_date)} />
                            <Field label="End Date" value={fmt(cert.batch_end_date)} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Verification stamp */}
                <div className="bg-white rounded-xl border border-dashed border-gray-300 px-6 py-4
                  flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-2 border-gray-200
                      flex items-center justify-center text-gray-400">
                      {Icons.shield}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Issuing Authority</p>
                      <p className="text-xs text-gray-400">Student Management System</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">Verified at</span>
                    <span className="text-xs font-mono text-gray-600">
                      {new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Idle hint cards */}
        {!result && !loading && (
          <div className="max-w-xl mx-auto grid grid-cols-3 gap-4">
            {[
              { icon: '🔍', text: 'Enter the certificate ID above' },
              { icon: '✅', text: 'Instantly verify authenticity' },
              { icon: '📄', text: 'View full course & student info' },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-5 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-xs text-gray-500 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Student Management System. All rights reserved.</span>
          <span>For support, contact the administration office.</span>
        </div>
      </footer>

    </div>
  );
}
