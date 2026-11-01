import React, { useState } from 'react';
import { Language, SuccessStory } from '../types';
import { SUCCESS_STORIES, SUCCESS_METRICS } from '../data/successStoriesData';
import { 
  Award, 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  Quote, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  Sparkles,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';

interface SuccessStoriesSectionProps {
  currentLanguage: Language;
  onExploreMatchingJobs?: (skill: string) => void;
  onNavigateToTraining?: (skill?: string) => void;
  onNavigateToSchemes?: () => void;
}

export const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  currentLanguage,
  onExploreMatchingJobs,
  onNavigateToTraining,
  onNavigateToSchemes
}) => {
  const isHindi = currentLanguage === 'hi';
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [activeStoryModal, setActiveStoryModal] = useState<SuccessStory | null>(null);
  const [speakingStoryId, setSpeakingStoryId] = useState<string | null>(null);

  // Available unique trades and states for filtering
  const tradeOptions = [
    { id: 'all', labelEn: 'All Trades', labelHi: 'सभी ट्रेड' },
    { id: 'welding', labelEn: 'Welding & Metalwork', labelHi: 'वेल्डिंग व मेटलवर्क' },
    { id: 'tailoring', labelEn: 'Tailoring & Craft', labelHi: 'सिलाई व परिधान' },
    { id: 'electrical repair', labelEn: 'Solar & Electrical', labelHi: 'सोलर व इलेक्ट्रिकल' },
    { id: 'motorcycle repair', labelEn: 'Automotive & 2-Wheeler', labelHi: 'ऑटोमोटिव व मैकेनिक' },
    { id: 'plumbing', labelEn: 'Plumbing & Pipelines', labelHi: 'प्लंबिंग व पाइपलाइन' },
    { id: 'computer operator', labelEn: 'Digital & CSC Seva', labelHi: 'डिजिटल व सीएससी' }
  ];

  const stateOptions = ['all', 'Bihar', 'Uttar Pradesh', 'Jharkhand', 'Rajasthan', 'West Bengal'];

  const filteredStories = SUCCESS_STORIES.filter(story => {
    const matchesTrade = selectedTrade === 'all' || story.canonicalSkill === selectedTrade;
    const matchesState = selectedState === 'all' || story.state === selectedState;
    return matchesTrade && matchesState;
  });

  // Voice narration helper using Web Speech API
  const handleToggleVoice = (story: SuccessStory) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingStoryId === story.id) {
      window.speechSynthesis.cancel();
      setSpeakingStoryId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = isHindi
      ? `${story.nameHi}, ${story.district}, ${story.tradeHi}। ${story.quoteHi}`
      : `${story.name}, ${story.district}, ${story.trade}. ${story.quoteEn}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingStoryId(null);
    utterance.onerror = () => setSpeakingStoryId(null);

    setSpeakingStoryId(story.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="mt-16 pt-12 border-t border-[#E5E0D5] dark:border-[#262F3D] transition-colors">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold mb-2.5">
            <Users className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
            <span>{isHindi ? 'सच्ची सफलता की कहानियां' : 'Real Youth Success Stories'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
            {isHindi ? 'हुनर से बदली जिंदगी: हमारे सफल युवा' : 'Transforming Lives Through Verified Skills'}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#94A3B8] mt-1 max-w-2xl">
            {isHindi
              ? 'देखें कैसे ग्रामीण और कस्बाई युवाओं ने कौशलसेतु पर अपने व्यावहारिक हुनर को सत्यापित कराकर सम्मानजनक वेतन वाली नौकरियां पाईं।'
              : 'Read verified testimonials from rural youth who matched their practical skills with top employers and official government schemes.'}
          </p>
        </div>

        {/* Action button */}
        {onNavigateToSchemes && (
          <button
            type="button"
            onClick={onNavigateToSchemes}
            className="self-start md:self-auto px-4 py-2 bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#262F3D] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
            <span>{isHindi ? 'सरकारी योजनाएं देखें' : 'Explore Skill Schemes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Impact Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {SUCCESS_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] flex flex-col justify-between hover:border-[#CCE0E0] dark:hover:border-[#2D3748] transition-colors"
          >
            <span className="text-2xl sm:text-3xl font-black text-[#2D5A5A] dark:text-[#2DD4BF] tracking-tight">
              {metric.value}
            </span>
            <div className="mt-2">
              <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] leading-snug">
                {isHindi ? metric.labelHi : metric.labelEn}
              </p>
              <p className="text-[11px] sm:text-xs text-[#8B867F] dark:text-[#94A3B8] mt-0.5 font-medium">
                {isHindi ? metric.subHi : metric.subEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-[#FAF9F5] dark:bg-[#10151C] p-3 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D]">
        {/* Trade Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {tradeOptions.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTrade(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[34px] ${
                selectedTrade === t.id
                  ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
                  : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#2D3748]'
              }`}
            >
              {isHindi ? t.labelHi : t.labelEn}
            </button>
          ))}
        </div>

        {/* State Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] hidden md:inline">
            {isHindi ? 'राज्य:' : 'State:'}
          </span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] rounded-lg text-xs font-semibold text-[#2B2927] dark:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#2D5A5A] cursor-pointer min-h-[34px]"
          >
            <option value="all">{isHindi ? 'सभी राज्य' : 'All States'}</option>
            {stateOptions.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => {
          const isPlaying = speakingStoryId === story.id;
          return (
            <div
              key={story.id}
              className="rounded-2xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] p-5 sm:p-6 flex flex-col justify-between hover:border-[#CCE0E0] dark:hover:border-[#2D3748] hover:shadow-sm transition-all relative group"
            >
              {/* Top Row: Candidate Profile & Badges */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${story.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0`}>
                      {story.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                          {isHindi ? story.nameHi : story.name}
                        </h3>
                        <span title="Verified Placement" className="inline-flex">
                          <CheckCircle2 className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF] fill-[#EBF1F1] dark:fill-[#152E2E]" />
                        </span>
                      </div>
                      <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] flex items-center gap-1 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-[#E87D4D]" />
                        <span>{story.district}, {story.state}</span>
                      </p>
                    </div>
                  </div>

                  {/* Audio Listen Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVoice(story)}
                    title={isPlaying ? 'Stop Audio' : 'Listen to Story'}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isPlaying
                        ? 'bg-[#E87D4D] text-white border-[#E87D4D] animate-pulse'
                        : 'bg-[#FAF9F5] dark:bg-[#10151C] text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border-[#E5E0D5] dark:border-[#2D3748]'
                    }`}
                  >
                    {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Role and Employer Pill */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] mb-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                    <Briefcase className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                    <span>{isHindi && story.roleTitleHi ? story.roleTitleHi : story.roleTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B665F] dark:text-[#94A3B8] font-medium">
                    <Building2 className="w-3 h-3 text-[#8B867F] dark:text-[#94A3B8]" />
                    <span className="truncate">{isHindi && story.employerHi ? story.employerHi : story.employer}</span>
                  </div>
                </div>

                {/* Before vs After Income Growth */}
                <div className="mb-4 bg-[#EBF1F1] dark:bg-[#152E2E] rounded-xl p-2.5 border border-[#CCE0E0] dark:border-[#1E4646] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B867F] dark:text-[#94A3B8] block">
                      {isHindi ? 'पहले की आय' : 'Before'}
                    </span>
                    <span className="font-semibold text-[#6B665F] dark:text-[#94A3B8] line-through text-[11px]">
                      {isHindi ? story.previousIncomeHi : story.previousIncome}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#2D5A5A] dark:text-[#2DD4BF]">
                    <TrendingUp className="w-4 h-4" />
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A5A] dark:text-[#2DD4BF] block">
                      {isHindi ? 'वर्तमान आय' : 'Now Earning'}
                    </span>
                    <span className="font-extrabold text-[#2D5A5A] dark:text-[#2DD4BF] text-xs sm:text-sm">
                      {isHindi ? story.currentIncomeHi : story.currentIncome}
                    </span>
                  </div>
                </div>

                {/* Candidate Quote */}
                <div className="relative mb-4">
                  <Quote className="w-5 h-5 text-[#E5E0D5] dark:text-[#262F3D] absolute -top-1 -left-1 transform -rotate-12 pointer-events-none" />
                  <p className="text-xs sm:text-sm text-[#2B2927] dark:text-[#CBD5E1] leading-relaxed italic pl-3.5 border-l-2 border-[#E87D4D]">
                    "{isHindi ? story.quoteHi : story.quoteEn}"
                  </p>
                </div>

                {/* Key Milestone / Scheme Pill */}
                {story.verifiedSchemeUsed && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] text-[11px] font-semibold text-[#6B665F] dark:text-[#CBD5E1]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                    <span>{isHindi && story.verifiedSchemeUsedHi ? story.verifiedSchemeUsedHi : story.verifiedSchemeUsed}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveStoryModal(story)}
                  className="text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{isHindi ? 'पूरी कहानी पढ़ें' : 'Read Full Story'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1.5">
                  {onExploreMatchingJobs && (
                    <button
                      type="button"
                      onClick={() => onExploreMatchingJobs(story.canonicalSkill)}
                      className="px-2.5 py-1 bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#262F3D] text-[#2B2927] dark:text-[#F1F5F9] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title={isHindi ? 'समान नौकरियां देखें' : 'Find similar jobs'}
                    >
                      {isHindi ? 'नौकरियां' : 'Jobs'}
                    </button>
                  )}
                  {onNavigateToTraining && (
                    <button
                      type="button"
                      onClick={() => onNavigateToTraining(story.canonicalSkill)}
                      className="px-2.5 py-1 bg-[#EBF1F1] dark:bg-[#152E2E] hover:bg-[#CCE0E0] dark:hover:bg-[#1E4646] text-[#2D5A5A] dark:text-[#2DD4BF] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title={isHindi ? 'फ्री ट्रेनिंग वीडियो देखें' : 'Watch free training videos'}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12 bg-[#FAF9F5] dark:bg-[#10151C] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-6">
          <Users className="w-10 h-10 text-[#8B867F] dark:text-[#94A3B8] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[#2B2927] dark:text-[#F1F5F9]">
            {isHindi ? 'कोई कहानी नहीं मिली' : 'No success stories found'}
          </h3>
          <p className="text-xs text-[#6B665F] dark:text-[#94A3B8] mt-1">
            {isHindi ? 'कृपया दूसरा ट्रेड या राज्य फिल्टर चुनकर देखें।' : 'Try selecting a different trade or state filter.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTrade('all');
              setSelectedState('all');
            }}
            className="mt-4 px-4 py-2 bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#234747] dark:hover:bg-[#14B8A6]"
          >
            {isHindi ? 'सभी फिल्टर हटाएं' : 'Reset All Filters'}
          </button>
        </div>
      )}

      {/* Full Story Modal */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161B22] rounded-2xl max-w-lg w-full p-6 border border-[#E5E0D5] dark:border-[#262F3D] shadow-xl animate-fadeIn relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveStoryModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] text-[#6B665F] dark:text-[#94A3B8] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className={`w-14 h-14 rounded-2xl ${activeStoryModal.avatarBg} text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0`}>
                {activeStoryModal.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black text-[#2B2927] dark:text-[#F1F5F9]">
                    {isHindi ? activeStoryModal.nameHi : activeStoryModal.name}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                </div>
                <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-semibold mt-0.5">
                  {activeStoryModal.district}, {activeStoryModal.state} • {isHindi ? activeStoryModal.tradeHi : activeStoryModal.trade}
                </p>
                <p className="text-[11px] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold mt-0.5">
                  {isHindi ? `सत्यापित नियुक्ति: ${activeStoryModal.placedDate}` : `Verified Placement: ${activeStoryModal.placedDate}`}
                </p>
              </div>
            </div>

            {/* Income Progress Box */}
            <div className="mb-5 bg-[#FAF9F5] dark:bg-[#10151C] rounded-xl p-3.5 border border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wider block">
                  {isHindi ? 'कौशलसेतु से पहले' : 'Before KaushalSetu'}
                </span>
                <span className="text-xs font-semibold text-[#6B665F] dark:text-[#94A3B8] line-through">
                  {isHindi ? activeStoryModal.previousIncomeHi : activeStoryModal.previousIncome}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#2D5A5A] dark:text-[#2DD4BF] font-bold text-xs bg-[#EBF1F1] dark:bg-[#152E2E] px-2.5 py-1 rounded-full border border-[#CCE0E0] dark:border-[#1E4646]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isHindi ? '+280% वृद्धि' : '+280% Growth'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#2D5A5A] dark:text-[#2DD4BF] uppercase tracking-wider block">
                  {isHindi ? 'वर्तमान पक्का वेतन' : 'Verified Salary'}
                </span>
                <span className="text-sm font-black text-[#2D5A5A] dark:text-[#2DD4BF]">
                  {isHindi ? activeStoryModal.currentIncomeHi : activeStoryModal.currentIncome}
                </span>
              </div>
            </div>

            {/* Employer Details */}
            <div className="mb-5 p-3 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] space-y-1">
              <span className="text-[10px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wider block">
                {isHindi ? 'वर्तमान पद और नियोक्ता' : 'Current Role & Employer'}
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi && activeStoryModal.roleTitleHi ? activeStoryModal.roleTitleHi : activeStoryModal.roleTitle}
              </p>
              <p className="text-xs text-[#6B665F] dark:text-[#94A3B8]">
                {isHindi && activeStoryModal.employerHi ? activeStoryModal.employerHi : activeStoryModal.employer}
              </p>
            </div>

            {/* Full Quote */}
            <div className="mb-5">
              <span className="text-[10px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                {isHindi ? 'उम्मीदवार का अनुभव' : 'Candidate Experience'}
              </span>
              <p className="text-xs sm:text-sm text-[#2B2927] dark:text-[#CBD5E1] leading-relaxed italic bg-[#FAF9F5] dark:bg-[#10151C] p-3.5 rounded-xl border border-[#E5E0D5] dark:border-[#262F3D]">
                "{isHindi ? activeStoryModal.quoteHi : activeStoryModal.quoteEn}"
              </p>
            </div>

            {/* Key Milestone */}
            <div className="mb-6 p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] flex items-start gap-2.5">
              <Award className="w-4 h-4 text-[#E87D4D] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-[#E87D4D] uppercase tracking-wider block">
                  {isHindi ? 'विशेष उपलब्धि' : 'Key Milestone'}
                </span>
                <p className="text-xs font-semibold text-[#2B2927] dark:text-[#F1F5F9] mt-0.5">
                  {isHindi ? activeStoryModal.keyAchievementHi : activeStoryModal.keyAchievementEn}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D]">
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="px-4 py-2 bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#262F3D] text-[#2B2927] dark:text-[#F1F5F9] rounded-xl text-xs font-bold cursor-pointer min-h-[36px]"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
              {onExploreMatchingJobs && (
                <button
                  type="button"
                  onClick={() => {
                    const skill = activeStoryModal.canonicalSkill;
                    setActiveStoryModal(null);
                    onExploreMatchingJobs(skill);
                  }}
                  className="px-4 py-2 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs min-h-[36px]"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'इस ट्रेड में नौकरियां देखें' : 'Explore Matching Jobs'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
