import React, { useState, useMemo } from 'react';
import { Language, UserProfile, TrainingVideo } from '../types';
import { TRAINING_VIDEOS, getYoutubeSearchUrl, getYoutubeWatchUrl } from '../data/trainingVideos';
import { TrainingCard } from './TrainingCard';
import { TrainingVideoModal } from './TrainingVideoModal';
import { 
  GraduationCap, 
  Search, 
  Sparkles, 
  Award, 
  ExternalLink, 
  Filter, 
  Youtube, 
  BookOpen, 
  Layers,
  Play,
  Clock
} from 'lucide-react';

interface TrainingSectionProps {
  currentLanguage: Language;
  userProfile: UserProfile;
  onExploreMatchingJobs?: (skill: string) => void;
  onToggleSaveTraining?: (videoId: string) => void;
}

// Mini thumbnail with graceful fallback
const MiniVideoThumbnail: React.FC<{ video: TrainingVideo; title: string }> = ({ video, title }) => {
  const [imgSrc, setImgSrc] = useState<string>(
    video.thumbnailUrl || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : '')
  );
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  return (
    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#2D5A5A] to-[#1C3B3B] shrink-0 border border-black/10 shadow-2xs">
      {!hasFailed && imgSrc ? (
        <img
          src={imgSrc}
          alt={title}
          onError={() => {
            if (video.youtubeId && !imgSrc.includes('mqdefault')) {
              setImgSrc(`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`);
            } else {
              setHasFailed(true);
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D5A5A] to-[#E87D4D] text-white p-1 text-center">
          <Youtube className="w-4 h-4 text-white" />
          <span className="text-[9px] font-bold truncate max-w-full">{video.trade}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Play className="w-3 h-3 fill-current translate-x-0.5" />
        </div>
      </div>
      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
        {video.duration}
      </div>
    </div>
  );
};

export const TrainingSection: React.FC<TrainingSectionProps> = ({
  currentLanguage,
  userProfile,
  onExploreMatchingJobs,
  onToggleSaveTraining,
}) => {
  const isHindi = currentLanguage === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [onlyMySkills, setOnlyMySkills] = useState(false);

  // Video Player Modal State
  const [modalVideo, setModalVideo] = useState<TrainingVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Direct YouTube Search Bar State
  const [directYtQuery, setDirectYtQuery] = useState('');

  const quickSearchSuggestions = [
    { label: isHindi ? 'आर्क वेल्डिंग' : 'ARC Welding', query: 'arc and mig welding practical tutorial in hindi' },
    { label: isHindi ? 'सोलर पैनल इन्वर्टर' : 'Solar Inverter', query: 'rooftop solar panel installation and inverter wiring hindi' },
    { label: isHindi ? 'हाउस बिजली वायरिंग' : 'House Wiring', query: 'house wiring practical mcb box inverter connection in hindi' },
    { label: isHindi ? 'बाइक इंजन रिपेयर' : 'Bike Engine Repair', query: 'motorcycle engine repair clutch plate carburetor tuning in hindi' },
    { label: isHindi ? 'सिलाई व कटिंग' : 'Tailoring & Stitching', query: 'silai cutting and stitching kurti suit drafting tutorial hindi' },
    { label: isHindi ? 'मोबाइल रिपेयरिंग' : 'Mobile Repair', query: 'mobile repairing full course screen replacement charging jack hindi' },
    { label: isHindi ? 'प्लंबिंग व मोटर फिटिंग' : 'Plumbing Fitting', query: 'plumbing course cpvc upvc pipe water tank fitting hindi' },
    { label: isHindi ? 'ट्रैक्टर रोटावेटर' : 'Tractor Rotavator', query: 'tractor driving rotavator setting hydraulic service practical hindi' },
    { label: isHindi ? 'स्प्लिट एसी रिपेयर' : 'Split AC Repair', query: 'split ac installation flaring vacuum gas charging r32 hindi' },
    { label: isHindi ? 'सीएनसी जी-कोड' : 'CNC Machine G-Code', query: 'cnc machine operating practical course g code tool offset hindi' },
  ];

  const handleExecuteDirectYtSearch = (queryToSearch?: string) => {
    const q = (queryToSearch || directYtQuery || (isHindi ? 'तकनीकी कौशल ट्रेनिंग' : 'vocational technical training practical in hindi')).trim();
    const url = getYoutubeSearchUrl(q);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenVideoModal = (video: TrainingVideo) => {
    setModalVideo(video);
    setIsModalOpen(true);
  };

  // Available unique trade categories
  const tradeCategories = useMemo(() => {
    const trades = new Set(TRAINING_VIDEOS.map(v => v.trade));
    return ['all', ...Array.from(trades)];
  }, []);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return TRAINING_VIDEOS.filter(video => {
      // Search term matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = video.title.toLowerCase().includes(q) || (video.titleHi && video.titleHi.toLowerCase().includes(q));
        const matchDesc = video.description.toLowerCase().includes(q) || (video.descriptionHi && video.descriptionHi.toLowerCase().includes(q));
        const matchSkill = video.canonicalSkill.toLowerCase().includes(q);
        const matchTrade = video.trade.toLowerCase().includes(q);
        const matchTopics = video.topicsCovered.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchSkill && !matchTrade && !matchTopics) return false;
      }

      // Trade filter
      if (selectedTrade !== 'all' && video.trade !== selectedTrade) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'all' && video.level !== selectedLevel) {
        return false;
      }

      // Only my skills filter
      if (onlyMySkills && userProfile.skills.length > 0) {
        const matchesSkill = userProfile.skills.some(userSkill =>
          video.canonicalSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
          userSkill.toLowerCase().includes(video.canonicalSkill.toLowerCase())
        );
        if (!matchesSkill) return false;
      }

      return true;
    });
  }, [searchQuery, selectedTrade, selectedLevel, onlyMySkills, userProfile.skills]);

  // Recommended videos based on user skills
  const recommendedVideos = useMemo(() => {
    if (userProfile.skills.length === 0) return [];
    return TRAINING_VIDEOS.filter(video =>
      userProfile.skills.some(skill =>
        video.canonicalSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(video.canonicalSkill.toLowerCase())
      )
    );
  }, [userProfile.skills]);

  return (
    <div id="training-section-container" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C3B3B] to-[#2D5A5A] dark:from-[#0D1F1F] dark:to-[#173838] rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-sm relative overflow-hidden border border-[#CCE0E0]/30 dark:border-[#1E4646]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-3 border border-white/10 backdrop-blur-xs">
            <GraduationCap className="w-4 h-4 text-[#E87D4D]" />
            <span>{isHindi ? 'व्यावसायिक कौशल प्रशिक्षण व यूट्यूब वीडियो मास्टरक्लास' : 'Vocational Skill Training & YouTube Video Masterclasses'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {isHindi ? 'सीखें हुनर, पाएं बेहतर काम और अधिक कमाई' : 'Practical Trade Tutorials & Skill Development'}
          </h1>
          <p className="text-sm sm:text-base text-[#CCE0E0] leading-relaxed mb-6">
            {isHindi
              ? 'वेल्डिंग, सोलर पैनल, हाउस वायरिंग, सिलाई, मोटरसाइकिल व ट्रैक्टर रिपेयरिंग के प्रैक्टिकल यूट्यूब ट्यूटोरियल देखें और सरकारी कौशल योजनाओं से जुड़ें।'
              : 'Watch high-quality practical masterclasses for hands-on technical trades, explore syllabus topics, and connect with official government skill portals.'}
          </p>

          {/* Quick Stats / Highlights */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Youtube className="w-4 h-4 text-red-400 shrink-0" />
              <span>{TRAINING_VIDEOS.length} {isHindi ? 'प्रैक्टिकल ट्रेड वीडियो' : 'Practical Trade Masterclasses'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-[#E87D4D] shrink-0" />
              <span>{isHindi ? '100% मुफ्त सरकारी योजनाएं' : '100% Free Govt Skill Portals'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{isHindi ? 'इन-ऐप वीडियो प्लेयर व यूट्यूब लिंक' : 'In-App Video Player & YouTube'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct YouTube Vocational Search Bar Card */}
      <div className="bg-white dark:bg-[#161B22] rounded-3xl border-2 border-red-200 dark:border-red-900/60 p-4 sm:p-6 mb-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Youtube className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'यूट्यूब पर कोई भी हुनर या ट्रेड सीधे खोजें' : 'Search Any Trade or Skill Directly on YouTube'}
              </h2>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8]">
                {isHindi ? 'विषय लिखें और 1-क्लिक में यूट्यूब पर सबसे बेहतरीन हिंदी वीडियो ट्यूटोरियल देखें' : 'Type your skill topic to open top-ranked tutorials on YouTube directly'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
            <input
              type="text"
              value={directYtQuery}
              onChange={(e) => setDirectYtQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteDirectYtSearch();
              }}
              placeholder={isHindi ? 'उदा. इनवर्टर वायरिंग, वेल्डिंग सेटिंग, मोबाइल स्क्रीन चेंज, प्लंबिंग...' : 'e.g., solar inverter wiring, welding settings, mobile repair, carpentry...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] focus:bg-white dark:focus:bg-[#161B22] focus:border-red-500 text-xs sm:text-sm text-[#2B2927] dark:text-[#F1F5F9] outline-hidden font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => handleExecuteDirectYtSearch()}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer min-h-[42px]"
          >
            <Youtube className="w-4 h-4 fill-current shrink-0" />
            <span>{isHindi ? 'यूट्यूब पर खोजें' : 'Search YouTube'}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] shrink-0 mr-1">
            {isHindi ? 'लोकप्रिय विषय:' : 'Popular Topics:'}
          </span>
          {quickSearchSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDirectYtQuery(item.query);
                handleExecuteDirectYtSearch(item.query);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-red-50 dark:hover:bg-red-950/40 text-[#6B665F] dark:text-[#CBD5E1] hover:text-red-700 dark:hover:text-red-400 border border-[#E5E0D5] dark:border-[#2D3748] hover:border-red-200 dark:hover:border-red-800 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-2.5 h-2.5 text-red-500 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Official Govt Certification Links Bar */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <a
          href="https://www.skillindiadigital.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] p-4 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] transition-all hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF] shadow-2xs group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate flex items-center justify-between">
              <span>Skill India Digital</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B867F] group-hover:text-[#2D5A5A] dark:group-hover:text-[#2DD4BF] shrink-0" />
            </div>
            <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] mt-0.5 line-clamp-2">
              {isHindi ? 'मुफ्त ऑनलाइन कोर्स व सरकारी ई-सर्टिफिकेट' : 'Free online courses & government e-certificates'}
            </p>
          </div>
        </a>

        <a
          href="https://pmvishwakarma.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] p-4 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] transition-all hover:border-[#E87D4D] shadow-2xs group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF0EA] dark:bg-[#341C12] text-[#9C431B] dark:text-[#FB923C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate flex items-center justify-between">
              <span>PM Vishwakarma</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B867F] group-hover:text-[#9C431B] dark:group-hover:text-[#FB923C] shrink-0" />
            </div>
            <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] mt-0.5 line-clamp-2">
              {isHindi ? '₹15,000 टूलकिट प्रोत्साहन + 5 दिन की ट्रेनिंग' : '₹15,000 toolkit voucher + 5-day basic training'}
            </p>
          </div>
        </a>

        <a
          href="https://pmsuryaghar.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] p-4 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] transition-all hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF] shadow-2xs group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate flex items-center justify-between">
              <span>Surya Mitra Solar</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B867F] group-hover:text-[#2D5A5A] dark:group-hover:text-[#2DD4BF] shrink-0" />
            </div>
            <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] mt-0.5 line-clamp-2">
              {isHindi ? 'सोलर पैनल इंस्टालेशन व सर्विसिंग ट्रेनिंग' : 'Solar technician training & green jobs portal'}
            </p>
          </div>
        </a>

        <a
          href="https://bharatskills.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] p-4 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] transition-all hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF] shadow-2xs group flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] dark:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate flex items-center justify-between">
              <span>Bharat Skills (DGT)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B867F] group-hover:text-[#2B2927] dark:group-hover:text-[#F1F5F9] shrink-0" />
            </div>
            <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] mt-0.5 line-clamp-2">
              {isHindi ? 'ITI ई-बुक्स, प्रैक्टिकल वीडियो व प्रश्न बैंक' : 'ITI trade syllabus, e-books & practical mock tests'}
            </p>
          </div>
        </a>
      </div>

      {/* Recommended for Your Skills Banner (if skills exist) */}
      {userProfile.skills.length > 0 && recommendedVideos.length > 0 && (
        <div className="bg-[#FAF9F5] dark:bg-[#121820] rounded-3xl border border-[#CCE0E0] dark:border-[#1E4646] p-4 sm:p-6 mb-8 shadow-2xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D5A5A] dark:bg-[#152E2E] text-white dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#E87D4D] dark:text-[#2DD4BF]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                  {isHindi ? 'आपके हुनर के लिए अनुशंसित वीडियो' : 'Recommended for Your Stated Skills'}
                </h2>
                <p className="text-xs text-[#8B867F] dark:text-[#94A3B8]">
                  {isHindi
                    ? `आपके चुने गए हुनर (${userProfile.skills.join(', ')}) पर आधारित खास ट्यूटोरियल:`
                    : `Tailored for your profile (${userProfile.skills.join(', ')}):`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOnlyMySkills(!onlyMySkills)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                onlyMySkills
                  ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] border-[#2D5A5A]'
                  : 'bg-white dark:bg-[#161B22] text-[#2D5A5A] dark:text-[#2DD4BF] border-[#CCE0E0] dark:border-[#1E4646] hover:bg-[#EBF1F1] dark:hover:bg-[#1E2633]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{onlyMySkills ? (isHindi ? 'सभी वीडियो दिखाएं' : 'Show All Videos') : (isHindi ? 'केवल मेरे हुनर वाले' : 'Filter by My Skills')}</span>
            </button>
          </div>

          {/* Direct link cards for recommendations with Video Modal support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedVideos.slice(0, 3).map(video => {
              const itemTitle = isHindi ? video.titleHi : video.title;
              return (
                <div
                  key={`rec-${video.id}`}
                  onClick={() => handleOpenVideoModal(video)}
                  className="bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#2D3748] hover:border-red-300 dark:hover:border-red-800 hover:shadow-md p-3.5 transition-all flex items-center gap-3.5 group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleOpenVideoModal(video);
                  }}
                >
                  <MiniVideoThumbnail video={video} title={itemTitle} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-[#2B2927] dark:text-[#F1F5F9] group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug">
                      {itemTitle}
                    </div>
                    <div className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] flex items-center gap-1.5 mt-1">
                      <span className="font-semibold">{video.duration}</span>
                      <span>•</span>
                      <span className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold">{video.trade}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#161B22] rounded-3xl border border-[#E5E0D5] dark:border-[#262F3D] p-4 sm:p-5 mb-8 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? 'हुनर, ट्रेड या विषय खोजें (उदा. वेल्डिंग, इन्वर्टर, सिलाई, ट्रैक्टर)...' : 'Search by trade, skill or tool (e.g., welding, inverter, tailoring)...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] focus:bg-white dark:focus:bg-[#161B22] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] text-xs sm:text-sm text-[#2B2927] dark:text-[#F1F5F9] outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-xs sm:text-sm font-semibold text-[#2B2927] dark:text-[#F1F5F9] outline-hidden cursor-pointer"
            >
              <option value="all">{isHindi ? 'सभी स्तर (All Levels)' : 'All Levels'}</option>
              <option value="Beginner">{isHindi ? 'शुरुआती (Beginner)' : 'Beginner'}</option>
              <option value="Intermediate">{isHindi ? 'मध्यम (Intermediate)' : 'Intermediate'}</option>
              <option value="Advanced">{isHindi ? 'उन्नत (Advanced)' : 'Advanced'}</option>
            </select>
          </div>
        </div>

        {/* Trade Category Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#E5E0D5] dark:border-[#262F3D]">
          <span className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isHindi ? 'ट्रेड:' : 'Trade:'}</span>
          </span>
          {tradeCategories.map(trade => (
            <button
              key={trade}
              onClick={() => setSelectedTrade(trade)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedTrade === trade
                  ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] font-bold shadow-2xs'
                  : 'bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#2D3748]'
              }`}
            >
              {trade === 'all' ? (isHindi ? 'सभी ट्रेड (All)' : 'All Trades') : trade}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-[#2B2927] dark:text-[#F1F5F9] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
            <span>
              {isHindi ? 'व्यावहारिक ट्यूटोरियल व वीडियो कोर्स' : 'Practical Video Tutorials & Courses'}
            </span>
            <span className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] bg-[#FAF9F5] dark:bg-[#161B22] px-2.5 py-0.5 rounded-full border border-[#E5E0D5] dark:border-[#2D3748]">
              {filteredVideos.length}
            </span>
          </h2>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => {
              const isSaved = userProfile.savedTrainingIds?.includes(video.id) || false;
              const isMatched = userProfile.skills.some(userSkill =>
                video.canonicalSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
                userSkill.toLowerCase().includes(video.canonicalSkill.toLowerCase())
              );

              return (
                <TrainingCard
                  key={video.id}
                  video={video}
                  currentLanguage={currentLanguage}
                  isSaved={isSaved}
                  isMatchedWithUserSkills={isMatched}
                  onWatch={handleOpenVideoModal}
                  onToggleSave={onToggleSaveTraining}
                  onExploreMatchingJobs={onExploreMatchingJobs}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161B22] rounded-3xl border border-[#E5E0D5] dark:border-[#262F3D] p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] dark:bg-[#10151C] text-[#8B867F] dark:text-[#94A3B8] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
              {isHindi ? 'कोई वीडियो ट्यूटोरियल नहीं मिला' : 'No Video Tutorials Found'}
            </h3>
            <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mb-4">
              {isHindi ? 'कृपया अपने खोज शब्द बदलें या सभी ट्रेड चुनें।' : 'Try adjusting your search terms or selecting All Trades.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTrade('all');
                setSelectedLevel('all');
                setOnlyMySkills(false);
              }}
              className="px-4 py-2 bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] rounded-xl text-xs font-bold hover:bg-[#224646] dark:hover:bg-[#14B8A6] transition-colors cursor-pointer"
            >
              {isHindi ? 'सभी फिल्टर रीसेट करें' : 'Reset All Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <TrainingVideoModal
        video={modalVideo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLanguage={currentLanguage}
        isSaved={modalVideo ? (userProfile.savedTrainingIds?.includes(modalVideo.id) || false) : false}
        onToggleSave={onToggleSaveTraining}
        onExploreMatchingJobs={onExploreMatchingJobs}
      />
    </div>
  );
};
