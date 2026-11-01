import React, { useState } from 'react';
import { TrainingVideo, Language } from '../types';
import { getYoutubeWatchUrl, getYoutubeSearchUrl } from '../data/trainingVideos';
import { 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Clock, 
  Youtube, 
  Sparkles, 
  Search,
  Play,
  Wrench,
  Zap,
  Sun,
  Flame,
  Scissors,
  Smartphone,
  Droplets,
  Tractor,
  HardHat,
  Wind,
  Hammer,
  Cpu
} from 'lucide-react';

interface TrainingCardProps {
  video: TrainingVideo;
  currentLanguage: Language;
  isSaved?: boolean;
  isMatchedWithUserSkills?: boolean;
  onWatch?: (video: TrainingVideo) => void;
  onToggleSave?: (videoId: string) => void;
  onExploreMatchingJobs?: (skill: string) => void;
}

// Trade iconography & color theme mapping
const getTradeTheme = (canonicalSkill: string) => {
  switch (canonicalSkill.toLowerCase()) {
    case 'welding':
      return {
        icon: Flame,
        gradient: 'from-[#EA580C] via-[#C2410C] to-[#1E293B]',
        bgLight: 'bg-orange-50 text-orange-700 border-orange-200',
        accent: '#EA580C'
      };
    case 'solar installation':
      return {
        icon: Sun,
        gradient: 'from-[#0D9488] via-[#0F766E] to-[#0F172A]',
        bgLight: 'bg-teal-50 text-teal-700 border-teal-200',
        accent: '#0D9488'
      };
    case 'electrical repair':
      return {
        icon: Zap,
        gradient: 'from-[#2563EB] via-[#1D4ED8] to-[#0F172A]',
        bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
        accent: '#2563EB'
      };
    case 'motorcycle repair':
      return {
        icon: Wrench,
        gradient: 'from-[#DC2626] via-[#991B1B] to-[#18181B]',
        bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
        accent: '#DC2626'
      };
    case 'tailoring':
      return {
        icon: Scissors,
        gradient: 'from-[#9333EA] via-[#7E22CE] to-[#18181B]',
        bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
        accent: '#9333EA'
      };
    case 'mobile repair':
      return {
        icon: Smartphone,
        gradient: 'from-[#0891B2] via-[#0E7490] to-[#0F172A]',
        bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        accent: '#0891B2'
      };
    case 'plumbing':
      return {
        icon: Droplets,
        gradient: 'from-[#0284C7] via-[#0369A1] to-[#0F172A]',
        bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
        accent: '#0284C7'
      };
    case 'tractor driving':
      return {
        icon: Tractor,
        gradient: 'from-[#16A34A] via-[#15803D] to-[#14532D]',
        bgLight: 'bg-green-50 text-green-700 border-green-200',
        accent: '#16A34A'
      };
    case 'masonry':
      return {
        icon: HardHat,
        gradient: 'from-[#D97706] via-[#B45309] to-[#1C1917]',
        bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
        accent: '#D97706'
      };
    case 'ac and refrigeration repair':
      return {
        icon: Wind,
        gradient: 'from-[#06B6D4] via-[#0891B2] to-[#0F172A]',
        bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        accent: '#06B6D4'
      };
    case 'carpentry':
      return {
        icon: Hammer,
        gradient: 'from-[#B45309] via-[#92400E] to-[#292524]',
        bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
        accent: '#B45309'
      };
    case 'cnc machine operation':
    default:
      return {
        icon: Cpu,
        gradient: 'from-[#6366F1] via-[#4F46E5] to-[#0F172A]',
        bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        accent: '#6366F1'
      };
  }
};

