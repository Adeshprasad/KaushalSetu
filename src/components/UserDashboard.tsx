import React, { useState, useMemo } from 'react';
import { UserProfile, Job, GovernmentScheme, UserApplication, Language, JobMatchResult, TrainingVideo } from '../types';
import { TRANSLATIONS } from '../translations';
import { SKILL_TAXONOMY } from '../data/mockData';
import { TRAINING_VIDEOS } from '../data/trainingVideos';
import { rankJobsForUser } from '../utils/matching';
import { JobCard } from './JobCard';
import { SchemeCard } from './SchemeCard';
import { TrainingCard } from './TrainingCard';
import { TrainingVideoModal } from './TrainingVideoModal';
import { KaushalBiodataModal } from './KaushalBiodataModal';
import { Briefcase, Award, Bookmark, FileCheck, MapPin, Phone, ArrowRight, ShieldCheck, Database, LogOut, Check, Edit3, GraduationCap, FileText, Share2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface UserDashboardProps {
  userProfile: UserProfile;
  jobs: Job[];
  schemes: GovernmentScheme[];
  applications: UserApplication[];
  currentLanguage: Language;
  onViewJobDetails: (result: JobMatchResult) => void;
  onQuickApply: (result: JobMatchResult) => void;
  onToggleSaveJob: (jobId: string) => void;
  onExplainSchemeSimply: (scheme: GovernmentScheme) => void;
  onAskSchemeChatbot: (scheme: GovernmentScheme) => void;
  onNavigateToHome: () => void;
  onNavigateToTraining?: () => void;
  onNavigateToCenters?: () => void;
  onToggleSaveTraining?: (videoId: string) => void;
  onExploreMatchingJobs?: (skill: string) => void;
  onOpenBiodata?: () => void;
  currentUser?: FirebaseUser | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  userProfile,
  jobs,
  schemes,
  applications,
  currentLanguage,
  onViewJobDetails,
  onQuickApply,
  onToggleSaveJob,
  onExplainSchemeSimply,
  onAskSchemeChatbot,
  onNavigateToHome,
  onNavigateToTraining,
  onNavigateToCenters,
  onToggleSaveTraining,
  onExploreMatchingJobs,
  onOpenBiodata,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const [activeSubTab, setActiveSubTab] = useState<'recommended' | 'schemes' | 'saved' | 'saved_training' | 'applications'>('recommended');
  const [showBiodataModal, setShowBiodataModal] = useState(false);
  const [selectedTrainingVideo, setSelectedTrainingVideo] = useState<TrainingVideo | null>(null);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editPhone, setEditPhone] = useState(userProfile.phone || '+91 98765 43210');
  const [editState, setEditState] = useState(userProfile.state || 'Bihar');
  const [editDistrict, setEditDistrict] = useState(userProfile.district || 'Patna');

  const savedJobsList = jobs.filter(j => userProfile.savedJobIds.includes(j.id));
  const savedTrainingList = TRAINING_VIDEOS.filter(v => (userProfile.savedTrainingIds || []).includes(v.id));
  const myApplicationsList = applications.filter(a =>
    (currentUser?.uid && (a as any).applicantId === currentUser.uid) ||
    a.applicantName.toLowerCase() === userProfile.name.toLowerCase() ||
    (userProfile.appliedJobIds && userProfile.appliedJobIds.includes(a.jobId))
  );

  // Ranked recommended jobs in decreasing order of match score
  const recommendedJobsRanked = useMemo(() => {
    return rankJobsForUser(jobs, userProfile.skills, userProfile.state);
  }, [jobs, userProfile.skills, userProfile.state]);

  const handleSaveContact = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        phone: editPhone,
        state: editState,
        district: editDistrict
      });
    }
    setIsEditingContact(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fadeIn transition-colors">
      
      {/* Cloud Persistence Notice / Google Auth Banner */}
      {!currentUser ? (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FDF0EA] to-[#FAF9F5] dark:from-[#231713] dark:to-[#161B22] border border-[#F6D3C2] dark:border-[#4E2619] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E87D4D] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {currentLanguage === 'hi' ? 'क्लाउड डेटाबेस से कनेक्ट करें (Firebase Auth & Firestore)' : 'Connect your Account for Cloud Persistence'}
              </h3>
              <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-0.5">
                {currentLanguage === 'hi'
                  ? 'गूगल लॉगिन द्वारा अपने हुनर, सुरक्षित नौकरियां और आवेदन की स्थिति को किसी भी डिवाइस पर सुरक्षित रखें।'
                  : 'Sign in with Google to securely persist your skills, bookmarked jobs, and application tracking in real-time.'}
              </p>
            </div>
          </div>
          {onLogin && (
            <button
              type="button"
              onClick={onLogin}
              className="px-4 py-2.5 rounded-xl bg-[#2D5A5A] hover:bg-[#224646] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer min-h-[40px]"
            >
              {/* Google G icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{currentLanguage === 'hi' ? 'Google से लॉगिन करें' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-[#EBF1F1] dark:bg-[#152E2E] border border-[#CCE0E0] dark:border-[#1E4646] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2D5A5A] dark:bg-[#2DD4BF]"></span>
            </span>
            <span className="font-bold text-[#2D5A5A] dark:text-[#2DD4BF]">
              {currentLanguage === 'hi' ? 'क्लाउड सिंक चालू:' : 'Firestore Synchronized:'}
            </span>
            <span className="text-[#2B2927] dark:text-[#F1F5F9] font-semibold">{currentUser.email}</span>
            <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#10151C] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold border border-[#CCE0E0] dark:border-[#1E4646] text-[10px]">
              UID: {currentUser.uid.substring(0, 8)}...
            </span>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-[#8B867F] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'hi' ? 'लॉगआउट' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      )}

      {/* Profile Banner */}
      <div className="bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-xs p-5 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userProfile.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#CCE0E0] dark:border-[#1E4646] shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center text-2xl font-black shadow-xs shrink-0">
                {userProfile.name ? userProfile.name.charAt(0) : 'R'}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
                  {userProfile.name || (currentUser?.displayName || 'Ravi Kumar')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{currentUser ? 'Verified Candidate' : 'Candidate'}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                  <span>{userProfile.district || 'Patna'}, {userProfile.state || 'Bihar'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{userProfile.phone || '+91 98765 43210'}</span>
                </span>
                <span>•</span>
                <span>{userProfile.experienceYears || 2} Years Exp</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Kaushal Bio-Data Print & WhatsApp Action */}
            <button
              id="banner-biodata-btn"
              type="button"
              onClick={() => {
                if (onOpenBiodata) onOpenBiodata();
                else setShowBiodataModal(true);
              }}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#224646] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] border border-[#224646] dark:border-[#14B8A6] font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[38px]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'hi' ? 'कौशल बायोडाटा (PDF/प्रिंट)' : 'Kaushal Biodata (PDF)'}</span>
            </button>

            {onNavigateToCenters && (
              <button
                type="button"
                onClick={onNavigateToCenters}
                className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#EBF1F1] dark:bg-[#152E2E] hover:bg-[#CCE0E0] dark:hover:bg-[#1E4646] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E87D4D]" />
                <span>{currentLanguage === 'hi' ? 'नक्शे पर केंद्र' : 'Nearby Centers'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D] font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8B867F] dark:text-[#94A3B8]" />
              <span>{isEditingContact ? 'Cancel' : 'Edit Contact'}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToHome}
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#FDF0EA] dark:bg-[#281812] hover:bg-[#FCE1D4] dark:hover:bg-[#3E1E12] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619] font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <span>{currentLanguage === 'hi' ? 'हुनर अपडेट करें' : 'Update Skills'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Edit Contact Inline Drawer */}
        {isEditingContact && (
          <div className="mt-4 p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] animate-fadeIn grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">Phone Number</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">District / City</label>
              <input
                type="text"
                value={editDistrict}
                onChange={(e) => setEditDistrict(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">State</label>
              <input
                type="text"
                value={editState}
                onChange={(e) => setEditState(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full py-2 rounded-lg bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#224646] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 min-h-[36px]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Firestore</span>
              </button>
            </div>
          </div>
        )}

        {/* My Skills Tag Cloud */}
        <div className="mt-6 pt-6 border-t border-[#E5E0D5] dark:border-[#262F3D]">
          <span className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide block mb-2">
            {t.mySkills} ({userProfile.skills.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {userProfile.skills.length === 0 ? (
              <span className="text-xs text-[#8B867F] dark:text-[#94A3B8] italic">
                {t.noSkillsYet}
              </span>
            ) : (
              userProfile.skills.map((skill) => {
                const def = SKILL_TAXONOMY.find(s => s.canonical === skill.toLowerCase());
                return (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D] text-xs sm:text-sm font-bold shadow-2xs capitalize"
                  >
                    ★ {def && currentLanguage === 'hi' ? def.labelHi : skill}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Kaushal Bio-Data Banner Callout Card */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF9F5] via-white to-[#F0ECE1] dark:from-[#161B22] dark:via-[#10151C] dark:to-[#161B22] border-2 border-[#2D5A5A]/30 dark:border-[#2DD4BF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {currentLanguage === 'hi'
                  ? '1-क्लिक कौशल बायोडाटा व पहचान पत्र (Print & WhatsApp PDF)'
                  : '1-Click Kaushal Bio-Data & Skill Card'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E87D4D] text-white shadow-2xs">
                {currentLanguage === 'hi' ? 'नया फीचर' : 'NEW'}
              </span>
            </div>
            <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-medium mt-1 leading-relaxed">
              {currentLanguage === 'hi'
                ? 'नियोक्ताओं व ठेकेदारों को दिखाने के लिए प्रमाणित बायोडाटा। अपने सभी हुनर, अनुभव व सरकारी योजनाओं (पीएम विश्वकर्मा, पीएमकेवीवाई) की पात्रता एक पेशेवर पेज में प्रिंट या व्हाट्सएप करें।'
                : 'Shareable & printable verified trade profile for employers. Pre-formats your skills, experience, and scheme eligibility.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              if (onOpenBiodata) onOpenBiodata();
              else setShowBiodataModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#224646] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-extrabold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[40px] border border-[#224646] dark:border-[#14B8A6]"
          >
            <FileText className="w-4 h-4" />
            <span>{currentLanguage === 'hi' ? 'बायोडाटा बनाएं / डाउनलोड करें' : 'Generate Bio-Data / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D5] dark:border-[#262F3D] pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('recommended')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
            activeSubTab === 'recommended'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#262F3D]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t.recommendedJobs}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('schemes')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
            activeSubTab === 'schemes'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#262F3D]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t.recommendedSchemes} ({schemes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('saved')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
            activeSubTab === 'saved'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#262F3D]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{t.savedJobs} ({savedJobsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('saved_training')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
            activeSubTab === 'saved_training'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#262F3D]'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#E87D4D]" />
          <span>{currentLanguage === 'hi' ? 'सहेजे गए वीडियो' : 'Saved Tutorials'} ({savedTrainingList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('applications')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
            activeSubTab === 'applications'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#262F3D]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{t.myApplications} ({myApplicationsList.length})</span>
        </button>
      </div>

      {/* Tab 1: Recommended Jobs */}
      {activeSubTab === 'recommended' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobsRanked.slice(0, 9).map((matchResult) => (
              <JobCard
                key={matchResult.job.id}
                matchResult={matchResult}
                currentLanguage={currentLanguage}
                onViewDetails={onViewJobDetails}
                onQuickApply={onQuickApply}
                onToggleSave={onToggleSaveJob}
                isSaved={userProfile.savedJobIds.includes(matchResult.job.id)}
                isApplied={userProfile.appliedJobIds.includes(matchResult.job.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Recommended Schemes */}
      {activeSubTab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              relevanceScore={90}
              currentLanguage={currentLanguage}
              onExplainSimply={onExplainSchemeSimply}
              onAskChatbot={onAskSchemeChatbot}
            />
          ))}
        </div>
      )}

      {/* Tab 3: Saved Jobs */}
      {activeSubTab === 'saved' && (
        <div>
          {savedJobsList.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-6">
              <Bookmark className="w-10 h-10 text-[#8B867F] dark:text-[#94A3B8] opacity-50 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                {currentLanguage === 'hi' ? 'कोई नौकरी सेव नहीं की गई है।' : 'No saved jobs yet.'}
              </h3>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mt-1">
                {currentLanguage === 'hi' ? 'नौकरियों पर बुकमार्क आइकन दबाकर उन्हें यहाँ सहेजें।' : 'Bookmark jobs to view them later.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobsList.map((job) => {
                const result: JobMatchResult = {
                  job,
                  matchPercentage: 80,
                  matchedSkills: job.requiredSkills,
                  missingSkills: [],
                  locationMatch: true
                };
                return (
                  <JobCard
                    key={job.id}
                    matchResult={result}
                    currentLanguage={currentLanguage}
                    onViewDetails={onViewJobDetails}
                    onQuickApply={onQuickApply}
                    onToggleSave={onToggleSaveJob}
                    isSaved={true}
                    isApplied={userProfile.appliedJobIds.includes(job.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3.5: Saved Training & Tutorials */}
      {activeSubTab === 'saved_training' && (
        <div>
          {savedTrainingList.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-6">
              <GraduationCap className="w-10 h-10 text-[#8B867F] dark:text-[#94A3B8] opacity-50 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                {currentLanguage === 'hi' ? 'कोई वीडियो ट्यूटोरियल सहेजा नहीं गया है।' : 'No saved tutorials yet.'}
              </h3>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mt-1 mb-4">
                {currentLanguage === 'hi'
                  ? 'प्रशिक्षण सेक्शन में वीडियो देखकर उन्हें बाद में देखने के लिए बुकमार्क करें।'
                  : 'Explore training tutorials and bookmark them to practice technical skills anytime.'}
              </p>
              {onNavigateToTraining && (
                <button
                  type="button"
                  onClick={onNavigateToTraining}
                  className="px-4 py-2 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#224646] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <GraduationCap className="w-4 h-4 text-[#E87D4D]" />
                  <span>{currentLanguage === 'hi' ? 'प्रशिक्षण ट्यूटोरियल देखें' : 'Explore Training Videos'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrainingList.map((video) => (
                <TrainingCard
                  key={video.id}
                  video={video}
                  currentLanguage={currentLanguage}
                  isSaved={true}
                  onWatch={(v) => {
                    setSelectedTrainingVideo(v);
                    setIsTrainingModalOpen(true);
                  }}
                  onToggleSave={onToggleSaveTraining}
                  onExploreMatchingJobs={onExploreMatchingJobs}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Applications Tracker */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          {myApplicationsList.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-6">
              <FileCheck className="w-10 h-10 text-[#8B867F] dark:text-[#94A3B8] opacity-50 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                {currentLanguage === 'hi' ? 'अभी कोई आवेदन जमा नहीं किया है।' : 'No applications submitted yet.'}
              </h3>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mt-1">
                {currentLanguage === 'hi' ? 'उपयुक्त नौकरी खोजें और "आवेदन करें" पर क्लिक करें।' : 'Find jobs and click "Apply Now".'}
              </p>
            </div>
          ) : (
            myApplicationsList.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-[#161B22] p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">{app.jobTitle}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      app.status === 'shortlisted'
                        ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646]'
                        : app.status === 'under_review'
                        ? 'bg-[#FDF0EA] dark:bg-[#281812] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619]'
                        : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D]'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#8B867F] dark:text-[#94A3B8] mt-0.5">{app.employer}</p>
                  <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mt-1">Applied: {app.appliedDate}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] block">✓ Direct Employer Verified</span>
                    <span className="text-[11px] text-[#8B867F] dark:text-[#94A3B8]">Contact: {app.applicantPhone}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Kaushal Biodata Generator Modal */}
      <KaushalBiodataModal
        isOpen={showBiodataModal}
        onClose={() => setShowBiodataModal(false)}
        userProfile={userProfile}
        currentLanguage={currentLanguage}
        onUpdateProfile={onUpdateProfile}
        schemes={schemes}
      />

      {/* Training Video Player Modal */}
      <TrainingVideoModal
        video={selectedTrainingVideo}
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        currentLanguage={currentLanguage}
        isSaved={selectedTrainingVideo ? (userProfile.savedTrainingIds?.includes(selectedTrainingVideo.id) || false) : false}
        onToggleSave={onToggleSaveTraining}
        onExploreMatchingJobs={onExploreMatchingJobs}
      />

    </div>
  );
};
