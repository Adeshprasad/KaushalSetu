import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { X, Mic, Sparkles, Briefcase, Award, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksModalProps {
  currentLanguage: Language;
  onClose: () => void;
  onGetStarted: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  currentLanguage,
  onClose,
  onGetStarted,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;
  const isHindi = currentLanguage === 'hi';

  const steps = isHindi
    ? [
        {
          num: '1',
          icon: <Mic className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
          title: 'अपनी भाषा में बोलें या लिखें',
          desc: 'माइक का बटन दबाएं और बताएं कि आप कौन सा काम (वेल्डिंग, सिलाई, बिजली, ड्राइविंग आदि) जानते हैं।'
        },
        {
          num: '2',
          icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          title: 'एआई द्वारा हुनर की पहचान',
          desc: 'सिस्टम आपके बोलचाल के शब्दों को मानकीकृत व्यावसायिक हुनर (Skills) में बदलता है, जिसे आप बदल भी सकते हैं।'
        },
        {
          num: '3',
          icon: <Briefcase className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
          title: 'सटीक नौकरी मिलान (Match %)',
          desc: 'पारदर्शी गणितीय स्कोर के साथ आपके हुनर और राज्य के अनुसार सत्यापित नियोक्ताओं की नौकरियां दिखाई जाती हैं।'
        },
        {
          num: '4',
          icon: <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          title: 'सरकारी योजनाओं की सरल जानकारी',
          desc: 'पीएम विश्वकर्मा, पीएमकेवीवाई आदि योजनाओं को सरल बोलचाल भाषा में समझें और ऑडियो में सुनें।'
        }
      ]
    : [
        {
          num: '1',
          icon: <Mic className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
          title: 'Speak or type in your language',
          desc: 'Press the mic button and describe what work you know (welding, tailoring, electrical, driving, etc.).'
        },
        {
          num: '2',
          icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          title: 'AI Skill Extraction',
          desc: 'The model extracts and normalizes your spoken words into structured vocational skill chips.'
        },
        {
          num: '3',
          icon: <Briefcase className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
          title: 'Deterministic Job Matching',
          desc: 'See verified jobs with transparent match % scores, matched requirements, and direct employer contacts.'
        },
        {
          num: '4',
          icon: <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          title: 'Plain-Language Scheme Assistant',
          desc: 'Understand official government schemes in simple non-intimidating words with read-aloud voice playback.'
        }
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="how-it-works-modal"
        className="bg-white dark:bg-[#161B22] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E0D5] dark:border-[#262F3D] overflow-hidden animate-fadeIn transition-colors max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#FAF9F5] dark:bg-[#10151C] border-b border-[#E5E0D5] dark:border-[#262F3D] flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
              <span>Easy 4-Step Process</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
              {t.howItWorks}
            </h2>
            <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-0.5">
              {isHindi ? 'कौशल सेतु कैसे काम करता है:' : 'How KaushalSetu connects rural youth to opportunities:'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D]"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] shadow-2xs flex items-center justify-center font-bold text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#E87D4D]">{isHindi ? `कदम ${step.num}` : `Step ${step.num}`}</span>
                  <span className="text-[#8B867F] dark:text-[#94A3B8] opacity-50">•</span>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#2B2927] dark:text-[#F1F5F9] truncate">{step.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF9F5] dark:bg-[#10151C] border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-[#161B22] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] cursor-pointer transition-colors min-h-[36px]"
          >
            {t.close}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onGetStarted();
            }}
            className="px-6 py-2.5 bg-[#E87D4D] hover:bg-[#D56B3A] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors min-h-[38px]"
          >
            <span>{isHindi ? 'शुरू करें' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
