import React from 'react';
import { DEMO_PERSONAS } from '../data/mockData';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { X, Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface DemoSelectorModalProps {
  currentLanguage: Language;
  onSelectPersona: (persona: typeof DEMO_PERSONAS[0]) => void;
  onClose: () => void;
}

export const DemoSelectorModal: React.FC<DemoSelectorModalProps> = ({
  currentLanguage,
  onSelectPersona,
  onClose,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="demo-persona-modal"
        className="bg-white dark:bg-[#161B22] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E0D5] dark:border-[#262F3D] overflow-hidden animate-fadeIn transition-colors max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#FAF9F5] dark:bg-[#10151C] border-b border-[#E5E0D5] dark:border-[#262F3D] flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDF0EA] dark:bg-[#281812] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619] text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
              <span>Instant Hackathon Evaluation Mode</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
              {currentLanguage === 'hi' ? 'डेमो प्रोफाइल चुनें' : 'Select a Test Persona'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-0.5">
              Click any candidate below to instantly populate skills, run deterministic job matching, and evaluate AI scheme simplifications.
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

        {/* Persona Cards Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          {DEMO_PERSONAS.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className="bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-[#FDF0EA] dark:hover:bg-[#241B18] border-2 border-[#E5E0D5] dark:border-[#262F3D] hover:border-[#F6D3C2] dark:hover:border-[#E87D4D]/50 p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] font-bold flex items-center justify-center text-sm shadow-2xs">
                      {persona.avatar || persona.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#2B2927] dark:text-[#F1F5F9] group-hover:text-[#9C431B] dark:group-hover:text-[#FB923C]">
                        {persona.name} {persona.nameHi ? `(${persona.nameHi})` : ''}
                      </h3>
                      <span className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-semibold">{persona.state}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#8B867F] dark:text-[#94A3B8] font-semibold mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0" />
                  <span>{persona.district}, {persona.state}</span>
                </div>

                {/* Spoken Query Quote */}
                <div className="p-2 bg-white dark:bg-[#161B22] rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] text-xs italic text-[#2B2927] dark:text-[#F1F5F9] mb-3">
                  "{persona.voiceSample}"
                </div>

                {/* Extracted Skills Chips */}
                <div className="flex flex-wrap gap-1">
                  {persona.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] text-[#2B2927] dark:text-[#F1F5F9] text-[11px] font-bold capitalize">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] group-hover:text-[#E87D4D] dark:group-hover:text-[#FB923C]">
                <span>{currentLanguage === 'hi' ? 'इस प्रोफाइल से टेस्ट करें' : 'Test this profile'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF9F5] dark:bg-[#10151C] border-t border-[#E5E0D5] dark:border-[#262F3D] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-[#161B22] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#2D3748] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs rounded-xl cursor-pointer transition-colors min-h-[36px]"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
