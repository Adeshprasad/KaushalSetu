import React, { useState, useRef } from 'react';
import { UserProfile, Language, GovernmentScheme } from '../types';
import { matchGovernmentSchemes } from '../utils/matching';
import { MOCK_GOVERNMENT_SCHEMES } from '../data/mockData';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Phone,
  Briefcase,
  Award,
  GraduationCap,
  Calendar,
  Sparkles,
  QrCode,
  Edit3,
  ExternalLink,
  Languages,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface KaushalBiodataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentLanguage: Language;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  schemes?: GovernmentScheme[];
}

export const KaushalBiodataModal: React.FC<KaushalBiodataModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentLanguage,
  onUpdateProfile,
  schemes = MOCK_GOVERNMENT_SCHEMES,
}) => {
  if (!isOpen) return null;

  const isHindi = currentLanguage === 'hi';

  // Customizable local fields for the biodata
  const [education, setEducation] = useState<string>('10th Pass / ITI Vocational');
  const [languagesKnown, setLanguagesKnown] = useState<string>('Hindi, Bhojpuri, Basic English');
  const [tradeSummary, setTradeSummary] = useState<string>(
    isHindi
      ? 'मेहनती और व्यावहारिक रूप से कुशल कारीगर, जो सुरक्षित काम और समय पर काम पूरा करने के लिए प्रतिबद्ध है।'
      : 'Dedicated, hands-on skilled tradesperson committed to safety, reliable craft, and timely task completion.'
  );
  const [expectedSalary, setExpectedSalary] = useState<string>('₹18,000 - ₹25,000 / month');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate a deterministic Kaushal ID
  const candidateId = `KS-IND-${(userProfile.state || 'BH').slice(0, 2).toUpperCase()}-${(userProfile.id || '9842').replace(/\D/g, '').slice(0, 5) || '73821'}`;
  const currentDate = new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Calculate matched schemes
  const eligibleSchemes = matchGovernmentSchemes(schemes, userProfile.skills).slice(0, 3);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp share message
  const generateWhatsAppMessage = () => {
    const skillsList = userProfile.skills.join(', ') || (isHindi ? 'वेल्डिंग, रिपेयरिंग' : 'Welding, Technical Repair');
    const schemeNames = eligibleSchemes.map(s => s.scheme.name).join(', ') || 'PM Vishwakarma, PMKVY 4.0';

    return encodeURIComponent(
      `*कौशल बायोडाटा | KAUSHAL BIODATA (Skill Verification Card)*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *नाम / Name:* ${userProfile.name || 'Candidate'}\n` +
      `🆔 *कौशल आईडी / Reg ID:* ${candidateId}\n` +
      `📍 *स्थान / Location:* ${userProfile.district || 'Patna'}, ${userProfile.state || 'Bihar'}\n` +
      `📞 *संपर्क / Phone:* ${userProfile.phone || '+91 98765 43210'}\n` +
      `🛠️ *प्रमाणित हुनर / Skills:* ${skillsList}\n` +
      `⏱️ *व्यावसायिक अनुभव / Experience:* ${userProfile.experienceYears || 2} वर्ष / Years\n` +
      `🎓 *शिक्षा / Qualification:* ${education}\n` +
      `💼 *अपेक्षित वेतन / Wage Expectation:* ${expectedSalary}\n` +
      `🏛️ *सरकारी योजना पात्रता / Scheme Eligibility:* ${schemeNames}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *सत्यापित / Verified by KaushalSetu Platform*\n` +
      `https://kaushalsetu.gov.in/verify/${candidateId}`
    );
  };

  const handleWhatsAppShare = () => {
    const msg = generateWhatsAppMessage();
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleCopyText = async () => {
    const skillsList = userProfile.skills.join(', ');
    const text =
      `KAUSHAL BIODATA - ${userProfile.name}\n` +
      `Reg ID: ${candidateId}\n` +
      `Location: ${userProfile.district}, ${userProfile.state}\n` +
      `Phone: ${userProfile.phone}\n` +
      `Skills: ${skillsList}\n` +
      `Experience: ${userProfile.experienceYears || 2} Years\n` +
      `Qualification: ${education}\n` +
      `Expected Salary: ${expectedSalary}\n` +
      `Verified by KaushalSetu Rural Skill Platform`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      
      {/* Modal Container */}
      <div className="bg-[#FAF9F5] dark:bg-[#10151C] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#161B22] border-b border-[#E5E0D5] dark:border-[#262F3D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#2B2927] dark:text-[#F1F5F9] leading-tight">
                {isHindi ? 'कौशल बायोडाटा व पहचान पत्र' : 'Kaushal Bio-Data & Skill Card'}
              </h2>
              <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] font-medium">
                {isHindi
                  ? 'ठेकेदारों व नियोक्ताओं के लिए 1-क्लिक प्रिंट व व्हाट्सएप साझाकरण'
                  : 'Ready-to-print & shareable verified profile for employers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Customize / Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="h-9 px-3 rounded-lg text-xs font-bold border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8B867F] dark:text-[#94A3B8]" />
              <span>{isEditing ? (isHindi ? 'प्रीव्यू देखें' : 'View Preview') : (isHindi ? 'विवरण बदलें' : 'Customize')}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="h-9 px-3.5 rounded-lg text-xs font-extrabold bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#1EBE5D]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'व्हाट्सएप भेजें' : 'Share WhatsApp'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-lg text-xs font-extrabold bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#224646] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#224646] dark:border-[#14B8A6]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? 'प्रिंट / PDF डाउनलोड' : 'Print / Save PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#F7F6F1] dark:bg-[#0A0D12]">
          
          {/* Customizer Drawer (if editing is active) */}
          {isEditing && (
            <div className="mb-6 p-4 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] shadow-xs space-y-3 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D5] dark:border-[#262F3D]">
                <span className="font-extrabold text-sm text-[#2B2927] dark:text-[#F1F5F9]">
                  {isHindi ? 'बायोडाटा की जानकारी संपादित करें' : 'Customize Biodata Information'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold cursor-pointer hover:underline"
                >
                  {isHindi ? 'पूर्ण / सहेजें' : 'Done / Save'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#6B665F] dark:text-[#94A3B8] mb-1">
                    {isHindi ? 'शैक्षणिक योग्यता' : 'Highest Qualification'}
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] font-medium"
                    placeholder="10th Pass / ITI Vocational"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6B665F] dark:text-[#94A3B8] mb-1">
                    {isHindi ? 'ज्ञात भाषाएँ' : 'Languages Known'}
                  </label>
                  <input
                    type="text"
                    value={languagesKnown}
                    onChange={(e) => setLanguagesKnown(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] font-medium"
                    placeholder="Hindi, Bhojpuri, English"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6B665F] dark:text-[#94A3B8] mb-1">
                    {isHindi ? 'अपेक्षित मासिक वेतन' : 'Expected Monthly Wage'}
                  </label>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] font-medium"
                    placeholder="₹18,000 - ₹25,000 / month"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6B665F] dark:text-[#94A3B8] mb-1">
                  {isHindi ? 'कारीगर परिचय व कार्य विवरण' : 'Work Summary & Craft Profile'}
                </label>
                <textarea
                  rows={2}
                  value={tradeSummary}
                  onChange={(e) => setTradeSummary(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] font-medium"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              THE PRINTABLE KAUSHAL BIODATA CARD
              Targeted by ID for clean browser print & PDF generation
             ======================================================== */}
          <div
            id="printable-kaushal-card"
            className="bg-white text-[#111827] rounded-2xl border-2 border-[#2D5A5A] shadow-md p-6 sm:p-8 max-w-3xl mx-auto font-sans"
          >
            {/* National Header & Official Identification Band */}
            <div className="border-b-2 border-[#2D5A5A] pb-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* National Emblem / Kaushal Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#2D5A5A] text-white flex flex-col items-center justify-center font-black shadow-xs shrink-0 border border-[#224646]">
                    <span className="text-xl leading-none">क</span>
                    <span className="text-[8px] tracking-widest uppercase font-bold mt-0.5">SETU</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-[#2D5A5A] tracking-tight uppercase">
                        कौशल बायोडाटा
                      </h1>
                      <span className="text-sm sm:text-base font-bold text-[#6B7280]">|</span>
                      <span className="text-base sm:text-lg font-extrabold text-[#1F2937] tracking-tight uppercase">
                        KAUSHAL BIODATA
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#4B5563] mt-0.5">
                      National Rural Skill & Vocational Employment Verification Card
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] font-medium">
                      सत्यापित ग्रामीण रोजगार व कौशल विकास मंच • KaushalSetu Portal
                    </p>
                  </div>
                </div>

                {/* Candidate Verified ID & QR Stamp */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>सत्यापित पहचान • Verified</span>
                  </span>
                  <div className="text-right mt-1.5">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Registration No.</span>
                    <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {candidateId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Primary Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              
              {/* Photo / Avatar & Basic Meta */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-[#F9FAFB] border border-gray-200">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#2D5A5A] shadow-xs mb-3"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-[#2D5A5A] text-white flex items-center justify-center text-4xl font-black shadow-xs mb-3">
                    {userProfile.name ? userProfile.name.charAt(0) : 'R'}
                  </div>
                )}

                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  {userProfile.name || 'Candidate Name'}
                </h2>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#FDF0EA] text-[#9C431B] border border-[#F6D3C2] text-[11px] font-bold">
                  {userProfile.skills[0] ? `${userProfile.skills[0].toUpperCase()} TECHNICIAN` : 'SKILLED TRADESPERSON'}
                </span>

                <div className="mt-4 pt-3 border-t border-gray-200 w-full text-xs space-y-1.5 text-left text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">स्थान / District:</span>
                    <span className="font-bold">{userProfile.district || 'Patna'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">राज्य / State:</span>
                    <span className="font-bold">{userProfile.state || 'Bihar'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">अनुभव / Exp:</span>
                    <span className="font-bold text-[#2D5A5A]">{userProfile.experienceYears || 2} वर्ष / Years</span>
                  </div>
                </div>
              </div>

              {/* Core Details Table */}
              <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 rounded-lg border border-gray-200 bg-white">
                    <span className="text-gray-500 font-bold block text-[10px] uppercase">मोबाइल नंबर / Mobile Phone</span>
                    <span className="font-bold text-gray-900 text-sm">{userProfile.phone || '+91 98765 43210'}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">✓ Direct Contact Enabled</span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-200 bg-white">
                    <span className="text-gray-500 font-bold block text-[10px] uppercase">शैक्षणिक योग्यता / Qualification</span>
                    <span className="font-bold text-gray-900 text-sm">{education}</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Practical Hands-on Tested</span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-200 bg-white">
                    <span className="text-gray-500 font-bold block text-[10px] uppercase">भाषा ज्ञान / Languages Known</span>
                    <span className="font-bold text-gray-900">{languagesKnown}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-200 bg-white">
                    <span className="text-gray-500 font-bold block text-[10px] uppercase">अपेक्षित वेतन / Wage Expectation</span>
                    <span className="font-bold text-[#9C431B]">{expectedSalary}</span>
                  </div>
                </div>

                {/* Craft / Trade Bio Summary */}
                <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E5E0D5] text-xs">
                  <span className="text-gray-600 font-bold block text-[10px] uppercase mb-1">
                    कारीगर परिचय / Candidate Craft Statement
                  </span>
                  <p className="text-gray-800 leading-relaxed font-medium italic">
                    "{tradeSummary}"
                  </p>
                </div>

              </div>
            </div>

            {/* Verified Skills Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2.5 pb-1 border-b border-gray-200">
                <Briefcase className="w-4 h-4 text-[#2D5A5A]" />
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">
                  प्रमाणित तकनीकी कौशल व औजार ज्ञान | Verified Trade Skills & Equipment
                </h3>
              </div>

              {userProfile.skills && userProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, idx) => (
                    <div
                      key={skill}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="capitalize">{skill}</span>
                      <span className="text-[10px] text-emerald-600 font-normal">({idx === 0 ? 'Primary' : 'Verified'})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No trade skills entered yet.</p>
              )}
            </div>

            {/* Government Scheme Entitlements & Certification Eligibility */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2.5 pb-1 border-b border-gray-200">
                <Award className="w-4 h-4 text-[#E87D4D]" />
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">
                  सरकारी योजना पात्रता व अनुदान | Government Schemes & Aid Eligibility
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {eligibleSchemes.map(({ scheme }) => (
                  <div key={scheme.id} className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/50">
                    <span className="font-bold text-gray-900 block leading-tight truncate">
                      {isHindi ? scheme.nameHi || scheme.name : scheme.name}
                    </span>
                    <span className="text-[10px] text-orange-700 font-semibold block mt-1">
                      {scheme.stipendOrAid || 'Free Toolkit & Certification'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Authentic Platform Stamp */}
            <div className="pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="block font-bold text-gray-800 text-[11px]">
                    KaushalSetu National Skill Verification
                  </span>
                  <span className="text-[10px]">
                    Issued: {currentDate} • Digital ID: {candidateId}
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className="block text-[11px] font-bold text-gray-700">
                  सत्यापित उम्मीदवार हस्ताक्षर / Candidate Declaration
                </span>
                <span className="text-[10px] text-gray-400 italic">
                  Electronically authenticated via KaushalSetu OTP/UIDAI Registry
                </span>
              </div>
            </div>

          </div>

          {/* Quick Copy Link Section */}
          <div className="max-w-3xl mx-auto mt-4 flex items-center justify-between text-xs text-[#8B867F] dark:text-[#94A3B8]">
            <span>
              {isHindi
                ? 'टिप: इस बायोडाटा को आप सीधे पीडीएफ के रूप में डाउनलोड करके ठेकेदार या कंपनी को व्हाट्सएप कर सकते हैं।'
                : 'Tip: Save as PDF to print copies for job interviews or send directly over WhatsApp.'}
            </span>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1 text-[#2D5A5A] dark:text-[#2DD4BF] font-bold hover:underline cursor-pointer ml-2 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'टेक्स्ट कॉपी करें' : 'Copy Text')}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
export default KaushalBiodataModal;
