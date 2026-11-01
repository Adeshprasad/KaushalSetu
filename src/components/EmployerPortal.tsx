import React, { useState } from 'react';
import { Job, UserApplication, UserProfile, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { SKILL_TAXONOMY } from '../data/mockData';
import {
  Building2,
  Briefcase,
  Plus,
  Users,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  Send,
  FileText,
  Check,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Award,
  MessageSquare,
  Calendar,
  DollarSign,
  CheckSquare,
  RefreshCw,
  Clock,
  UserCheck,
  LogIn
} from 'lucide-react';

interface EmployerPortalProps {
  jobs: Job[];
  applications: UserApplication[];
  userProfile: UserProfile;
  currentLanguage: Language;
  onAddJob: (job: Partial<Job>) => Promise<void>;
  onToggleJobStatus: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdateApplicationStatus?: (applicationId: string, status: UserApplication['status']) => Promise<void>;
  onOpenBiodata?: (candidateName: string, skills: string[]) => void;
  currentUser?: any;
  onLogin?: () => void;
}

const POPULAR_TEMPLATES = [
  {
    title: 'Arc & MIG Welder',
    titleHi: 'आर्क व मिग वेल्डर',
    skills: ['welding', 'metal fabrication'],
    salaryMin: 18000,
    salaryMax: 24000,
    education: '8th / 10th Pass or ITI Welder',
    description: 'Fabrication of agricultural equipment, gates, grills, and structural frameworks with arc/MIG welding equipment.',
    perks: ['Free Lodging', 'Overtime Bonus']
  },
  {
    title: 'Sub-Station / House Electrician',
    titleHi: 'सब-स्टेशन व घरेलू इलेक्ट्रीशियन',
    skills: ['electrical repair', 'solar installation'],
    salaryMin: 17000,
    salaryMax: 23000,
    education: '10th Pass + ITI Electrician / Wireman',
    description: 'Domestic wiring, distribution box setup, inverter connection, and single-phase motor servicing.',
    perks: ['Travel Allowance (TA/DA)', 'PF & ESIC']
  },
  {
    title: 'PM Surya Ghar Solar Technician',
    titleHi: 'पीएम सूर्य घर सोलर तकनीशियन',
    skills: ['solar installation', 'electrical repair'],
    salaryMin: 19000,
    salaryMax: 25000,
    education: '10th / 12th Pass or Suryamitra Certified',
    description: 'Rooftop solar panel mounting, string inverter installation, earth wire routing, and net metering sync.',
    perks: ['Free Lodging', 'Travel Allowance (TA/DA)', 'Tool Kit Provided']
  },
  {
    title: 'Plumber & Pipe Fitter',
    titleHi: 'प्लंबर व पाइप फिटर',
    skills: ['plumbing'],
    salaryMin: 16000,
    salaryMax: 21000,
    education: 'Practical pipe threading experience',
    description: 'Sanitary fitting, CPVC/GI pipe laying, motor connection, and leak repair for residential projects.',
    perks: ['Daily Food Allowance', 'Safety Gear']
  },
  {
    title: 'Heavy Vehicle Diesel Mechanic',
    titleHi: 'भारी वाहन व ट्रैक्टर मैकेनिक',
    skills: ['motorcycle repair', 'welding'],
    salaryMin: 20000,
    salaryMax: 27000,
    education: 'Diesel Mechanic trade experience',
    description: 'Overhauling diesel engines, gearbox maintenance, brake lining replacements, and tractor hydraulic pumps.',
    perks: ['Free Food & Lodging', 'Overtime Bonus']
  },
  {
    title: 'Master Tailor & Boutique Artisan',
    titleHi: 'मास्टर दर्जी व बुटीक कारीगर',
    skills: ['tailoring'],
    salaryMin: 15000,
    salaryMax: 22000,
    education: 'Skilled on industrial sewing machine',
    description: 'Pattern cutting, blouse and suit stitching, finishing, and power sewing machine operation.',
    perks: ['Overtime Bonus', 'Flexible Hours']
  },
  {
    title: 'RCC Mason / Rajmistri',
    titleHi: 'मुख्य राजमिस्त्री व आरसीसी ढलाईकार',
    skills: ['masonry', 'carpentry'],
    salaryMin: 20000,
    salaryMax: 26000,
    education: 'Practical construction experience',
    description: 'Brickwork alignment, plaster finishing, RCC column casting, and tile flooring.',
    perks: ['Weekly Advance', 'Free Lodging']
  },
  {
    title: 'Mobile Phone Repair Specialist',
    titleHi: 'स्मार्टफोन चिप-लेवल रिपेयर तकनीशियन',
    skills: ['mobile repair', 'electrical repair'],
    salaryMin: 18000,
    salaryMax: 25000,
    education: '10th Pass / Mobile Repair Certificate',
    description: 'SMD soldering, display combo replacement, charging jack repair, and Android software flashing.',
    perks: ['Incentive Bonus', 'AC Workshop']
  }
];

const AVAILABLE_PERKS = [
  { id: 'Free Lodging', labelHi: 'रहने की निःशुल्क व्यवस्था (Free Lodging)', labelEn: 'Free Lodging / Accommodation' },
  { id: 'Free Meals', labelHi: 'निःशुल्क भोजन / राशन (Free Meals)', labelEn: 'Free Meals / Canteen' },
  { id: 'PF & ESIC', labelHi: 'पीएफ व ईएसआई स्वास्थ्य बीमा (PF & ESIC)', labelEn: 'PF & ESIC Health Card' },
  { id: 'Travel Allowance', labelHi: 'यात्रा भत्ता (TA / DA)', labelEn: 'Travel Allowance (TA/DA)' },
  { id: 'Overtime Bonus', labelHi: 'ओवरटाइम अतिरिक्त भुगतान (Overtime Pay)', labelEn: 'Overtime Bonus Pay' },
  { id: 'Tool Kit Provided', labelHi: 'टूलकिट व सुरक्षा किट उपलब्ध', labelEn: 'Toolkit & Safety Gear Provided' }
];

const STATES_LIST = [
  'Bihar', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Gujarat', 
  'West Bengal', 'Odisha', 'Jharkhand', 'Maharashtra', 'Haryana', 
  'Punjab', 'Tamil Nadu', 'Karnataka', 'Delhi NCR', 'Assam', 'Chhattisgarh'
];

export const EmployerPortal: React.FC<EmployerPortalProps> = ({
  jobs,
  applications,
  userProfile,
  currentLanguage,
  onAddJob,
  onToggleJobStatus,
  onDeleteJob,
  onUpdateProfile,
  onUpdateApplicationStatus,
  onOpenBiodata,
  currentUser,
  onLogin
}) => {
  const isHindi = currentLanguage === 'hi';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  // Sub-tabs: 'post' | 'my-jobs' | 'applicants'
  const [activeSubTab, setActiveSubTab] = useState<'post' | 'my-jobs' | 'applicants'>('post');

  // Employer Registration / Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [companyName, setCompanyName] = useState(userProfile.companyName || '');
  const [contactPerson, setContactPerson] = useState(userProfile.name || '');
  const [contactPhone, setContactPhone] = useState(userProfile.phone || '');
  const [employerType, setEmployerType] = useState(userProfile.employerType || 'contractor');
  const [employerState, setEmployerState] = useState(userProfile.state || 'Bihar');
  const [employerDistrict, setEmployerDistrict] = useState(userProfile.district || 'Patna');

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobTitleHi, setJobTitleHi] = useState('');
  const [employerName, setEmployerName] = useState(userProfile.companyName || userProfile.name || '');
  const [locationCity, setLocationCity] = useState(userProfile.district || 'Patna');
  const [locationState, setLocationState] = useState(userProfile.state || 'Bihar');
  const [salaryMin, setSalaryMin] = useState('18000');
  const [salaryMax, setSalaryMax] = useState('24000');
  const [salaryPeriod, setSalaryPeriod] = useState<'month' | 'day'>('month');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['welding']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [experienceMin, setExperienceMin] = useState('1');
  const [education, setEducation] = useState('10th Pass or ITI');
  const [vacancies, setVacancies] = useState('3');
  const [workType, setWorkType] = useState<'Full-time' | 'Contract' | 'Part-time' | 'Apprenticeship'>('Full-time');
  const [selectedPerks, setSelectedPerks] = useState<string[]>(['Free Lodging', 'PF & ESIC']);
  const [description, setDescription] = useState('');
  const [phoneForJob, setPhoneForJob] = useState(userProfile.phone || '+91 98765 43210');
  const [personForJob, setPersonForJob] = useState(userProfile.name || '');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [jobPostSuccess, setJobPostSuccess] = useState(false);

  // Filter for applicants tab
  const [filterJobId, setFilterJobId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter posted jobs
  const employerJobs = jobs.filter(j => 
    j.postedBy === userProfile.id || 
    j.postedBy === currentUser?.uid || 
    (userProfile.companyName && j.employer.toLowerCase().includes(userProfile.companyName.toLowerCase())) ||
    j.source === 'local'
  );

  // Relevant applications for this employer's jobs
  const employerJobIds = new Set(employerJobs.map(j => j.id));
  const relevantApplications = applications.filter(app => 
    employerJobIds.has(app.jobId) || 
    (userProfile.companyName && app.employer.toLowerCase().includes(userProfile.companyName.toLowerCase())) ||
    app.jobId.startsWith('job-')
  );

  const filteredApplications = relevantApplications.filter(app => {
    if (filterJobId !== 'all' && app.jobId !== filterJobId) return false;
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    return true;
  });

  // Handle template selection
  const handleSelectTemplate = (template: typeof POPULAR_TEMPLATES[0]) => {
    setJobTitle(template.title);
    setJobTitleHi(template.titleHi);
    setSelectedSkills([...template.skills]);
    setSalaryMin(String(template.salaryMin));
    setSalaryMax(String(template.salaryMax));
    setEducation(template.education);
    setDescription(template.description);
    setSelectedPerks([...template.perks]);
  };

  // Toggle skill selection
  const handleToggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Add custom skill
  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkillInput.trim().toLowerCase();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkillInput('');
    }
  };

  // Toggle perk
  const handleTogglePerk = (perkId: string) => {
    setSelectedPerks(prev => 
      prev.includes(perkId) ? prev.filter(p => p !== perkId) : [...prev, perkId]
    );
  };

  // Save Employer Business Profile
  const handleSaveBusinessProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      role: 'employer',
      companyName: companyName.trim() || 'Rural Enterprises',
      name: contactPerson.trim() || userProfile.name,
      phone: contactPhone.trim() || userProfile.phone,
      state: employerState,
      district: employerDistrict,
      employerType: employerType as any
    });
    setEmployerName(companyName.trim() || 'Rural Enterprises');
    setPersonForJob(contactPerson.trim() || userProfile.name);
    setPhoneForJob(contactPhone.trim() || userProfile.phone);
    setIsEditingProfile(false);
  };

  // Handle Create Job Submission
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !employerName.trim()) return;

    setIsSubmittingJob(true);
    try {
      await onAddJob({
        title: jobTitle.trim(),
        titleHi: jobTitleHi.trim() || jobTitle.trim(),
        employer: employerName.trim(),
        location: locationCity.trim() || 'Patna',
        state: locationState,
        salaryMin: Number(salaryMin) || 16000,
        salaryMax: Number(salaryMax) || 22000,
        salaryPeriod: salaryPeriod,
        requiredSkills: selectedSkills.length > 0 ? selectedSkills : ['welding'],
        experienceMinYears: Number(experienceMin) || 0,
        education: education || '10th Pass / ITI',
        vacancies: Number(vacancies) || 2,
        workType: workType,
        description: description || 'Direct vocational opening with immediate site placement.',
        contactPhone: phoneForJob || userProfile.phone,
        contactPerson: personForJob || userProfile.name,
        perks: selectedPerks,
        postedBy: userProfile.id || currentUser?.uid,
        source: 'local',
        isActive: true,
        isVerified: true,
        postedDate: 'Just now'
      });

      setJobPostSuccess(true);
      setTimeout(() => setJobPostSuccess(false), 4000);

      // Reset form
      setJobTitle('');
      setJobTitleHi('');
      setDescription('');
      setActiveSubTab('my-jobs');
    } catch (err) {
      console.error('Job posting failed:', err);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fadeIn transition-colors">
      
      {/* Top Banner: Employer Mode Header */}
      <div className="bg-gradient-to-br from-[#2D5A5A] to-[#1E3E3E] dark:from-[#132828] dark:to-[#0D1A1A] rounded-2xl p-6 sm:p-8 text-white shadow-md border border-[#3E7070] dark:border-[#204444] mb-8 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E87D4D]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E87D4D] text-white text-xs font-black tracking-wide shadow-xs uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'नियोक्ता व ठेकेदार पोर्टल' : 'Employer & Contractor Portal'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {isHindi ? 'कारीगरों को काम दें, अपनी नौकरियां तुरंत लिस्ट करें' : 'Post Vacancies & Hire Certified Rural Talent'}
            </h1>

            <p className="text-xs sm:text-sm text-[#E0ECEC] dark:text-[#9FB8B8] leading-relaxed">
              {isHindi
                ? 'वेल्डर, इलेक्ट्रीशियन, प्लंबर, राजमिस्त्री, सोलर तकनीशियन और दर्जी जैसे सत्यापित कामगारों से सीधे संपर्क करें। 0% कमीशन, सीधा फोन व व्हाट्सएप जुड़ाव।'
                : 'Connect directly with verified local tradespeople, mechanics, electricians, and solar installers. No middleman, direct phone & WhatsApp communication.'}
            </p>
          </div>

          {/* Quick Business Card / Switcher */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-white/10 shrink-0 w-full sm:w-auto min-w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#E87D4D] uppercase tracking-wider">
                {isHindi ? 'नियोक्ता प्रोफाइल' : 'Business Account'}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingProfile(prev => !prev)}
                className="text-[11px] text-[#A0D4D4] hover:text-white underline cursor-pointer flex items-center gap-1 font-semibold"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingProfile ? (isHindi ? 'रद्द करें' : 'Cancel') : (isHindi ? 'बदलें' : 'Edit')}</span>
              </button>
            </div>

            <p className="font-extrabold text-sm sm:text-base text-white truncate">
              {userProfile.companyName || userProfile.name || 'Contractor / Enterprise'}
            </p>
            <p className="text-xs text-[#CCE0E0] truncate flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#E87D4D]" />
              <span>{userProfile.district}, {userProfile.state}</span>
            </p>
            <p className="text-xs text-[#CCE0E0] truncate flex items-center gap-1.5 mt-1">
              <Phone className="w-3 h-3 text-[#2DD4BF]" />
              <span>{userProfile.phone}</span>
            </p>

            {/* Quick Switch to Candidate Mode */}
            <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
              <span className="text-[10px] text-[#CCE0E0] font-medium">
                {isHindi ? 'काम तलाशने का मोड:' : 'Job Seeker View:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onUpdateProfile({ role: 'candidate' });
                }}
                className="text-xs font-bold px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                {isHindi ? 'उम्मीदवार मोड' : 'Candidate Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Employer Profile Modal / Accordion */}
      {isEditingProfile && (
        <div className="bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-6 shadow-md mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-[#E5E0D5] dark:border-[#262F3D] pb-3">
            <div className="flex items-center gap-2 text-[#2D5A5A] dark:text-[#2DD4BF]">
              <Building2 className="w-5 h-5" />
              <h3 className="text-base sm:text-lg font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'ठेकेदार / संस्था विवरण भरें' : 'Employer / Contractor Profile Details'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="text-xs text-[#8B867F] hover:text-[#2B2927] dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveBusinessProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
                {isHindi ? 'संस्था / दुकान / फर्म का नाम *' : 'Company / Firm / Workshop Name *'}
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Sharma Agro Engineering Works"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
                {isHindi ? 'संपर्क व्यक्ति का नाम *' : 'Contact Person Name *'}
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Rameshwar Sharma"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
                {isHindi ? 'मोबाइल / व्हाट्सएप नंबर *' : 'Mobile / WhatsApp Number *'}
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
                {isHindi ? 'व्यवसाय का प्रकार' : 'Business Category'}
              </label>
              <select
                value={employerType}
                onChange={(e) => setEmployerType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
              >
                <option value="contractor">ठेकेदार / पेटी ठेकेदार (Contractor)</option>
                <option value="factory">कारखाना / निर्माण इकाई (Factory/Manufacturing)</option>
                <option value="workshop">वर्कशॉप / सर्विस सेंटर (Workshop / Garage)</option>
                <option value="service_provider">सेवा प्रदाता / एजेंसी (Service Provider)</option>
                <option value="individual">व्यक्तिगत / गृहस्वामी (Individual / Builder)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
                {isHindi ? 'राज्य' : 'State'}
              </label>
              <select
                value={employerState}
                onChange={(e) => setEmployerState(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
              >
                {STATES_LIST.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1">
                {isHindi ? 'जिला / शहर' : 'District / City'}
              </label>
              <input
                type="text"
                value={employerDistrict}
                onChange={(e) => setEmployerDistrict(e.target.value)}
                placeholder="Patna, Begusarai, etc."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B665F] dark:text-[#94A3B8] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2D5A5A] text-white hover:bg-[#224646] shadow-xs cursor-pointer"
              >
                {isHindi ? 'प्रोफाइल सहेजें' : 'Save Business Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D5] dark:border-[#262F3D] pb-3 mb-8 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('post')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeSubTab === 'post'
              ? 'bg-[#E87D4D] text-white shadow-xs'
              : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नई नौकरी पोस्ट करें' : 'Post a New Vacancy'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('my-jobs')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeSubTab === 'my-jobs'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{isHindi ? 'मेरी पोस्ट की गई नौकरियां' : 'My Listed Jobs'}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-xs font-black">
            {employerJobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('applicants')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
            activeSubTab === 'applicants'
              ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
              : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isHindi ? 'प्राप्त आवेदन' : 'Received Applications'}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#E87D4D] text-white text-xs font-black">
            {relevantApplications.length}
          </span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {jobPostSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs sm:text-sm font-bold">
              {isHindi ? 'नौकरी सफलतापूर्वक पोस्ट हो गई है!' : 'Vacancy published successfully!'}
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              {isHindi ? 'अब यह KaushalSetu पोर्टल पर सभी योग्य कामगारों को तुरंत दिखाई दे रही है।' : 'Your vacancy is now live and visible to qualified candidates nationwide.'}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 1: POST A NEW JOB                               */}
      {/* ======================================================== */}
      {activeSubTab === 'post' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Quick One-Tap Templates */}
          <div className="bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#E87D4D]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'त्वरित नौकरी टेम्पलेट (1-क्लिक में भरें)' : 'Popular Vocational Job Templates (1-Click Fill)'}
              </h3>
            </div>
            <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mb-3">
              {isHindi
                ? 'नीचे दिए गए ट्रेड पर क्लिक करने से मानक पदनाम, कौशल और वेतन अपने आप फॉर्म में भर जाएंगे:'
                : 'Click any trade below to auto-populate standard title, required skills, and salary guidelines:'}
            </p>

            <div className="flex flex-wrap gap-2">
              {POPULAR_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl border border-[#CCE0E0] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] hover:bg-[#EBF1F1] dark:hover:bg-[#1E2633] text-[#2D5A5A] dark:text-[#2DD4BF] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{isHindi ? tmpl.titleHi : tmpl.title}</span>
                  <span className="text-[10px] text-[#8B867F]">₹{tmpl.salaryMin / 1000}k</span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Creation Form */}
          <form onSubmit={handlePostJob} className="bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#E5E0D5] dark:border-[#262F3D] pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'नौकरी विवरण व शर्तें' : 'Job Details & Work Requirements'}
              </h2>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] mt-0.5">
                {isHindi ? 'सरल भाषा में जानकारी भरें ताकि ग्रामीण कामगार आसानी से समझ सकें।' : 'Provide clear details so rural job seekers can understand and apply with 1 click.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Job Title (English) */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'पद का नाम (अंग्रेजी में) *' : 'Job Title (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Arc Welder & Fabricator"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
                />
              </div>

              {/* Job Title (Hindi) */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'पद का नाम (हिंदी या क्षेत्रीय भाषा) *' : 'Job Title (Hindi / Regional) *'}
                </label>
                <input
                  type="text"
                  required
                  value={jobTitleHi}
                  onChange={(e) => setJobTitleHi(e.target.value)}
                  placeholder="उदा. आर्क वेल्डर व फैब्रिकेटर"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
                />
              </div>

              {/* Employer / Firm Name */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'कंपनी / ठेकेदार का नाम *' : 'Company / Employer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g. Sharma Agro Engineering"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
                />
              </div>

              {/* Contact Person Name */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'संपर्क व्यक्ति का नाम' : 'Contact Person'}
                </label>
                <input
                  type="text"
                  value={personForJob}
                  onChange={(e) => setPersonForJob(e.target.value)}
                  placeholder="e.g. Suresh Kumar (Manager)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Contact Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'सीधा संपर्क फोन / व्हाट्सएप *' : 'Contact Phone / WhatsApp *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phoneForJob}
                  onChange={(e) => setPhoneForJob(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Work Location State */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'कार्य स्थल (राज्य) *' : 'Work Location (State) *'}
                </label>
                <select
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                >
                  {STATES_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Work Location District / City */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'जिला / शहर / औद्योगिक क्षेत्र *' : 'District / City / Industrial Area *'}
                </label>
                <input
                  type="text"
                  required
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="e.g. Begusarai Industrial Area"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Salary Min */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'न्यूनतम वेतन (₹) *' : 'Minimum Salary (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Salary Max */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'अधिकतम वेतन (₹) *' : 'Maximum Salary (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Salary Period */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'वेतन आवृत्ति' : 'Salary Frequency'}
                </label>
                <select
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                >
                  <option value="month">{isHindi ? 'प्रति माह (Per Month)' : 'Per Month'}</option>
                  <option value="day">{isHindi ? 'प्रति दिन / दैनिक हाजिरी (Per Day)' : 'Per Day / Daily Wage'}</option>
                </select>
              </div>

              {/* Vacancies */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'आवश्यक रिक्तियां (संख्या) *' : 'Total Vacancies *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'रोजगार का प्रकार' : 'Work Contract Type'}
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                >
                  <option value="Full-time">{isHindi ? 'पूर्णकालिक (Full-time)' : 'Full-time'}</option>
                  <option value="Contract">{isHindi ? 'ठेका / संविदा (Contract)' : 'Contract'}</option>
                  <option value="Apprenticeship">{isHindi ? 'प्रशिक्षु (Apprenticeship)' : 'Apprenticeship'}</option>
                  <option value="Part-time">{isHindi ? 'अंशकालिक (Part-time)' : 'Part-time'}</option>
                </select>
              </div>

              {/* Education Requirement */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'आवश्यक योग्यता' : 'Education Requirement'}
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. 8th Pass / 10th Pass / ITI"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                />
              </div>

              {/* Min Experience */}
              <div>
                <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                  {isHindi ? 'न्यूनतम अनुभव (वर्ष)' : 'Min Experience (Years)'}
                </label>
                <select
                  value={experienceMin}
                  onChange={(e) => setExperienceMin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9]"
                >
                  <option value="0">{isHindi ? 'फ्रेशर / कोई अनुभव आवश्यक नहीं (0 Years)' : 'Fresher (0 Years)'}</option>
                  <option value="1">1 {isHindi ? 'वर्ष का व्यावहारिक अनुभव' : 'Year Experience'}</option>
                  <option value="2">2 {isHindi ? 'वर्ष' : 'Years'}</option>
                  <option value="3">3+ {isHindi ? 'वर्ष' : 'Years'}</option>
                </select>
              </div>

            </div>

            {/* Trade Skills Multi-Select */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-2">
                {isHindi ? 'आवश्यक कौशल (ट्रेड चुनें) *' : 'Required Trade Skills *'}
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {SKILL_TAXONOMY.map(skillItem => {
                  const isSelected = selectedSkills.includes(skillItem.canonical);
                  return (
                    <button
                      key={skillItem.id}
                      type="button"
                      onClick={() => handleToggleSkill(skillItem.canonical)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
                          : 'bg-[#FAF9F5] dark:bg-[#0D1117] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#F0ECE1]'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3 h-3" />}
                      <span>{isHindi ? skillItem.labelHi : skillItem.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom skill add field */}
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder={isHindi ? 'कोई अन्य कौशल जोड़ें...' : 'Add another skill...'}
                  className="px-3 py-2 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-[#F0ECE1] dark:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#E5E0D5] cursor-pointer"
                >
                  {isHindi ? 'जोड़ें' : 'Add'}
                </button>
              </div>
            </div>

            {/* Perks and Facilities Checklist */}
            <div className="pt-2 border-t border-[#E5E0D5] dark:border-[#262F3D]">
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-2">
                {isHindi ? 'कामगारों को दी जाने वाली सुविधाएं (Perks & Benefits)' : 'Facilities & Perks Provided'}
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {AVAILABLE_PERKS.map(perk => {
                  const isChecked = selectedPerks.includes(perk.id);
                  return (
                    <button
                      key={perk.id}
                      type="button"
                      onClick={() => handleTogglePerk(perk.id)}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-[#EBF1F1] dark:bg-[#152E2E] border-[#2D5A5A]/50 dark:border-[#2DD4BF]/50 text-[#2D5A5A] dark:text-[#2DD4BF]'
                          : 'bg-[#FAF9F5] dark:bg-[#0D1117] border-[#E5E0D5] dark:border-[#262F3D] text-[#6B665F] dark:text-[#94A3B8] hover:bg-[#F0ECE1]'
                      }`}
                    >
                      <span>{isHindi ? perk.labelHi : perk.labelEn}</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117]' : 'border border-[#CCE0E0]'}`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Description / Site Condition */}
            <div>
              <label className="block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-1.5">
                {isHindi ? 'कार्य का विवरण व विशेष निर्देश' : 'Job Description & Special Instructions'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isHindi ? 'कार्य समय, टूल्स, कार्यस्थल का पता और कोई भी विशेष बात...' : 'Working hours, site conditions, equipment details, or interview walk-in timing...'}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:ring-2 focus:ring-[#2D5A5A]"
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E0D5] dark:border-[#262F3D]">
              <div className="flex items-center gap-2 text-xs text-[#8B867F] dark:text-[#94A3B8]">
                <ShieldCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                <span>{isHindi ? 'नौकरी तुरंत प्रकाशित होगी और पोर्टल पर लाइव दिखेगी।' : 'Posting will be live immediately across KaushalSetu.'}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingJob}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#E87D4D] hover:bg-[#D96836] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {isSubmittingJob ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isHindi ? 'पोस्ट की जा रही है...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isHindi ? 'नौकरी तुरंत प्रकाशित करें' : 'Post Vacancy Now'}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: MY LISTED JOBS                               */}
      {/* ======================================================== */}
      {activeSubTab === 'my-jobs' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'मेरी पोस्ट की गई नौकरियां' : 'My Listed Vacancies'}
              </h2>
              <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8]">
                {isHindi ? 'यहां से आप अपनी नौकरियों को सक्रिय/निष्क्रिय कर सकते हैं और प्राप्त आवेदनों को देख सकते हैं।' : 'Manage your live vacancies, pause recruitment when filled, and monitor applications.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('post')}
              className="px-4 py-2 bg-[#E87D4D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#D96836] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? 'नई नौकरी जोड़ें' : 'Add New Vacancy'}</span>
            </button>
          </div>

          {employerJobs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-8">
              <Briefcase className="w-12 h-12 text-[#8B867F] mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'अभी कोई नौकरी लिस्ट नहीं की गई है' : 'No jobs listed yet'}
              </h3>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] max-w-sm mx-auto mt-1 mb-6">
                {isHindi ? 'अपनी पहली खाली जगह पोस्ट करें और स्थानीय कारीगरों से सीधे आवेदन प्राप्त करें।' : 'Post your first vacancy to start receiving direct applications from qualified tradespeople.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('post')}
                className="px-5 py-2.5 bg-[#2D5A5A] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#224646]"
              >
                {isHindi ? 'पहली नौकरी पोस्ट करें' : 'Post Your First Job'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employerJobs.map(job => {
                const jobApplications = relevantApplications.filter(a => a.jobId === job.id);
                return (
                  <div
                    key={job.id}
                    className={`bg-white dark:bg-[#161B22] border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                      job.isActive
                        ? 'border-[#CCE0E0] dark:border-[#262F3D]'
                        : 'border-[#E5E0D5] dark:border-[#1E2633] opacity-75'
                    }`}
                  >
                    <div>
                      {/* Status & Badge Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          job.isActive 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                          {job.isActive ? (isHindi ? 'सक्रिय / आवेदन चालू' : 'Active') : (isHindi ? 'रोकी गई (Paused)' : 'Inactive')}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#E87D4D]">
                          <Users className="w-3.5 h-3.5" />
                          <span>{jobApplications.length} {isHindi ? 'आवेदन' : 'Applicants'}</span>
                        </div>
                      </div>

                      {/* Job Title & Employer */}
                      <h3 className="font-extrabold text-base sm:text-lg text-[#2B2927] dark:text-[#F1F5F9] leading-snug">
                        {isHindi && job.titleHi ? job.titleHi : job.title}
                      </h3>
                      {job.titleHi && isHindi && (
                        <p className="text-xs text-[#8B867F] font-medium mt-0.5">{job.title}</p>
                      )}

                      <p className="text-xs text-[#6B665F] dark:text-[#94A3B8] font-semibold mt-1">
                        {job.employer}
                      </p>

                      {/* Location & Salary */}
                      <div className="mt-3 space-y-1.5 text-xs text-[#2B2927] dark:text-[#F1F5F9]">
                        <div className="flex items-center gap-1.5 text-[#6B665F] dark:text-[#94A3B8]">
                          <MapPin className="w-3.5 h-3.5 text-[#E87D4D] shrink-0" />
                          <span>{job.location}, {job.state}</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-bold text-[#2D5A5A] dark:text-[#2DD4BF]">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span>₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / {job.salaryPeriod === 'day' ? (isHindi ? 'दिन' : 'day') : (isHindi ? 'माह' : 'month')}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.requiredSkills.map(sk => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded-md bg-[#F0ECE1] dark:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] text-[10px] font-bold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Perks */}
                      {job.perks && job.perks.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {job.perks.slice(0, 2).map(p => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] text-[9px] font-semibold"
                            >
                              ✓ {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 pt-3.5 border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between gap-2">
                      {/* Active Toggle */}
                      <button
                        type="button"
                        onClick={() => onToggleJobStatus(job.id, job.isActive)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          job.isActive
                            ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {job.isActive ? (isHindi ? 'रोकें (Pause)' : 'Pause') : (isHindi ? 'सक्रिय करें' : 'Activate')}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* View Applicants for this job */}
                        {jobApplications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFilterJobId(job.id);
                              setActiveSubTab('applicants');
                            }}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] hover:bg-[#CCE0E0] cursor-pointer"
                          >
                            {isHindi ? 'उम्मीदवार देखें' : 'View Applicants'}
                          </button>
                        )}

                        {/* Delete Job */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(isHindi ? 'क्या आप इस नौकरी को हटाना चाहते हैं?' : 'Are you sure you want to remove this vacancy?')) {
                              onDeleteJob(job.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete vacancy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 3: RECEIVED APPLICATIONS                        */}
      {/* ======================================================== */}
      {activeSubTab === 'applicants' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'उम्मीदवारों के प्राप्त आवेदन' : 'Candidate Applications'}
              </h2>
              <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8]">
                {isHindi
                  ? 'योग्य कामगारों के आवेदन, उनके सत्यापित कौशल और संपर्क नंबर। सीधे कॉल या व्हाट्सएप करें।'
                  : 'Review applicant trade profiles, verified skills, and contact details. Call or WhatsApp directly.'}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterJobId}
                onChange={(e) => setFilterJobId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] font-semibold text-[#2B2927] dark:text-[#F1F5F9]"
              >
                <option value="all">{isHindi ? 'सभी नौकरियां (All Jobs)' : 'All Jobs'}</option>
                {employerJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] font-semibold text-[#2B2927] dark:text-[#F1F5F9]"
              >
                <option value="all">{isHindi ? 'सभी स्थितियां' : 'All Statuses'}</option>
                <option value="submitted">{isHindi ? 'नया आवेदन (Submitted)' : 'Submitted'}</option>
                <option value="under_review">{isHindi ? 'समीक्षाधीन (Under Review)' : 'Under Review'}</option>
                <option value="shortlisted">{isHindi ? 'शॉर्टलिस्टेड (Shortlisted)' : 'Shortlisted'}</option>
                <option value="hired">{isHindi ? 'चयनित / काम पर रखा (Hired)' : 'Hired'}</option>
                <option value="rejected">{isHindi ? 'अस्वीकृत (Rejected)' : 'Rejected'}</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-8">
              <Users className="w-12 h-12 text-[#8B867F] mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-[#2B2927] dark:text-[#F1F5F9]">
                {isHindi ? 'इस चयन के लिए कोई आवेदन नहीं मिला' : 'No applications found'}
              </h3>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] max-w-sm mx-auto mt-1">
                {isHindi ? 'जैसे ही कोई कामगार आपकी नौकरी पर 1-क्लिक आवेदन करेगा, उसका विवरण यहां दिखाई देगा।' : 'When candidates apply to your vacancies, their verified biodata will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredApplications.map(app => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Applied For & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E87D4D]">
                          {isHindi ? 'नौकरी:' : 'Applied For:'} {app.jobTitle}
                        </span>
                        <h4 className="font-extrabold text-base sm:text-lg text-[#2B2927] dark:text-[#F1F5F9]">
                          {app.applicantName}
                        </h4>
                      </div>

                      {/* Status pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        app.status === 'shortlisted' || app.status === 'hired'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : app.status === 'under_review'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Candidate Details */}
                    <div className="space-y-1.5 text-xs text-[#2B2927] dark:text-[#F1F5F9] mb-3">
                      <div className="flex items-center gap-2 text-[#6B665F] dark:text-[#94A3B8]">
                        <MapPin className="w-3.5 h-3.5 text-[#E87D4D] shrink-0" />
                        <span>{app.applicantLocation || 'Bihar'}</span>
                      </div>

                      <div className="flex items-center gap-2 font-bold">
                        <Phone className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0" />
                        <span>{app.applicantPhone}</span>
                      </div>

                      {app.appliedDate && (
                        <div className="flex items-center gap-2 text-[11px] text-[#8B867F]">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{isHindi ? 'आवेदन समय:' : 'Applied:'} {app.appliedDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Skills */}
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase mb-1">
                        {isHindi ? 'प्रमाणित कौशल (Verified Skills):' : 'Verified Skills:'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.applicantSkills && app.applicantSkills.length > 0 ? (
                          app.applicantSkills.map(sk => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-md bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] text-[10px] font-bold"
                            >
                              ✓ {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#8B867F]">General Trade Hand</span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {app.notes && (
                      <div className="bg-[#FAF9F5] dark:bg-[#0D1117] p-2.5 rounded-xl text-xs text-[#6B665F] dark:text-[#94A3B8] italic mb-3 border border-[#E5E0D5] dark:border-[#262F3D]">
                        "{app.notes}"
                      </div>
                    )}
                  </div>

                  {/* Actions: Call, WhatsApp & Status Updater */}
                  <div className="pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D] space-y-3">
                    
                    {/* Fast Connect Buttons */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${app.applicantPhone.replace(/\s+/g, '')}`}
                        className="flex-1 py-2 rounded-xl bg-[#2D5A5A] hover:bg-[#224646] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'सीधा कॉल करें' : 'Call Candidate'}</span>
                      </a>

                      <a
                        href={`https://wa.me/${app.applicantPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${app.applicantName}, KaushalSetu पर आपके द्वारा "${app.jobTitle}" के लिए किए गए आवेदन के संबंध में संपर्क कर रहे हैं।`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {onOpenBiodata && (
                        <button
                          type="button"
                          onClick={() => onOpenBiodata(app.applicantName, app.applicantSkills)}
                          className="px-3 py-2 rounded-xl border border-[#CCE0E0] dark:border-[#262F3D] hover:bg-[#FAF9F5] text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] cursor-pointer"
                          title="View Kaushal Biodata"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[#8B867F] font-semibold text-[11px]">
                        {isHindi ? 'आवेदन स्थिति बदलें:' : 'Update Status:'}
                      </span>
                      <select
                        value={app.status}
                        onChange={(e) => {
                          if (onUpdateApplicationStatus) {
                            onUpdateApplicationStatus(app.id, e.target.value as any);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9]"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="hired">Hired / Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
