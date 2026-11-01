import React, { useState, useEffect } from 'react';
import { GovernmentScheme, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { speakJobOrScheme, subscribeSpeakerState } from '../utils/ttsHelper';
import { 
  Award, 
  Sparkles, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  Volume2, 
  VolumeX,
  ArrowRight
} from 'lucide-react';

interface SchemeCardProps {
  scheme: GovernmentScheme;
  relevanceScore?: number;
  currentLanguage: Language;
  onExplainSimply: (scheme: GovernmentScheme) => void;
  onAskChatbot: (scheme: GovernmentScheme) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  relevanceScore,
  currentLanguage,
  onExplainSimply,
  onAskChatbot,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeakerState((activeId) => {
      setIsSpeakingThis(activeId === `scheme-${scheme.id}`);
    });
    return unsubscribe;
  }, [scheme.id]);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const schemeName = currentLanguage === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name;
    const desc = currentLanguage === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description;
    const spokenText = currentLanguage === 'hi'
      ? `सरकारी योजना: ${schemeName}। ${desc}। सहायता राशि या लाभ: ${scheme.stipendOrAidHi || scheme.stipendOrAid || 'उपलब्ध'}।`
      : `Government Scheme: ${scheme.name}. ${scheme.description}. Benefits: ${scheme.stipendOrAid || 'Available'}.`;

    speakJobOrScheme(`scheme-${scheme.id}`, spokenText, currentLanguage);
  };

  return (
    <div 
      id={`scheme-card-${scheme.id}`}
      className={`bg-white dark:bg-[#161B22] rounded-3xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-xs hover:shadow-lg dark:hover:border-[#2DD4BF]/50 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between relative group w-full overflow-hidden ${
        isSpeakingThis ? 'ring-2 ring-[#E87D4D]' : ''
      }`}
    >
      <div>
        {/* Top Badges: Category + Relevance Score + Audio readout */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
              <span className="truncate">{scheme.category}</span>
            </span>

            {relevanceScore !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-[#FDF0EA] dark:bg-[#341C12] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#582A15] text-xs font-extrabold truncate">
                {relevanceScore}% {currentLanguage === 'hi' ? 'उपयुक्त' : 'Relevant'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Readout Speaker Button */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isSpeakingThis
                  ? 'bg-[#E87D4D] text-white shadow-xs animate-pulse'
                  : 'bg-[#FAF9F5] dark:bg-[#1E2633] text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#2D3748]'
              }`}
              title={isSpeakingThis ? 'ऑडियो रोकें' : 'योजना बोलकर सुनें'}
              aria-label={isSpeakingThis ? 'ऑडियो रोकें' : 'योजना बोलकर सुनें'}
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

            {scheme.stipendOrAid && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F0ECE1] dark:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] text-[11px] font-bold border border-[#E5E0D5] dark:border-[#2D3748] hidden sm:inline-block truncate">
                {currentLanguage === 'hi' && scheme.stipendOrAidHi ? scheme.stipendOrAidHi.split('+')[0] : scheme.stipendOrAid.split('+')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Scheme Name */}
        <h3 className="text-base sm:text-xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] leading-snug group-hover:text-[#2D5A5A] dark:group-hover:text-[#2DD4BF] transition-colors break-words">
          {currentLanguage === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
        </h3>

        {/* Ministry */}
        <p className="text-xs font-semibold text-[#8B867F] dark:text-[#94A3B8] mt-1 truncate">
          {currentLanguage === 'hi' && scheme.ministryHi ? scheme.ministryHi : scheme.ministry}
        </p>

        {/* Description */}
        <p className="mt-3 text-xs sm:text-sm text-[#6B665F] dark:text-[#CBD5E1] leading-relaxed font-medium line-clamp-3">
          {currentLanguage === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description}
        </p>

        {/* Eligibility Preview */}
        <div className="mt-3.5 pt-3 border-t border-[#E5E0D5]/70 dark:border-[#262F3D]/70">
          <span className="text-xs font-semibold text-[#6B665F] dark:text-[#94A3B8] block mb-1.5">
            {t.youMayBeEligible}
          </span>
          <ul className="space-y-1.5 text-xs text-[#2B2927] dark:text-[#E2E8F0]">
            {(currentLanguage === 'hi' && scheme.eligibilityHi ? scheme.eligibilityHi : scheme.eligibility).slice(0, 2).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold shrink-0 mt-0.5">•</span>
                <span className="break-words leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Official Source Link */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <a
            href={scheme.officialSource.split(' ')[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2D5A5A] dark:hover:text-[#2DD4BF] flex items-center gap-1 font-semibold underline underline-offset-2 transition-colors cursor-pointer truncate max-w-[200px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0" />
            <span className="truncate">{t.officialSource}</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60 shrink-0" />
          </a>

          {scheme.duration && (
            <span className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-semibold shrink-0">
              अवधि: {scheme.duration}
            </span>
          )}
        </div>

      </div>

      {/* Action Buttons: Explain Simply (AI) + Ask Question (Chatbot) */}
      <div className="mt-5 pt-3.5 border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onExplainSimply(scheme)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234848] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E87D4D] dark:text-[#0D1117]" />
          <span className="truncate">{t.explainThisSimply}</span>
        </button>

        <button
          type="button"
          onClick={() => onAskChatbot(scheme)}
          className="py-2.5 px-3.5 rounded-xl bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#283243] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] shrink-0 border border-[#E5E0D5] dark:border-[#2D3748]"
          title={t.askQuestions}
        >
          <MessageSquare className="w-4 h-4 text-[#E87D4D]" />
          <span className="hidden sm:inline">{t.askQuestions}</span>
        </button>
      </div>

    </div>
  );
};
