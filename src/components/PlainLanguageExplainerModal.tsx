import React, { useState, useEffect } from 'react';
import { GovernmentScheme, Language, SimplifiedScheme } from '../types';
import { TRANSLATIONS } from '../translations';
import { X, Sparkles, Volume2, VolumeX, CheckCircle2, Award, FileText, ArrowRight, ShieldCheck, ExternalLink, Loader2, MapPin } from 'lucide-react';

interface PlainLanguageExplainerModalProps {
  scheme: GovernmentScheme | null;
  simplified: SimplifiedScheme | null;
  isLoading: boolean;
  currentLanguage: Language;
  onClose: () => void;
  onAskQuestions: (scheme: GovernmentScheme) => void;
  onLocateNearbyCenters?: () => void;
}

export const PlainLanguageExplainerModal: React.FC<PlainLanguageExplainerModalProps> = ({
  scheme,
  simplified,
  isLoading,
  currentLanguage,
  onClose,
  onAskQuestions,
  onLocateNearbyCenters,
}) => {
  if (!scheme) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Stop audio speech when modal unmounts or closes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech audio is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      
      const simpleText = simplified?.inSimpleWords || scheme.descriptionHi || scheme.description;
      const benefitsText = (simplified?.whatYouGet || scheme.benefitsHi || scheme.benefits).join('. ');
      const textToSpeak = `${scheme.nameHi || scheme.name}। ${simpleText}। आपको मिलेंगे: ${benefitsText}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      if (currentLanguage === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (currentLanguage === 'bn') {
        utterance.lang = 'bn-IN';
      } else if (currentLanguage === 'ta') {
        utterance.lang = 'ta-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="plain-language-explainer-modal"
        className="bg-white dark:bg-[#161B22] w-full max-w-2xl rounded-2xl shadow-xl border border-[#E5E0D5] dark:border-[#262F3D] overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn transition-colors"
      >
        
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#10151C] flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDF0EA] dark:bg-[#281812] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619] text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
              <span>{t.explainThisSimply} (AI Plain Language)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
              {currentLanguage === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#8B867F] dark:text-[#94A3B8] mt-0.5">
              {currentLanguage === 'hi' && scheme.ministryHi ? scheme.ministryHi : scheme.ministry}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Read Aloud Voice Button for Accessibility */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer min-h-[38px] ${
                isPlayingAudio
                  ? 'bg-[#E87D4D] text-white border-[#E87D4D] animate-pulse'
                  : 'bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] border-[#E5E0D5] dark:border-[#2D3748] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633]'
              }`}
              title={isPlayingAudio ? t.stopAudio : t.readAloud}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#E87D4D]" />}
              <span className="hidden sm:inline">{isPlayingAudio ? t.stopAudio : t.readAloud}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#8B867F] dark:text-[#94A3B8]">
              <Loader2 className="w-8 h-8 animate-spin text-[#E87D4D]" />
              <p className="text-sm font-bold">{t.generatingExplanation}</p>
            </div>
          ) : (
            <>
              {/* 1. In Simple Words */}
              <div className="p-4 rounded-xl bg-[#FDF0EA] dark:bg-[#281812] border border-[#F6D3C2] dark:border-[#4E2619]">
                <span className="text-xs font-bold text-[#9C431B] dark:text-[#FB923C] uppercase tracking-wide block mb-1">
                  💬 {t.inSimpleWords}
                </span>
                <p className="text-sm sm:text-base font-semibold text-[#2B2927] dark:text-[#F1F5F9] leading-relaxed">
                  {simplified?.inSimpleWords || (
                    currentLanguage === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description
                  )}
                </p>
              </div>

              {/* 2. Who may be eligible */}
              <div>
                <h4 className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                  <span>{t.whoMayBeEligible}</span>
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {(simplified?.whoMayBeEligible || (currentLanguage === 'hi' && scheme.eligibilityHi ? scheme.eligibilityHi : scheme.eligibility)).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] text-xs sm:text-sm font-medium text-[#2B2927] dark:text-[#F1F5F9] flex items-start gap-2">
                      <span className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. What you get */}
              <div>
                <h4 className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#E87D4D]" />
                  <span>{t.whatYouGet}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(simplified?.whatYouGet || (currentLanguage === 'hi' && scheme.benefitsHi ? scheme.benefitsHi : scheme.benefits)).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#EBF1F1] dark:bg-[#152E2E] border border-[#CCE0E0] dark:border-[#1E4646] text-xs sm:text-sm font-semibold text-[#2D5A5A] dark:text-[#2DD4BF] flex items-start gap-2">
                      <span className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold shrink-0">★</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. How do I apply? */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-[#E87D4D]" />
                    <span>{t.howDoIApply}</span>
                  </h4>

                  {onLocateNearbyCenters && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLocateNearbyCenters();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EBF1F1] dark:bg-[#152E2E] hover:bg-[#CCE0E0] dark:hover:bg-[#1E4646] text-[#2D5A5A] dark:text-[#2DD4BF] rounded-md text-xs font-bold transition-colors cursor-pointer border border-[#CCE0E0] dark:border-[#1E4646] self-start sm:self-auto"
                    >
                      <MapPin className="w-3 h-3 text-[#E87D4D]" />
                      <span>{currentLanguage === 'hi' ? 'नजदीकी सीएससी केंद्र खोजें' : 'Find Nearest Center (Maps)'}</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {(simplified?.howToApply || (currentLanguage === 'hi' && scheme.applicationProcessHi ? scheme.applicationProcessHi : scheme.applicationProcess)).map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] text-xs sm:text-sm font-medium text-[#2B2927] dark:text-[#F1F5F9] flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Documents needed */}
              <div className="p-3.5 bg-[#FAF9F5] dark:bg-[#10151C] rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
                <h4 className="text-xs font-bold text-[#6B665F] dark:text-[#94A3B8] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8]" />
                  <span>{t.documentsNeeded}</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(simplified?.documentsNeeded || (currentLanguage === 'hi' && scheme.documentsHi ? scheme.documentsHi : scheme.documents)).map((doc, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] text-xs font-semibold text-[#2B2927] dark:text-[#F1F5F9] shadow-2xs">
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Official Source & Disclaimer */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8B867F] dark:text-[#94A3B8]">
                <a
                  href={scheme.officialSource.split(' ')[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                  <span>{t.officialSource}: {scheme.officialSource}</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>

                <span className="text-[11px] italic text-[#8B867F] dark:text-[#94A3B8]">
                  {simplified?.disclaimer || (currentLanguage === 'hi' ? 'सत्यापन आधिकारिक पोर्टल पर किया जाएगा।' : 'Verification at official portal.')}
                </span>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#10151C] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs sm:text-sm hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors cursor-pointer min-h-[40px]"
          >
            {t.close}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onAskQuestions(scheme);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#E87D4D] hover:bg-[#D56B3A] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <span>{t.askQuestions}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