export const TrainingCard: React.FC<TrainingCardProps> = ({
  video,
  currentLanguage,
  isSaved = false,
  isMatchedWithUserSkills = false,
  onWatch,
  onToggleSave,
  onExploreMatchingJobs,
}) => {
  const isHindi = currentLanguage === 'hi';
  const title = isHindi ? video.titleHi : video.title;
  const description = isHindi ? video.descriptionHi : video.description;
  const searchQuery = isHindi && video.searchQueryHi ? video.searchQueryHi : video.searchQuery;
  const directYoutubeWatchUrl = getYoutubeWatchUrl(video.youtubeId, searchQuery);
  const directYoutubeSearchUrl = getYoutubeSearchUrl(searchQuery);

  const theme = getTradeTheme(video.canonicalSkill);
  const TradeIcon = theme.icon;

  // Thumbnail states with multi-stage fallback
  const initialThumb = video.thumbnailUrl || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : '');
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(initialThumb);
  const [isImgLoaded, setIsImgLoaded] = useState<boolean>(false);
  const [isImgFailed, setIsImgFailed] = useState<boolean>(false);
  const [hasTriedFallback, setHasTriedFallback] = useState<boolean>(false);

  const handleImageError = () => {
    if (!hasTriedFallback && video.youtubeId) {
      setHasTriedFallback(true);
      setCurrentImgSrc(`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`);
    } else {
      setIsImgFailed(true);
      setIsImgLoaded(true);
    }
  };

  const levelColor = {
    Beginner: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Intermediate: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Advanced: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  }[video.level] || 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  const handleCardClick = (e: React.MouseEvent) => {
    if (onWatch) {
      e.preventDefault();
      onWatch(video);
    }
  };

  return (
    <div
      id={`training-card-${video.id}`}
      className={`bg-white dark:bg-[#161B22] rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:shadow-lg w-full ${
        isMatchedWithUserSkills 
          ? 'border-[#2D5A5A] dark:border-[#2DD4BF] ring-2 ring-[#2D5A5A]/20 dark:ring-[#2DD4BF]/20' 
          : 'border-[#E5E0D5] dark:border-[#262F3D] hover:border-[#CCE0E0] dark:hover:border-[#38B2AC]/40'
      }`}
    >
      <div>
        {/* Interactive Thumbnail Banner */}
        <div
          onClick={handleCardClick}
          className="relative aspect-video w-full block overflow-hidden cursor-pointer select-none"
          role="button"
          tabIndex={0}
          title={isHindi ? 'वीडियो ट्यूटोरियल देखें' : 'Watch Video Tutorial'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (onWatch) onWatch(video);
              else window.open(directYoutubeWatchUrl, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          {/* Fallback Graphic (rendered underneath, or prominently if image fails/loads) */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} flex flex-col justify-between p-4 text-white z-0`}>
            {/* Background geometric decorative pattern */}
            <div className="absolute right-0 top-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-36 h-36 bg-black/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold">
                <TradeIcon className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate max-w-[140px]">{video.trade}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-red-600 px-2 py-0.5 rounded-md shadow-xs">
                <Youtube className="w-3 h-3 fill-current" />
                <span>YouTube</span>
              </div>
            </div>

            <div className="relative z-10 text-center my-auto px-4">
              <div className="text-sm font-extrabold line-clamp-2 drop-shadow-md text-white/95">
                {title}
              </div>
              <div className="text-[11px] font-semibold text-white/80 mt-1">
                {video.channelName}
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90">
              <span className="bg-black/50 px-2 py-0.5 rounded-md font-bold">{video.level}</span>
              <span className="bg-black/50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                {video.duration}
              </span>
            </div>
          </div>

          {/* Real YouTube / High-Res Image (rendered on top of the fallback graphic) */}
          {!isImgFailed && currentImgSrc && (
            <img
              src={currentImgSrc}
              alt={video.title}
              onLoad={() => setIsImgLoaded(true)}
              onError={handleImageError}
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300 z-10 ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}

          {/* Dark scrim gradient overlay on top of image for readability and play button prominence */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-colors pointer-events-none" />

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-red-600/95 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-red-600 transition-all border border-white/30 backdrop-blur-xs">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 z-30 bg-black/85 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
            <Clock className="w-3 h-3 text-[#E87D4D]" />
            <span>{video.duration}</span>
          </div>

          {/* User Match Badge */}
          {isMatchedWithUserSkills && (
            <div className="absolute top-3 left-3 z-30 bg-[#2D5A5A] dark:bg-[#14B8A6] text-white dark:text-[#0D1117] text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/20 pointer-events-none">
              <Sparkles className="w-3 h-3 text-[#E87D4D] dark:text-[#0D1117]" />
              <span>{isHindi ? 'आपके हुनर से मेल' : 'Matches Your Skill'}</span>
            </div>
          )}

          {/* Trade Category Pill */}
          <div className="absolute top-3 right-3 z-30 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/20 backdrop-blur-md shadow-sm pointer-events-none flex items-center gap-1">
            <TradeIcon className="w-3 h-3 text-amber-400" />
            <span>{video.trade}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Level and Language */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${levelColor}`}>
                {video.level}
              </span>
              <span className="text-[11px] font-semibold text-[#8B867F] dark:text-[#94A3B8] bg-[#FAF9F5] dark:bg-[#1E2633] px-2.5 py-0.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748]">
                {video.language}
              </span>
            </div>
            {video.viewsCount && (
              <span className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-semibold">
                {video.viewsCount}
              </span>
            )}
          </div>

          {/* Title */}
          <button
            type="button"
            onClick={handleCardClick}
            className="text-left w-full text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9] group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2 mb-2 block break-words cursor-pointer"
            title={title}
          >
            {title}
          </button>

          {/* Channel Name */}
          <div className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-semibold flex items-center gap-1.5 mb-3 truncate">
            <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
              <Youtube className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="truncate">{video.channelName}</span>
          </div>

          {/* YouTube Search Direct Quick-Search Pill */}
          <a
            href={directYoutubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100/70 dark:hover:bg-red-950/50 border border-red-200/80 dark:border-red-900/60 rounded-xl px-2.5 py-1.5 mb-3 text-[11px] text-red-700 dark:text-red-400 transition-colors group/search"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Search className="w-3 h-3 text-red-500 shrink-0" />
              <span className="font-semibold truncate">
                {isHindi ? 'सर्च:' : 'YT Search:'} "{searchQuery}"
              </span>
            </div>
            <ExternalLink className="w-3 h-3 text-red-400 group-hover/search:text-red-700 dark:group-hover/search:text-red-300 shrink-0" />
          </a>

          {/* Short Description */}
          <p className="text-xs text-[#6B665F] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>

          {/* Topics learned preview with instant YouTube subtopic search */}
          {video.topicsCovered && video.topicsCovered.length > 0 && (
            <div className="space-y-1.5 bg-[#FAF9F5] dark:bg-[#10151C] p-2.5 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] text-[11px] text-[#6B665F] dark:text-[#94A3B8]">
              <div className="font-bold text-[#2B2927] dark:text-[#F1F5F9] flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#8B867F] dark:text-[#94A3B8]">
                <CheckCircle2 className="w-3 h-3 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                <span>{isHindi ? 'ट्यूटोरियल बिंदु' : 'Key Trade Skills'}:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {video.topicsCovered.map((topic, idx) => (
                  <a
                    key={idx}
                    href={getYoutubeSearchUrl(`${topic} in hindi`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-[#161B22] hover:bg-red-50 dark:hover:bg-red-950/40 border border-[#E5E0D5] dark:border-[#2D3748] hover:border-red-200 dark:hover:border-red-800 text-[10px] text-[#6B665F] dark:text-[#CBD5E1] hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    title={`Search "${topic}" on YouTube`}
                  >
                    <span className="truncate max-w-[130px]">{topic}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="flex items-center gap-2 pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D]">
          {/* Main Action: Watch tutorial in Modal or External */}
          <button
            type="button"
            onClick={handleCardClick}
            className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="truncate">{isHindi ? 'वीडियो देखें' : 'Watch Video'}</span>
          </button>

          {/* Secondary Action: Direct External YouTube Link */}
          <a
            href={directYoutubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#10151C] hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-[#E5E0D5] dark:border-[#2D3748] hover:border-red-300 dark:hover:border-red-800 transition-colors shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            title={isHindi ? 'यूट्यूब ऐप/साइट में खोलें' : 'Open in YouTube App / Site'}
          >
            <Youtube className="w-4 h-4 fill-current" />
          </a>

          {/* Bookmark toggle */}
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(video.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isSaved
                  ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border-[#CCE0E0] dark:border-[#1E4646]'
                  : 'bg-white dark:bg-[#161B22] text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] border-[#E5E0D5] dark:border-[#2D3748] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
              }`}
              title={isSaved ? (isHindi ? 'सहेजा गया' : 'Saved in Dashboard') : (isHindi ? 'बुकमार्क करें' : 'Bookmark Tutorial')}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}

          {/* Matching jobs button */}
          {onExploreMatchingJobs && (
            <button
              type="button"
              onClick={() => onExploreMatchingJobs(video.canonicalSkill)}
              className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#2D3748] hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF] transition-colors cursor-pointer text-xs font-bold shrink-0 min-h-[40px]"
              title={isHindi ? 'इस हुनर की नौकरियां देखें' : 'View Matching Jobs'}
            >
              {isHindi ? 'नौकरियां' : 'Jobs'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
