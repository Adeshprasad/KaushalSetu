import React, { useState } from 'react';
import { JobMatchResult, Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../translations';
import { X, Building2, MapPin, Sparkles, CheckCircle2, Phone, ShieldCheck, ArrowRight, Loader2, Send, Navigation, ExternalLink, FileText, Landmark, Zap } from 'lucide-react';

interface JobDetailsModalProps {
  matchResult: JobMatchResult | null;
  currentLanguage: Language;
  onClose: () => void;
  onApply: (applicantData: { name: string; phone: string; experience: string; notes: string }) => Promise<void>;
  isApplied: boolean;
  userProfile: UserProfile;
  onOpenBiodata?: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  matchResult,
  currentLanguage,
  onClose,
  onApply,
  isApplied,
  userProfile,
  onOpenBiodata,
}) => {
  if (!matchResult) return null;

  const { job, matchPercentage, matchedSkills, missingSkills, aiExplanation, loadingExplanation } = matchResult;
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicantName, setApplicantName] = useState(userProfile.name || 'Ravi Kumar');
  const [applicantPhone, setApplicantPhone] = useState(userProfile.phone || '+91 98350 00000');
  const [experience, setExperience] = useState(String(userProfile.experienceYears || 2));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maps Grounding State
  const [loadingTransit, setLoadingTransit] = useState(false);
  const [transitData, setTransitData] = useState<{
    text: string;
    mapsUri?: string;
    places?: Array<{ title: string; uri: string; address?: string }>;
  } | null>(null);

  const fetchTransitGuide = async () => {
    if (transitData) return;
    setLoadingTransit(true);
    try {
      const res = await fetch('/api/maps/job-transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          employer: job.employer,
          location: job.location,
          state: job.state,
          userLocation: `${userProfile.district}, ${userProfile.state}`,
          language: currentLanguage
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTransitData(data);
      }
    } catch (e) {
      console.error('Error fetching transit guide:', e);
    } finally {
      setLoadingTransit(false);
    }
  };

  const destinationAddress = `${job.employer}, ${job.location}, ${job.state}`;
  const directMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationAddress)}`;
  const directDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`;

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onApply({
        name: applicantName,
        phone: applicantPhone,
        experience,
        notes,
      });
      setShowApplyForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="job-details-modal"
        className="bg-white dark:bg-[#161B22] w-full max-w-2xl rounded-2xl shadow-xl border border-[#E5E0D5] dark:border-[#262F3D] overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn transition-colors"
      >
        
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#10151C] flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold mb-1.5">
              <span>{matchPercentage}% {t.matchScore}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
              {currentLanguage === 'hi' && job.titleHi ? job.titleHi : job.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#8B867F] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8]" />
              <span>{job.employer}</span>
              {job.isVerified && (
                <ShieldCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" title="Verified Employer" />
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B867F] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Key Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#FAF9F5] dark:bg-[#10151C] p-3 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
              <span className="text-[11px] font-semibold text-[#8B867F] dark:text-[#94A3B8] block">वेतन / Salary</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9] block mt-0.5">
                ₹{job.salaryMin.toLocaleString('en-IN')} – {job.salaryMax.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#FAF9F5] dark:bg-[#10151C] p-3 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
              <span className="text-[11px] font-semibold text-[#8B867F] dark:text-[#94A3B8] block">स्थान / Location</span>
              <span className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] block mt-0.5">
                {job.location}, {job.state}
              </span>
            </div>
            <div className="bg-[#FAF9F5] dark:bg-[#10151C] p-3 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
              <span className="text-[11px] font-semibold text-[#8B867F] dark:text-[#94A3B8] block">अनुभव / Exp</span>
              <span className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] block mt-0.5">
                {job.experienceMinYears > 0 ? `${job.experienceMinYears}+ years` : 'Freshers welcome'}
              </span>
            </div>
            <div className="bg-[#FAF9F5] dark:bg-[#10151C] p-3 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
              <span className="text-[11px] font-semibold text-[#8B867F] dark:text-[#94A3B8] block">पद / Vacancies</span>
              <span className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] block mt-0.5">
                {job.vacancies} openings
              </span>
            </div>
          </div>

          {/* Third-Party Source Banner (If External / NCS / Apprenticeship) */}
          {job.source && job.source !== 'local' && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] dark:bg-[#132238] border border-[#BFDBFE] dark:border-[#1E3A8A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {job.source === 'apprenticeship' ? (
                  <Zap className="w-5 h-5 text-[#D97706] dark:text-[#FBBF24] shrink-0" />
                ) : (
                  <Landmark className="w-5 h-5 text-[#1D4ED8] dark:text-[#60A5FA] shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-[#1D4ED8] dark:text-[#93C5FD]">
                      {job.sourceName || (job.source === 'ncs' ? 'National Career Service (NCS - MoLE)' : 'Apprenticeship India (NAPS)')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#1E40AF] dark:text-[#BFDBFE]">
                      {t.externalSource}
                    </span>
                  </div>
                  {job.externalId && (
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-mono mt-0.5">
                      Registration ID: <span className="font-bold text-[#1E293B] dark:text-[#E2E8F0]">{job.externalId}</span>
                    </p>
                  )}
                </div>
              </div>

              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#3B82F6]/40 text-xs font-bold hover:bg-[#DBEAFE]/50 dark:hover:bg-[#1E3A8A] transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <span>{t.viewOfficialPortal}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Section: Why this job matches you (AI Generated) */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#FDF0EA] dark:bg-[#281812] border border-[#F6D3C2] dark:border-[#4E2619] shadow-2xs">
            <div className="flex items-center gap-2 text-[#9C431B] dark:text-[#FB923C] font-bold text-sm sm:text-base mb-2">
              <Sparkles className="w-5 h-5 text-[#E87D4D]" />
              <span>{t.whyJobMatchesYou}</span>
            </div>

            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] py-1">
                <Loader2 className="w-4 h-4 animate-spin text-[#E87D4D]" />
                <span>{t.generatingExplanation}</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#2B2927] dark:text-[#F1F5F9] leading-relaxed font-medium">
                {aiExplanation || (
                  currentLanguage === 'hi'
                    ? `यह नौकरी आपके हुनर (${matchedSkills.join(', ')}) से पूर्णतः मेल खाती है। वेतन ₹${job.salaryMin} से ₹${job.salaryMax} प्रति माह है।`
                    : `This job is a strong match based on your skills (${matchedSkills.join(', ')}). Offered salary is ₹${job.salaryMin} - ₹${job.salaryMax}/month.`
                )}
              </p>
            )}

            {/* Matched vs Missing Skills */}
            <div className="mt-3 pt-3 border-t border-[#F6D3C2] dark:border-[#4E2619] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold text-[#2D5A5A] dark:text-[#2DD4BF] block mb-1">
                  ✓ {currentLanguage === 'hi' ? 'आपके मेल खाते हुनर:' : 'Matched Skills:'}
                </span>
                <span className="text-[#2B2927] dark:text-[#F1F5F9] font-semibold capitalize">
                  {matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None listed'}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#8B867F] dark:text-[#94A3B8] block mb-1">
                  ○ {currentLanguage === 'hi' ? 'अतिरिक्त जरूरत:' : 'Other Skills:'}
                </span>
                <span className="text-[#6B665F] dark:text-[#CBD5E1] capitalize">
                  {missingSkills.length > 0 ? missingSkills.join(', ') : 'None required'}
                </span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mb-1">
              {currentLanguage === 'hi' ? 'कार्य विवरण / विवरण:' : 'Job Description:'}
            </h4>
            <p className="text-xs sm:text-sm text-[#2B2927] dark:text-[#CBD5E1] leading-relaxed font-medium">
              {currentLanguage === 'hi' && job.descriptionHi ? job.descriptionHi : job.description}
            </p>
          </div>

          {/* Required Education & Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF9F5] dark:bg-[#10151C] p-3.5 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
            <div>
              <span className="font-bold text-[#8B867F] dark:text-[#94A3B8] block">योग्यता / Education</span>
              <span className="font-semibold text-[#2B2927] dark:text-[#F1F5F9]">
                {currentLanguage === 'hi' && job.educationHi ? job.educationHi : job.education}
              </span>
            </div>
            <div>
              <span className="font-bold text-[#8B867F] dark:text-[#94A3B8] block">भर्ती प्रक्रिया / Joining Info</span>
              <span className="font-semibold text-[#2B2927] dark:text-[#F1F5F9]">
                {job.applicationInfo}
              </span>
            </div>
          </div>

          {/* Employer Contact Details */}
          {job.contactPhone && (
            <div className="p-3 bg-[#EBF1F1] dark:bg-[#152E2E] rounded-xl border border-[#CCE0E0] dark:border-[#1E4646] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2D5A5A] dark:text-[#2DD4BF] font-bold">
                <Phone className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0" />
                <span>नियोक्ता संपर्क / Direct Helpline: {job.contactPhone}</span>
              </div>
            </div>
          )}

          {/* Google Maps Location & Transit Guide (Maps Grounding) */}
          <div className="p-4 bg-[#FAF9F5] dark:bg-[#10151C] rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF]">
                  <MapPin className="w-3.5 h-3.5 text-[#E87D4D] shrink-0" />
                  <span>{currentLanguage === 'hi' ? 'गूगल मैप्स कार्यस्थल व यात्रा गाइड' : 'Google Maps Workplace & Transit Guide'}</span>
                </div>
                <p className="text-xs font-semibold text-[#2B2927] dark:text-[#F1F5F9] mt-0.5">
                  {job.employer} — {job.location}, {job.state}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <a
                  href={directMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] hover:border-[#2D5A5A] rounded-lg text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] transition-colors"
                >
                  <MapPin className="w-3 h-3 text-[#E87D4D]" />
                  <span>{currentLanguage === 'hi' ? 'मैप्स' : 'Maps'}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#8B867F]" />
                </a>
                <a
                  href={directDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] rounded-lg text-xs font-bold transition-colors"
                >
                  <Navigation className="w-3 h-3 text-[#FAF9F5] dark:text-[#0D1117]" />
                  <span>{currentLanguage === 'hi' ? 'रास्ता' : 'Directions'}</span>
                </a>
              </div>
            </div>

            {/* AI Grounded Commute Advice */}
            {!transitData ? (
              <button
                type="button"
                onClick={fetchTransitGuide}
                disabled={loadingTransit}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loadingTransit ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E87D4D]" />
                    <span>{currentLanguage === 'hi' ? 'गूगल मैप्स से रास्ता जानकारी लोड हो रही है...' : 'Fetching transit & landmark details from Google Maps...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
                    <span>{currentLanguage === 'hi' ? 'बस / ऑटो / स्टेशन से रास्ता दिशानिर्देश प्राप्त करें (Google Maps AI)' : 'Get Nearest Station, Bus & Landmark Transit Advice'}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-white dark:bg-[#161B22] p-3 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] space-y-2 text-xs animate-fadeIn">
                <p className="text-[#2B2927] dark:text-[#F1F5F9] leading-relaxed font-medium whitespace-pre-line">
                  {transitData.text}
                </p>
                {transitData.places && transitData.places.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E0D5] dark:border-[#262F3D] flex flex-wrap gap-2">
                    {transitData.places.map((p, i) => (
                      <a
                        key={i}
                        href={p.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] text-[11px] font-bold text-[#2D5A5A] dark:text-[#2DD4BF] hover:border-[#2D5A5A]"
                      >
                        <MapPin className="w-3 h-3 text-[#E87D4D]" />
                        <span>{p.title}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inline Application Form */}
          {showApplyForm && (
            <form onSubmit={handleSubmitApplication} className="p-4 bg-[#FAF9F5] dark:bg-[#10151C] rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] space-y-3 animate-fadeIn">
              <h4 className="text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {t.applyModalTitle}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#6B665F] dark:text-[#94A3B8] mb-1">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] font-medium focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] text-[#2B2927] dark:text-[#F1F5F9] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B665F] dark:text-[#94A3B8] mb-1">{t.phone}</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] font-medium focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] text-[#2B2927] dark:text-[#F1F5F9] outline-hidden"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-[#6B665F] dark:text-[#94A3B8] mb-1">{t.additionalNotes}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Example: मुझे 2 साल का अनुभव है, मैं तुरंत काम शुरू कर सकता हूँ।"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] font-medium focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] text-[#2B2927] dark:text-[#F1F5F9] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] cursor-pointer"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{t.submitApplication}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#10151C] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs sm:text-sm hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors cursor-pointer min-h-[40px]"
            >
              {t.close}
            </button>
            {onOpenBiodata && (
              <button
                type="button"
                onClick={onOpenBiodata}
                className="px-3.5 py-2.5 rounded-xl border border-[#2D5A5A]/30 dark:border-[#2DD4BF]/30 bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] hover:bg-[#CCE0E0] dark:hover:bg-[#1E4646] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'hi' ? 'बायोडाटा देखें / प्रिंट' : 'Kaushal Biodata'}</span>
              </button>
            )}
          </div>

          {!showApplyForm && (
            <button
              type="button"
              onClick={() => {
                if (!isApplied) {
                  setShowApplyForm(true);
                }
              }}
              disabled={isApplied}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                isApplied
                  ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] cursor-default'
                  : 'bg-[#E87D4D] hover:bg-[#D56B3A] text-white'
              }`}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                  <span>{t.applied}</span>
                </>
              ) : (
                <>
                  <span>{t.applyNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
