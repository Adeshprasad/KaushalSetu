import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { ArrowRight, Sparkles, Mic, Compass, Landmark, ShieldCheck } from 'lucide-react';

interface LandingHeroProps {
  currentLanguage: Language;
  onFindOpportunities: () => void;
  onHowItWorks: () => void;
  onTryDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  currentLanguage,
  onFindOpportunities,
  onHowItWorks,
  onTryDemo,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F6F1] via-[#FAF9F5] to-[#F0ECE1] dark:from-[#0D1117] dark:via-[#111721] dark:to-[#161D28] py-10 sm:py-16 lg:py-20 border-b border-[#E5E0D5] dark:border-[#262F3D] transition-colors">
      
      {/* Background Decorative Motifs */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E5E0D5]/60 dark:bg-[#2D5A5A]/30 blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#D6E4E4]/40 dark:bg-[#E87D4D]/20 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Civic Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] shadow-2xs mb-5 text-xs font-semibold text-[#2B2927] dark:text-[#F1F5F9] transition-colors max-w-full">
          <span className="w-2 h-2 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF] animate-pulse shrink-0"></span>
          <span className="truncate">Regional Skill & Opportunity Bridge</span>
          <span className="text-[#8B867F] dark:text-[#64748B] hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-[#E87D4D] font-bold hidden sm:inline shrink-0">100% Free & Open Access</span>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight leading-tight sm:leading-tight max-w-4xl mx-auto [text-wrap:balance]">
          <span className="text-[#2D5A5A] dark:text-[#2DD4BF]">Kaushal</span><span className="text-[#E87D4D]">Setu</span>
          <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-[#3D3A37] dark:text-[#CBD5E1] mt-3 block font-serif">
            "{t.tagline}"
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-[#6B665F] dark:text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed [text-wrap:balance]">
          {t.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl mx-auto px-2">
          <button
            id="hero-find-opportunities-btn"
            onClick={onFindOpportunities}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#224646] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[46px]"
          >
            <span>{t.findOpportunities}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            id="hero-how-it-works-btn"
            onClick={onHowItWorks}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-sm sm:text-base border border-[#E5E0D5] dark:border-[#2D3748] shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
          >
            <span>{t.howItWorks}</span>
          </button>

          <button
            id="hero-try-demo-btn"
            onClick={onTryDemo}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#FDF0EA] dark:bg-[#341C12] hover:bg-[#FCE1D4] dark:hover:bg-[#452416] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#582A15] font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
          >
            <Sparkles className="w-4 h-4 text-[#E87D4D]" />
            <span className="truncate">{t.tryDemo} (Ravi Kumar)</span>
          </button>
        </div>

        {/* Trust Proof Metrics & Features */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-[#E5E0D5] dark:border-[#262F3D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          
          <div className="flex items-center gap-3 bg-white/90 dark:bg-[#161B22]/90 p-3.5 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium truncate">Voice & Local Dialects</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate">Hindi, Hinglish & More</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/90 dark:bg-[#161B22]/90 p-3.5 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-[#FDF0EA] dark:bg-[#341C12] text-[#E87D4D] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium truncate">Transparent Matching</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate">Deterministic % Match</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/90 dark:bg-[#161B22]/90 p-3.5 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium truncate">Government Schemes</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate">Plain Language Explainer</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/90 dark:bg-[#161B22]/90 p-3.5 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-[#FDF0EA] dark:bg-[#341C12] text-[#E87D4D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium truncate">No Middlemen</p>
              <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate">Direct Employer Connect</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
