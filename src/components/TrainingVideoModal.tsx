import React from 'react';
import { TrainingVideo, Language } from '../types';
import { getYoutubeWatchUrl, getYoutubeSearchUrl } from '../data/trainingVideos';
import { 
  X, 
  Youtube, 
  ExternalLink, 
  Clock, 
  Award, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  Briefcase, 
  Sparkles,
  Share2
} from 'lucide-react';

interface TrainingVideoModalProps {
  video: TrainingVideo | null;
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  isSaved?: boolean;
  onToggleSave?: (videoId: string) => void;
  onExploreMatchingJobs?: (skill: string) => void;
}

export const TrainingVideoModal: React.FC<TrainingVideoModalProps> = ({
  video,
  isOpen,
  onClose,
  currentLanguage,
  isSaved = false,
  onToggleSave,
  onExploreMatchingJobs,
}) => {
  if (!isOpen || !video) return null;

  const isHindi = currentLanguage === 'hi';
  const title = isHindi ? video.titleHi : video.title;
  const description = isHindi ? video.descriptionHi : video.description;
  const searchQuery = isHindi && video.searchQueryHi ? video.searchQueryHi : video.searchQuery;
  const watchUrl = getYoutubeWatchUrl(video.youtubeId, searchQuery);
  const searchUrl = getYoutubeSearchUrl(searchQuery);

  const embedUrl = video.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`
    : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${title} - Kaushal Setu Vocational Training`,
          url: watchUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard?.writeText(watchUrl);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-[#161B22] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#CCE0E0] dark:border-[#262F3D] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#10151C] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Youtube className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wider block">
                {video.trade} • {video.channelName}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#2B2927] dark:text-[#F1F5F9] truncate">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(video.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border-[#CCE0E0] dark:border-[#1E4646]'
                    : 'bg-white dark:bg-[#161B22] text-[#8B867F] dark:text-[#94A3B8] border-[#E5E0D5] dark:border-[#2D3748] hover:bg-[#FAF9F5]'
                }`}
                title={isSaved ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save')}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white dark:bg-[#161B22] text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] border border-[#E5E0D5] dark:border-[#2D3748] transition-colors cursor-pointer"
              title="Share Tutorial"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-[#161B22] text-[#8B867F] dark:text-[#94A3B8] hover:text-red-600 border border-[#E5E0D5] dark:border-[#2D3748] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Embed (Responsive 16:9) */}
        <div className="relative aspect-video w-full bg-black shrink-0 overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-slate-900 to-slate-800">
              <Youtube className="w-16 h-16 text-red-500 mb-3" />
              <p className="text-base font-bold mb-4">{title}</p>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center gap-2"
              >
                <Youtube className="w-4 h-4 fill-current" />
                <span>{isHindi ? 'यूट्यूब पर वीडियो देखें' : 'Watch on YouTube'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white dark:bg-[#161B22]">
          {/* Action Ribbon: Open YouTube / Find Jobs */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {video.level}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {video.language}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-500" />
                <span>{video.duration}</span>
              </span>
              {video.viewsCount && (
                <span className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-medium">
                  {video.viewsCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Youtube className="w-3.5 h-3.5 fill-current" />
                <span>{isHindi ? 'यूट्यूब ऐप/साइट में खोलें' : 'Open in YouTube'}</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {onExploreMatchingJobs && (
                <button
                  type="button"
                  onClick={() => {
                    onExploreMatchingJobs(video.canonicalSkill);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2D5A5A] hover:bg-[#224646] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'इस ट्रेड की नौकरियां' : 'Matching Jobs'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
              {isHindi ? 'कोर्स विवरण व मार्गदर्शन' : 'About this Practical Masterclass'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#CBD5E1] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Syllabus Topics */}
          {video.topicsCovered && video.topicsCovered.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#F0ECE1]/50 dark:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#2D3748]">
              <h4 className="text-xs font-extrabold text-[#2B2927] dark:text-[#F1F5F9] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                <span>{isHindi ? 'मुख्य सीखे जाने वाले हुनर (Syllabus Key Topics)' : 'Key Trade Skills Covered in this Session'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {video.topicsCovered.map((topic, idx) => (
                  <a
                    key={idx}
                    href={getYoutubeSearchUrl(`${topic} in hindi`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] hover:border-red-300 dark:hover:border-red-800 text-xs text-[#2B2927] dark:text-[#F1F5F9] flex items-center justify-between group transition-colors"
                  >
                    <span className="font-semibold truncate">{topic}</span>
                    <ExternalLink className="w-3 h-3 text-[#8B867F] group-hover:text-red-500 shrink-0 ml-1.5 opacity-60 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official Govt Certification Info Banner */}
          {video.certifiedCourseUrl && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EBF1F1] to-[#FAF9F5] dark:from-[#152E2E] dark:to-[#161B22] border border-[#CCE0E0] dark:border-[#1E4646] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center shrink-0 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                    {isHindi ? 'सरकारी प्रमाणन (Govt Certificate)' : 'Official Government Certification'}
                  </h4>
                  <p className="text-xs text-[#8B867F] dark:text-[#94A3B8]">
                    {video.certificationProvider || 'National Skill Development Corporation (NSDC)'}
                  </p>
                </div>
              </div>

              <a
                href={video.certifiedCourseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>{isHindi ? 'सर्टिफिकेट पोर्टल देखें' : 'Visit Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
