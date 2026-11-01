import React, { useState } from 'react';
import { Job, GovernmentScheme, UserApplication, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { Users, Briefcase, Award, FileCheck, Plus, Trash2, CheckCircle, XCircle, BarChart3, TrendingUp, ShieldCheck, MapPin, DownloadCloud, Loader2, Landmark } from 'lucide-react';

interface AdminDashboardProps {
  jobs: Job[];
  schemes: GovernmentScheme[];
  applications: UserApplication[];
  currentLanguage: Language;
  onAddJob: (job: Partial<Job>) => Promise<void>;
  onToggleJobStatus: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onFetchExternalJobs?: () => Promise<void>;
  isFetchingExternalJobs?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  jobs,
  schemes,
  applications,
  currentLanguage,
  onAddJob,
  onToggleJobStatus,
  onDeleteJob,
  onFetchExternalJobs,
  isFetchingExternalJobs = false,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmployer, setNewEmployer] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newState, setNewState] = useState('Bihar');
  const [newSalaryMin, setNewSalaryMin] = useState('16000');
  const [newSalaryMax, setNewSalaryMax] = useState('22000');
  const [newSkills, setNewSkills] = useState('welding, metal fabrication');
  const [newEducation, setNewEducation] = useState('10th Pass');
  const [newDescription, setNewDescription] = useState('');
  const [newVacancies, setNewVacancies] = useState('3');

  // Compute skill frequencies
  const skillCount: Record<string, number> = {};
  jobs.forEach(j => {
    j.requiredSkills.forEach(s => {
      skillCount[s] = (skillCount[s] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEmployer.trim()) return;

    await onAddJob({
      title: newTitle,
      titleHi: newTitle,
      employer: newEmployer,
      location: newLocation || 'Patna',
      state: newState,
      salaryMin: Number(newSalaryMin) || 15000,
      salaryMax: Number(newSalaryMax) || 20000,
      requiredSkills: newSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      education: newEducation,
      description: newDescription || 'Opportunity for skilled vocational worker.',
      vacancies: Number(newVacancies) || 2,
    });

    setShowAddJobModal(false);
    setNewTitle('');
    setNewEmployer('');
    setNewDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fadeIn transition-colors">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#2D5A5A] dark:bg-[#152E2E] text-white dark:text-[#2DD4BF] text-xs font-bold mb-1.5 border border-transparent dark:border-[#1E4646]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KaushalSetu Administrative Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
            {t.adminDashboard}
          </h1>
          <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium">
            Manage live vocational jobs, oversee scheme alignments, and track candidate submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onFetchExternalJobs && (
            <button
              type="button"
              onClick={onFetchExternalJobs}
              disabled={isFetchingExternalJobs}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161B22] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#3B82F6]/40 font-extrabold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px] disabled:opacity-50"
            >
              {isFetchingExternalJobs ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing NCS/NAPS...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>Sync Third-Party Jobs</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddJobModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#E87D4D] hover:bg-[#D56B3A] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewJob}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        
        <div className="bg-white dark:bg-[#161B22] p-4 sm:p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase">{t.totalUsers}</span>
            <Users className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
          </div>
          <span className="text-xl sm:text-3xl font-black text-[#2B2927] dark:text-[#F1F5F9] mt-2 block">
            1,420+
          </span>
          <span className="text-[11px] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% this week
          </span>
        </div>

        <div className="bg-white dark:bg-[#161B22] p-4 sm:p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase">{t.totalJobs}</span>
            <Briefcase className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
          </div>
          <span className="text-xl sm:text-3xl font-black text-[#2B2927] dark:text-[#F1F5F9] mt-2 block">
            {jobs.length}
          </span>
          <span className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium mt-1">
            Across 10+ states
          </span>
        </div>

        <div className="bg-white dark:bg-[#161B22] p-4 sm:p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase">{t.totalSchemes}</span>
            <Award className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
          </div>
          <span className="text-xl sm:text-3xl font-black text-[#2B2927] dark:text-[#F1F5F9] mt-2 block">
            {schemes.length}
          </span>
          <span className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium mt-1">
            National & Ministry level
          </span>
        </div>

        <div className="bg-white dark:bg-[#161B22] p-4 sm:p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase">{t.totalApplications}</span>
            <FileCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
          </div>
          <span className="text-xl sm:text-3xl font-black text-[#2B2927] dark:text-[#F1F5F9] mt-2 block">
            {applications.length}
          </span>
          <span className="text-[11px] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold mt-1">
            Direct candidate leads
          </span>
        </div>

      </div>

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        
        {/* Top In-Demand Skills */}
        <div className="bg-white dark:bg-[#161B22] p-5 sm:p-6 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9] uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
            <span>{t.mostCommonSkills}</span>
          </h3>
          <div className="space-y-3">
            {topSkills.map(([skill, count]) => (
              <div key={skill}>
                <div className="flex justify-between text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1 capitalize">
                  <span>{skill}</span>
                  <span className="text-[#8B867F] dark:text-[#94A3B8]">{count} jobs in demand</span>
                </div>
                <div className="w-full bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] rounded-full h-2">
                  <div
                    className="bg-[#2D5A5A] dark:bg-[#2DD4BF] h-2 rounded-full"
                    style={{ width: `${Math.min(100, (count / jobs.length) * 100 * 2.5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Distribution */}
        <div className="bg-white dark:bg-[#161B22] p-5 sm:p-6 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9] uppercase tracking-wide mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
            <span>{t.popularLocations}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
            {['Bihar (6 jobs)', 'Uttar Pradesh (5 jobs)', 'Rajasthan (4 jobs)', 'Maharashtra (3 jobs)', 'Madhya Pradesh (2 jobs)', 'Gujarat (2 jobs)'].map((st, i) => (
              <div key={i} className="p-3 bg-[#FAF9F5] dark:bg-[#10151C] rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] text-[#2B2927] dark:text-[#F1F5F9]">
                📍 {st}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Live Job Management Table */}
      <div className="bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-xs overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
            Active Job Postings ({jobs.length})
          </h3>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] font-bold border-b border-[#E5E0D5] dark:border-[#262F3D]">
              <tr>
                <th className="p-3.5">Job Title</th>
                <th className="p-3.5">Employer</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Salary Range</th>
                <th className="p-3.5">Required Skills</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5] dark:divide-[#262F3D] text-[#2B2927] dark:text-[#F1F5F9] font-medium">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] transition-colors">
                  <td className="p-3.5 font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                    <div>{job.title}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 font-normal">
                      {job.source === 'ncs' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#60A5FA] inline-flex items-center gap-1">
                          <Landmark className="w-2.5 h-2.5" />
                          <span>NCS Govt</span>
                        </span>
                      )}
                      {job.source === 'apprenticeship' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] dark:bg-[#2D2305] text-[#B45309] dark:text-[#FBBF24]">
                          NAPS Apprentice
                        </span>
                      )}
                      {job.source === 'external' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] dark:bg-[#2A1839] text-[#7E22CE] dark:text-[#C084FC]">
                          External
                        </span>
                      )}
                      {(!job.source || job.source === 'local') && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF]">
                          KaushalSetu Verified
                        </span>
                      )}
                      {job.externalId && (
                        <span className="text-[10px] font-mono text-[#8B867F] dark:text-[#94A3B8]">
                          ID: {job.externalId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-[#8B867F] dark:text-[#94A3B8]">{job.employer}</td>
                  <td className="p-3.5 text-[#8B867F] dark:text-[#94A3B8]">{job.location}, {job.state}</td>
                  <td className="p-3.5 font-semibold text-[#2B2927] dark:text-[#F1F5F9]">
                    ₹{job.salaryMin} - ₹{job.salaryMax}
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] rounded-md text-[10px] capitalize text-[#2B2927] dark:text-[#F1F5F9]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleJobStatus(job.id, job.isActive)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer ${
                        job.isActive
                          ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646]'
                          : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#2D3748]'
                      }`}
                    >
                      {job.isActive ? <CheckCircle className="w-3 h-3 text-[#2D5A5A] dark:text-[#2DD4BF]" /> : <XCircle className="w-3 h-3" />}
                      <span>{job.isActive ? t.active : t.inactive}</span>
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteJob(job.id)}
                      className="p-1.5 text-rose-600 hover:bg-[#FDF0EA] dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-lg rounded-2xl shadow-xl border border-[#E5E0D5] dark:border-[#262F3D] p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] mb-4">{t.addNewJob}</h3>
            
            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Arc Welder / Electrician"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Employer / Workshop Name</label>
                <input
                  type="text"
                  required
                  value={newEmployer}
                  onChange={(e) => setNewEmployer(e.target.value)}
                  placeholder="e.g. Kisan Agro Works"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">City / District</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Patna"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="Bihar"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Salary Min (₹)</label>
                  <input
                    type="number"
                    value={newSalaryMin}
                    onChange={(e) => setNewSalaryMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Salary Max (₹)</label>
                  <input
                    type="number"
                    value={newSalaryMax}
                    onChange={(e) => setNewSalaryMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  placeholder="welding, metal fabrication"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Job Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details about working conditions, timings, and responsibilities."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] font-bold text-[#8B867F] dark:text-[#94A3B8] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#E87D4D] hover:bg-[#D56B3A] text-white font-extrabold cursor-pointer transition-colors shadow-xs"
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
