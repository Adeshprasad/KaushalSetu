export type Language = 'en' | 'hi' | 'bn' | 'or' | 'ta';

export interface SkillCategory {
  id: string;
  name: string;
  nameHi: string;
  iconName: string;
}

export interface SkillDefinition {
  id: string;
  canonical: string;
  labelEn: string;
  labelHi: string;
  labelBn?: string;
  labelOr?: string;
  labelTa?: string;
  category: string;
  aliases: string[];
}

export interface Job {
  id: string;
  title: string;
  titleHi: string;
  employer: string;
  location: string;
  state: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod?: 'month' | 'day';
  requiredSkills: string[]; // canonical skill strings
  preferredSkills?: string[];
  experienceMinYears: number;
  experienceMaxYears?: number;
  education: string;
  educationHi?: string;
  description: string;
  descriptionHi?: string;
  applicationInfo: string;
  contactPhone?: string;
  contactPerson?: string;
  vacancies: number;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship';
  postedDate: string;
  isVerified: boolean;
  isActive: boolean;
  source?: 'local' | 'ncs' | 'apprenticeship' | 'external';
  sourceName?: string;
  sourceUrl?: string;
  externalId?: string;
  postedBy?: string; // employer/contractor ID or email
  perks?: string[]; // e.g. Free Lodging, Free Food, PF/ESIC
}

export type ThirdPartyJobSource = 'all' | 'ncs' | 'apprenticeship' | 'live-grounded';

export interface JobMatchResult {
  job: Job;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  aiExplanation?: string;
  loadingExplanation?: boolean;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameHi: string;
  ministry: string;
  ministryHi?: string;
  category: string;
  description: string;
  descriptionHi?: string;
  targetAudience: string;
  targetAudienceHi?: string;
  eligibility: string[];
  eligibilityHi?: string[];
  benefits: string[];
  benefitsHi?: string[];
  applicationProcess: string[];
  applicationProcessHi?: string[];
  documents: string[];
  documentsHi?: string[];
  officialSource: string;
  stipendOrAid?: string;
  stipendOrAidHi?: string;
  duration?: string;
  relevantSkills: string[]; // matched against user skills
  tags: string[];
}

export interface SimplifiedScheme {
  inSimpleWords: string;
  whoMayBeEligible: string[];
  whatYouGet: string[];
  howToApply: string[];
  documentsNeeded: string[];
  disclaimer: string;
}

export interface SchemeChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  applicantName: string;
  applicantPhone: string;
  applicantLocation: string;
  applicantSkills: string[];
  appliedDate: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected';
  notes?: string;
  applicantId?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  photoURL?: string;
  language?: Language;
  preferredLanguage?: Language;
  state: string;
  district: string;
  skills: string[];
  experienceYears: number;
  savedJobIds: string[];
  appliedJobIds?: string[];
  savedTrainingIds?: string[];
  role?: 'candidate' | 'employer' | 'admin';
  companyName?: string;
  employerType?: 'contractor' | 'factory' | 'workshop' | 'individual' | 'service_provider';
  gstOrUdyam?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingVideo {
  id: string;
  title: string;
  titleHi: string;
  trade: string;
  canonicalSkill: string;
  channelName: string;
  youtubeId?: string;
  youtubeUrl: string;
  searchQuery: string;
  searchQueryHi?: string;
  thumbnailUrl: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'Hindi' | 'English' | 'Bilingual';
  description: string;
  descriptionHi: string;
  topicsCovered: string[];
  certifiedCourseUrl?: string;
  certificationProvider?: string;
  viewsCount?: string;
  isPopular?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalSchemes: number;
  totalApplications: number;
  topSkills: { skill: string; count: number }[];
  stateBreakdown: { state: string; count: number }[];
}

export interface GroundedMapPlace {
  title: string;
  uri: string;
  address?: string;
  snippets?: string[];
  sourceType?: 'maps' | 'web';
}

export interface MapsSearchResult {
  text: string;
  places: GroundedMapPlace[];
  searchQuery: string;
  searchLocation: string;
  groundingMetadata?: any;
}

export interface SuccessStory {
  id: string;
  name: string;
  nameHi: string;
  photoUrl?: string;
  avatarBg: string;
  initials: string;
  district: string;
  state: string;
  trade: string;
  tradeHi: string;
  canonicalSkill: string;
  employer: string;
  employerHi?: string;
  roleTitle: string;
  roleTitleHi?: string;
  previousIncome: string;
  currentIncome: string;
  previousIncomeHi: string;
  currentIncomeHi: string;
  quoteEn: string;
  quoteHi: string;
  keyAchievementEn: string;
  keyAchievementHi: string;
  verifiedSchemeUsed?: string;
  verifiedSchemeUsedHi?: string;
  placedDate: string;
}

