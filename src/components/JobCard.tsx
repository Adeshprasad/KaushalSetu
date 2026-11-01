import React, { useState, useEffect } from 'react';
import { JobMatchResult, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { speakJobOrScheme, subscribeSpeakerState } from '../utils/ttsHelper';
import { 
  MapPin, 
  Building2, 
  Check, 
  Circle, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  ShieldCheck, 
  Landmark, 
  Zap, 
  Globe,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

interface JobCardProps {
  matchResult: JobMatchResult;
  currentLanguage: Language;
  onViewDetails: (result: JobMatchResult) => void;
  onQuickApply: (result: JobMatchResult) => void;
  onToggleSave: (jobId: string) => void;
  isSaved: boolean;
  isApplied: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  matchResult,
  currentLanguage,
  onViewDetails,
  onQuickApply,
  onToggleSave,
  isSaved,
  isApplied,
}) => {
  const { job, matchPercentage, matchedSkills, missingSkills, locationMatch } = matchResult;
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeakerState((activeId) => {
      setIsSpeakingThis(activeId === `job-${job.id}`);
    });
    return unsubscribe;
  }, [job.id]);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jobTitle = currentLanguage === 'hi' && job.titleHi ? job.titleHi : job.title;
    const spokenText = currentLanguage === 'hi'
      ? `नौकरी का नाम: ${jobTitle}। कंपनी: ${job.employer}। स्थान: ${job.location}, ${job.state}। मासिक वेतन: ${job.salaryMin} से ${job.salaryMax} रुपये। आवश्यक हुनर: ${job.requiredSkills.join(', ')}।`
      : `Job: ${job.title} at ${job.employer}. Location: ${job.location}, ${job.state}. Salary: rupees ${job.salaryMin} to ${job.salaryMax} per month. Required skills: ${job.requiredSkills.join(', ')}.`;

    speakJobOrScheme(`job-${job.id}`, spokenText, currentLanguage);
  };

  // Visual color badge based on match percentage
  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 80) {
      return {
        badgeBg: 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border-[#CCE0E0] dark:border-[#1E4646]',
        textColor: 'text-[#2D5A5A] dark:text-[#2DD4BF]',
        ringColor: 'ring-teal-500/20'
      };
    } else if (pct >= 50) {
      return {
        badgeBg: 'bg-[#FDF0EA] dark:bg-[#341C12] text-[#9C431B] dark:text-[#FB923C] border-[#F6D3C2] dark:border-[#582A15]',
        textColor: 'text-[#9C431B] dark:text-[#FB923C]',
        ringColor: 'ring-orange-500/20'
      };
    } else {
      return {
        badgeBg: 'bg-[#F0ECE1] dark:bg-[#1A222D] text-[#6B665F] dark:text-[#94A3B8] border-[#E5E0D5] dark:border-[#2D3748]',
        textColor: 'text-[#6B665F] dark:text-[#94A3B8]',
        ringColor: 'ring-slate-500/20'
      };
    }
  };

  const badgeStyle = getMatchBadgeStyle(matchPercentage);

  return (
    <div 
      id={`job-card-${job.id}`}
      className={`bg-white dark:bg-[#161B22] rounded-3xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-xs hover:shadow-lg dark:hover:border-[#2DD4BF]/50 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between relative group w-full overflow-hidden ${
        isSpeakingThis ? 'ring-2 ring-[#E87D4D]' : ''
      }`}
    >
      <div>
        {/* Top Header: Match Badge + Location tag + Audio Speaker + Save Button */}
        <div className="flex items-start justify-between gap-2 mb-3">
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Match Percentage Pill */}
            <div className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold border ${badgeStyle.badgeBg} flex items-center gap-1.5 shadow-2xs`}>
              <span className="w-2 h-2 rounded-full bg-current shrink-0"></span>
              <span className="truncate">{matchPercentage}% {t.matchScore}</span>
            </div>

            {/* Source Badge */}
            {job.source === 'ncs' && (
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#3B82F6]/40 text-xs font-bold inline-flex items-center gap-1 shrink-0">
                <Landmark className="w-3 h-3" />
                <span>NCS Govt</span>
              </span>
            )}
            {job.source === 'apprenticeship' && (
              <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] dark:bg-[#2D2305] text-[#B45309] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#D97706]/40 text-xs font-bold inline-flex items-center gap-1 shrink-0">
                <Zap className="w-3 h-3" />
                <span>Apprentice</span>
              </span>
            )}
            {job.source === 'external' && (
              <span className="px-2 py-0.5 rounded-md bg-[#F3E8FF] dark:bg-[#2A1839] text-[#7E22CE] dark:text-[#C084FC] border border-[#E9D5FF] dark:border-[#A855F7]/40 text-xs font-bold inline-flex items-center gap-1 shrink-0">
                <Globe className="w-3 h-3" />
                <span>External</span>
              </span>
            )}

            {/* Location Badge */}
            {locationMatch && (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-[#FAF9F5] dark:bg-[#1A222D] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#264D4D] text-xs font-bold truncate">
                {currentLanguage === 'hi' ? 'आपके राज्य में' : 'In your state'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Readout Speaker Button (TTS for accessibility) */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isSpeakingThis
                  ? 'bg-[#E87D4D] text-white shadow-xs animate-pulse'
                  : 'bg-[#FAF9F5] dark:bg-[#1E2633] text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#2D3748]'
              }`}
              title={isSpeakingThis ? 'ऑडियो रोकें' : 'बोलकर सुनें'}
              aria-label={isSpeakingThis ? 'ऑडियो रोकें' : 'बोलकर सुनें'}
            >
              {isSpeakingThis ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">रोकें</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E87D4D]" />
                  <span className="text-[10px] hidden sm:inline">{currentLanguage === 'hi' ? 'सुनें' : 'Listen'}</span>
                </>
              )}
            </button>

            {/* Bookmark / Save Job Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job.id);
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'bg-[#FDF0EA] dark:bg-[#341C12] text-[#9C431B] dark:text-[#FB923C]'
                  : 'text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633]'
              }`}
              title={isSaved ? t.saved : t.saveJob}
              aria-label={isSaved ? t.saved : t.saveJob}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-[#E87D4D] text-[#E87D4D]" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Job Title */}
        <h3 className="text-base sm:text-lg font-extrabold text-[#2B2927] dark:text-[#F1F5F9] leading-snug group-hover:text-[#2D5A5A] dark:group-hover:text-[#2DD4BF] transition-colors break-words">
          {currentLanguage === 'hi' && job.titleHi ? job.titleHi : job.title}
        </h3>

        {/* Employer & Verification */}
        <div className="flex items-center gap-1.5 text-[#6B665F] dark:text-[#94A3B8] font-semibold text-xs sm:text-sm mt-1">
          <Building2 className="w-3.5 h-3.5 text-[#8B867F] dark:text-[#94A3B8] shrink-0" />
          <span className="truncate">{job.employer}</span>
          {job.isVerified && (
            <ShieldCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0" title="Verified Employer" />
          )}
        </div>

        {/* Location & Vacancies */}
        <div className="flex flex-wrap items-center gap-1.5 text-[#8B867F] dark:text-[#94A3B8] text-xs mt-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#E87D4D] shrink-0" />
            <span className="font-medium truncate">{job.location}, {job.state}</span>
          </span>
          <span aria-hidden="true" className="text-[#8B867F]/60">·</span>
          <span className="font-medium text-[#6B665F] dark:text-[#CBD5E1]">
            {job.vacancies} {t.vacanciesText}
          </span>
          <span aria-hidden="true" className="text-[#8B867F]/60">·</span>
          <span className="font-medium text-[#6B665F] dark:text-[#CBD5E1]">
            {job.workType}
          </span>
          {job.externalId && (
            <>
              <span aria-hidden="true" className="text-[#8B867F]/60">·</span>
              <span className="font-mono text-[10px] text-[#6B665F] dark:text-[#94A3B8] bg-[#FAF9F5] dark:bg-[#1E2633] px-1.5 py-0.5 rounded border border-[#E5E0D5] dark:border-[#262F3D]">
                {job.externalId}
              </span>
            </>
          )}
        </div>

        {/* Salary Row */}
        <div className="mt-3.5 pt-3 border-t border-[#E5E0D5]/70 dark:border-[#262F3D]/70 flex items-center justify-between text-xs">
          <span className="text-[#8B867F] dark:text-[#94A3B8] font-medium">
            {currentLanguage === 'hi' ? 'मासिक वेतन' : 'Salary Range'}
          </span>
          <span className="font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tabular-nums text-sm">
            ₹{job.salaryMin.toLocaleString('en-IN')} – ₹{job.salaryMax.toLocaleString('en-IN')}
            <span className="text-[11px] font-normal text-[#8B867F] dark:text-[#94A3B8] ml-1">{t.salaryPerMonth}</span>
          </span>
        </div>

        {/* Matched vs Missing Skills Breakdown */}
        <div className="mt-4 space-y-2 text-xs">
          {/* Matched Skills */}
          {matchedSkills.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#2D5A5A] dark:text-[#2DD4BF] whitespace-nowrap pt-0.5">
                {t.matchedSkillsLabel}
              </span>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] font-bold capitalize text-[11px]">
                    <Check className="w-3 h-3 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-[#8B867F] dark:text-[#94A3B8] whitespace-nowrap pt-0.5">
                {t.missingSkillsLabel}
              </span>
              <div className="flex flex-wrap gap-1">
                {missingSkills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F0ECE1] dark:bg-[#1E2633] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#2D3748] font-medium capitalize text-[11px]">
                    <Circle className="w-2.5 h-2.5 text-[#8B867F]" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Action Buttons: View Job Details + Quick Apply */}
      <div className="mt-5 pt-3.5 border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(matchResult)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#283243] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
          <span>{t.viewJob}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8B867F] dark:text-[#94A3B8]" />
        </button>

        <button
          type="button"
          onClick={() => onQuickApply(matchResult)}
          disabled={isApplied}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer min-h-[42px] shrink-0 active:scale-95 ${
            isApplied
              ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] cursor-default'
              : 'bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234848] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117]'
          }`}
        >
          {isApplied ? t.applied : t.applyNow}
        </button>
      </div>

    </div>
  );
};
