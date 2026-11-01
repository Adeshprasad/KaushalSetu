import React, { useState, useEffect } from 'react';
import { Language, UserProfile, GroundedMapPlace, MapsSearchResult } from '../types';
import { TRANSLATIONS } from '../translations';
import { findNearestDistrict, getLocalFallbackPlaces, findDistrictByPinOrName, DISTRICT_COORDINATES } from '../utils/geoUtils';
import {
  MapPin,
  Search,
  Navigation,
  ExternalLink,
  Building2,
  GraduationCap,
  Sparkles,
  Loader2,
  Phone,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  RefreshCw,
  Compass,
  ArrowRight,
  Info,
  SlidersHorizontal,
  Share2,
  Check,
  AlertCircle,
  UserCheck,
  Hash
} from 'lucide-react';

interface NearbyCentersMapProps {
  currentLanguage: Language;
  userProfile: UserProfile;
  initialDistrict?: string;
  initialState?: string;
  onExploreMatchingJobs?: (skillOrLocation?: string) => void;
  onNavigateToTraining?: () => void;
}

const POPULAR_STATES_DISTRICTS: Record<string, string[]> = {
  'Bihar': ['Patna', 'Muzaffarpur', 'Gaya', 'Samastipur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Begusarai'],
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur', 'Gorakhpur', 'Prayagraj', 'Agra', 'Bareilly', 'Meerut'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer', 'Alwar'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Berhampur', 'Balasore'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Asansol', 'Durgapur', 'Kharagpur'],
  'Maharashtra': ['Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Thane'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli']
};

export const NearbyCentersMap: React.FC<NearbyCentersMapProps> = ({
  currentLanguage,
  userProfile,
  initialDistrict,
  initialState,
  onExploreMatchingJobs,
  onNavigateToTraining,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;
  const isHindi = currentLanguage === 'hi';

  const [selectedState, setSelectedState] = useState<string>(
    initialState || userProfile.state || 'Bihar'
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    initialDistrict || userProfile.district || 'Patna'
  );

  const [activeCategory, setActiveCategory] = useState<string>('iti');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [mapsData, setMapsData] = useState<MapsSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pinCodeOrTownInput, setPinCodeOrTownInput] = useState<string>('');
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedUri, setCopiedUri] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'cards' | 'map'>('split');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const categories = [
    {
      id: 'iti',
      nameHi: 'सरकारी आईटीआई कॉलेज',
      nameEn: 'Govt ITI Colleges',
      icon: GraduationCap,
      searchPrompt: 'government industrial training institute ITI college'
    },
    {
      id: 'pmkvy',
      nameHi: 'कौशल विकास केंद्र (PMKVY)',
      nameEn: 'PMKVY Skill Centers',
      icon: Award,
      searchPrompt: 'PMKVY skill development training center pradhan mantri kaushal kendra'
    },
    {
      id: 'csc',
      nameHi: 'जन सेवा केंद्र (CSC)',
      nameEn: 'Common Service Centers',
      icon: Building2,
      searchPrompt: 'Common Service Center CSC VLE digital seva kendra'
    },
    {
      id: 'polytechnic',
      nameHi: 'पॉलीटेक्निक संस्थान',
      nameEn: 'Polytechnic Institutes',
      icon: Layers,
      searchPrompt: 'Government Polytechnic diploma engineering college'
    }
  ];

  // Fetch Maps Grounding Data from server endpoint with resilient offline fallback
  const fetchMapsGroundingData = async (
    customQuery?: string,
    catId?: string,
    coords?: { lat: number; lng: number },
    overrideDistrict?: string,
    overrideState?: string
  ) => {
    setIsLoading(true);
    const targetDistrict = overrideDistrict || selectedDistrict;
    const targetState = overrideState || selectedState;
    const effectiveCategory = categories.find(c => c.id === (catId || activeCategory)) || categories[0];
    const categoryQuery = effectiveCategory.searchPrompt;
    const finalQuery = customQuery ? customQuery.trim() : categoryQuery;

    try {
      const response = await fetch('/api/maps/nearby-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          district: targetDistrict,
          state: targetState,
          category: catId || activeCategory,
          userCoordinates: coords || userCoordinates,
          language: currentLanguage
        })
      });

      if (response.ok) {
        const data: MapsSearchResult = await response.json();
        if (data && data.places && data.places.length > 0) {
          setMapsData(data);
          return;
        }
      }
      
      // If server returned non-200 or empty places, use verified local fallback
      console.warn('Using client fallback places for district:', targetDistrict);
      const fallback = getLocalFallbackPlaces(targetDistrict, targetState, catId || activeCategory, isHindi);
      setMapsData(fallback);
    } catch (err) {
      console.warn('Network issue fetching maps, activating verified local directory:', err);
      const fallback = getLocalFallbackPlaces(targetDistrict, targetState, catId || activeCategory, isHindi);
      setMapsData(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapsGroundingData();
  }, [selectedDistrict, selectedState, activeCategory]);

  // Fast PIN code (e.g. 800001, 221001) or Town/Tehsil resolution without needing device GPS
  const handleLookupPinOrTown = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = pinCodeOrTownInput.trim();
    if (!query) return;

    const matched = findDistrictByPinOrName(query);
    if (matched) {
      setSelectedState(matched.state);
      setSelectedDistrict(matched.district);
      setUserCoordinates({ lat: matched.lat, lng: matched.lng });
      setLocationNotice(
        isHindi
          ? `✓ स्थान मिल गया: ${matched.districtHi || matched.district}, ${matched.stateHi || matched.state}`
          : `✓ Location found: ${matched.district}, ${matched.state}`
      );
      setPinCodeOrTownInput('');
    } else {
      setLocationNotice(
        isHindi
          ? `"${query}" के लिए स्थान नहीं मिला। कृपया नीचे दी गई सूची या राज्य ड्रॉपडाउन से चुनें।`
          : `Could not match "${query}". Please choose from the popular districts below or the state dropdown.`
      );
    }
  };

  // 1-Click switch to user's saved profile location
  const handleSelectProfileLocation = () => {
    const profDist = userProfile.district || 'Patna';
    const profState = userProfile.state || 'Bihar';
    setSelectedState(profState);
    setSelectedDistrict(profDist);
    setLocationNotice(
      isHindi
        ? `✓ आपकी प्रोफ़ाइल का स्थान सक्रिय: ${profDist}, ${profState}`
        : `✓ Switched to your profile location: ${profDist}, ${profState}`
    );
  };

  // Quick select popular training center hub
  const handleSelectPopularHub = (district: string, state: string, labelHi?: string) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setLocationNotice(
      isHindi
        ? `✓ चयनित: ${labelHi || district} (${state})`
        : `✓ Selected: ${district} (${state})`
    );
  };

  const handleCopyLink = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedUri(uri);
    setTimeout(() => setCopiedUri(null), 2500);
  };

  const currentEmbedQuery = encodeURIComponent(
    customSearchQuery 
      ? `${customSearchQuery} ${selectedDistrict} ${selectedState}` 
      : `${categories.find(c => c.id === activeCategory)?.nameEn || 'Government ITI'} ${selectedDistrict} ${selectedState}`
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeIn transition-colors">
      
      {/* Top Banner / Hero Header */}
      <div className="bg-[#FAF9F5] dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-2xl p-4 sm:p-6 mb-6 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
              <span>{isHindi ? 'सत्यापित गूगल मैप्स डेटा' : 'Official Google Maps Data'}</span>
              <span className="w-1 h-1 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF]"></span>
              <span className="flex items-center gap-1 text-[#E87D4D]">
                <Sparkles className="w-3 h-3" />
                Gemini Maps Grounding
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
              {isHindi ? 'नजदीकी सरकारी आईटीआई, कौशल केंद्र व सीएससी' : 'Nearby ITIs, Skill Centers & CSC Locator'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#94A3B8] font-medium mt-1 max-w-2xl">
              {isHindi
                ? 'अपने जिले और गांव के आसपास आधिकारिक सरकारी प्रशिक्षण केंद्र, आईटीआई कॉलेज, पीएमकेवीवाई संस्थान और डिजिटल सेवा केंद्र गूगल मैप्स पर लाइव देखें।'
                : 'Locate verified physical government vocational institutes, ITIs, PMKVY centres, and Common Service Centres with live Google Maps navigation.'}
            </p>
          </div>

          {/* Location Action Bar (PIN code search + My Profile location button) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Quick PIN Code / Town Search */}
            <form
              onSubmit={handleLookupPinOrTown}
              className="flex items-center gap-1.5 bg-white dark:bg-[#10151C] p-1 rounded-xl border border-[#CCE0E0] dark:border-[#2D3748] shadow-2xs"
            >
              <div className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  value={pinCodeOrTownInput}
                  onChange={(e) => setPinCodeOrTownInput(e.target.value)}
                  placeholder={isHindi ? 'पिन कोड या शहर (उदा. 800001)' : 'PIN code or Town (e.g. 800001)'}
                  className="w-full bg-transparent pl-7 pr-2 py-1.5 text-xs font-semibold text-[#2B2927] dark:text-[#F1F5F9] placeholder-[#8B867F] dark:placeholder-[#64748B] focus:outline-hidden"
                />
                <Hash className="w-3.5 h-3.5 text-[#8B867F] dark:text-[#94A3B8] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-bold text-xs shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                {isHindi ? 'स्थान खोजें' : 'Locate'}
              </button>
            </form>

            {/* Profile District Button */}
            <button
              type="button"
              onClick={handleSelectProfileLocation}
              title={isHindi ? 'मेरी प्रोफ़ाइल का जिला चुनें' : 'Use your saved profile location'}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                selectedDistrict === (userProfile.district || 'Patna') && selectedState === (userProfile.state || 'Bihar')
                  ? 'bg-[#EBF1F1] dark:bg-[#152E2E] border-[#2D5A5A] dark:border-[#2DD4BF] text-[#2D5A5A] dark:text-[#2DD4BF]'
                  : 'bg-white dark:bg-[#10151C] border-[#E5E0D5] dark:border-[#2D3748] text-[#2B2927] dark:text-[#F1F5F9] hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF] shrink-0" />
              <span>{isHindi ? 'मेरी प्रोफ़ाइल:' : 'My Profile:'} <strong className="font-extrabold">{userProfile.district || 'Patna'}</strong></span>
            </button>
          </div>
        </div>

        {/* Popular Training Hubs Strip */}
        <div className="mt-4 pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D] flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mr-1 flex items-center gap-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
            {isHindi ? 'प्रमुख केंद्र:' : 'Popular Hubs:'}
          </span>
          {[
            { d: 'Patna', s: 'Bihar', label: 'पटना' },
            { d: 'Muzaffarpur', s: 'Bihar', label: 'मुजफ्फरपुर' },
            { d: 'Varanasi', s: 'Uttar Pradesh', label: 'वाराणसी' },
            { d: 'Lucknow', s: 'Uttar Pradesh', label: 'लखनऊ' },
            { d: 'Ranchi', s: 'Jharkhand', label: 'रांची' },
            { d: 'Jaipur', s: 'Rajasthan', label: 'जयपुर' },
            { d: 'Indore', s: 'Madhya Pradesh', label: 'इंदौर' },
            { d: 'Bhubaneswar', s: 'Odisha', label: 'भुवनेश्वर' },
            { d: 'Kolkata', s: 'West Bengal', label: 'कोलकाता' },
            { d: 'Coimbatore', s: 'Tamil Nadu', label: 'कोयंबटूर' }
          ].map((hub) => {
            const isCurrent = selectedDistrict === hub.d && selectedState === hub.s;
            return (
              <button
                key={hub.d}
                type="button"
                onClick={() => handleSelectPopularHub(hub.d, hub.s, hub.label)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-2xs'
                    : 'bg-white dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#FAF9F5] dark:hover:bg-[#1B222C]'
                }`}
              >
                <span>{isHindi ? hub.label : hub.d}</span>
                <span className="text-[10px] opacity-70">({hub.s.substring(0, 2).toUpperCase()})</span>
              </button>
            );
          })}
        </div>

        {locationNotice && (
          <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2.5 transition-all ${
            locationNotice.startsWith('✓')
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {locationNotice.startsWith('✓') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{locationNotice}</span>
            </div>

            <button
              type="button"
              onClick={() => setLocationNotice(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100 px-1 cursor-pointer"
              aria-label="Dismiss notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Location Selector Bar */}
        <div className="mt-5 pt-4 border-t border-[#E5E0D5] dark:border-[#262F3D] grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* State Dropdown */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mb-1">
              {isHindi ? 'राज्य / State' : 'State'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                const districtList = POPULAR_STATES_DISTRICTS[newState] || ['Patna'];
                setSelectedDistrict(districtList[0]);
              }}
              className="w-full bg-white dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] cursor-pointer"
            >
              {Object.keys(POPULAR_STATES_DISTRICTS).map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mb-1">
              {isHindi ? 'जिला / District' : 'District'}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-white dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] cursor-pointer"
            >
              {(POPULAR_STATES_DISTRICTS[selectedState] || [selectedDistrict]).map((dist) => (
                <option key={dist} value={dist} className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Search Query Input */}
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide mb-1">
              {isHindi ? 'विशिष्ट ट्रेड या स्थान खोजें / Search' : 'Custom Trade or Landmark Search'}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchMapsGroundingData(customSearchQuery);
                  }
                }}
                placeholder={isHindi ? 'उदा: वेल्डिंग आईटीआई कॉलेज, सोलर केंद्र, सीएससी...' : 'e.g. Electrician ITI college, Solar trainer, CSC...'}
                className="w-full bg-white dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#2D3748] rounded-xl pl-9 pr-24 py-2 text-xs sm:text-sm font-medium text-[#2B2927] dark:text-[#F1F5F9] placeholder-[#8B867F] dark:placeholder-[#64748B] focus:outline-hidden focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF]"
              />
              <Search className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8] absolute left-3 shrink-0" />
              <button
                type="button"
                onClick={() => fetchMapsGroundingData(customSearchQuery)}
                className="absolute right-1 px-3 py-1 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {isHindi ? 'खोजें' : 'Search'}
              </button>
            </div>
          </div>

        </div>

        {/* Category Pills */}
        <div className="mt-4 pt-3 border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-[#8B867F] dark:text-[#94A3B8] flex items-center gap-1 whitespace-nowrap shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isHindi ? 'सुझाव श्रेणियां:' : 'Filter Center Type:'}
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCustomSearchQuery('');
                  fetchMapsGroundingData(undefined, cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-2xs'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] border border-[#E5E0D5] dark:border-[#2D3748]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isHindi ? cat.nameHi : cat.nameEn}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Layout Area: Grounded Results & Map */}
      <div className="space-y-6">

        {/* Status Bar & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9]">
            <span>{isHindi ? `स्थान: ${selectedDistrict}, ${selectedState}` : `Location: ${selectedDistrict}, ${selectedState}`}</span>
            {mapsData?.places && (
              <span className="px-2 py-0.5 rounded-md bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] text-xs font-bold border border-[#CCE0E0] dark:border-[#1E4646]">
                {mapsData.places.length} {isHindi ? 'गूगल मैप्स परिणाम' : 'Google Maps Places'}
              </span>
            )}
            {isLoading && (
              <span className="flex items-center gap-1 text-[#E87D4D] text-xs font-semibold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {isHindi ? 'गूगल मैप्स से खोज रहे हैं...' : 'Querying Google Maps Grounding...'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#FAF9F5] dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117]' : 'text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9]'
              }`}
            >
              {isHindi ? 'स्प्लिट व्यू' : 'Split View'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117]' : 'text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9]'
              }`}
            >
              {isHindi ? 'स्थान सूची' : 'Cards Only'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'map' ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117]' : 'text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9]'
              }`}
            >
              {isHindi ? 'केवल नक्शा' : 'Map Only'}
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          
          {/* Left Column: Verified Places List & AI Grounded Overview */}
          {(viewMode === 'split' || viewMode === 'cards') && (
            <div className={viewMode === 'split' ? 'lg:col-span-7 space-y-4' : 'space-y-4'}>
              
              {/* AI Grounded Summary */}
              {mapsData?.text && (
                <div className="bg-[#FAF9F5] dark:bg-[#121820] border border-[#E5E0D5] dark:border-[#262F3D] rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[#2D5A5A] dark:text-[#2DD4BF] font-bold text-xs sm:text-sm mb-2">
                    <Sparkles className="w-4 h-4 text-[#E87D4D] dark:text-[#2DD4BF]" />
                    <span>{isHindi ? 'गूगल मैप्स आधारित सारांश व मार्गदर्शन' : 'Google Maps Grounded Overview & Trade Info'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-[#2B2927] dark:text-[#F1F5F9] leading-relaxed whitespace-pre-line font-medium">
                    {mapsData.text}
                  </div>
                </div>
              )}

              {/* Verified Place Cards List */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#2B2927] dark:text-[#F1F5F9] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E87D4D]" />
                  <span>{isHindi ? 'सत्यापित संस्थान व केंद्र (सीधे गूगल मैप्स लिंक)' : 'Verified Centers & Direct Google Maps Links'}</span>
                </h3>

                {isLoading && !mapsData ? (
                  <div className="p-8 text-center bg-[#FAF9F5] dark:bg-[#121820] rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2D5A5A] dark:text-[#2DD4BF] mx-auto" />
                    <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                      {isHindi ? 'गूगल मैप्स डेटा लोड हो रहा है...' : 'Retrieving physical locations from Google Maps...'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {mapsData?.places.map((place, idx) => {
                      const directionsUri = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.title + ', ' + (place.address || selectedDistrict))}`;
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-xl p-4 hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF] hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Top: Title & Verified Badge */}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="font-extrabold text-sm sm:text-base text-[#2B2927] dark:text-[#F1F5F9] leading-snug">
                                {place.title}
                              </h4>
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] text-[10px] font-bold border border-[#CCE0E0] dark:border-[#1E4646]">
                                <ShieldCheck className="w-3 h-3 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                                Google Maps
                              </span>
                            </div>

                            {/* Address / Landmark */}
                            {place.address && (
                              <p className="text-xs text-[#6B665F] dark:text-[#94A3B8] font-medium flex items-center gap-1 mb-2">
                                <MapPin className="w-3.5 h-3.5 text-[#8B867F] shrink-0" />
                                <span>{place.address}</span>
                              </p>
                            )}

                            {/* Review Snippets or Capabilities */}
                            {place.snippets && place.snippets.length > 0 && (
                              <div className="bg-[#FAF9F5] dark:bg-[#10151C] p-2.5 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] text-xs text-[#2B2927] dark:text-[#F1F5F9] mb-3">
                                <p className="italic text-[11px] text-[#6B665F] dark:text-[#94A3B8]">
                                  "{place.snippets[0]}"
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Links */}
                          <div className="pt-2 border-t border-[#E5E0D5] dark:border-[#262F3D] flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              {/* Open Direct Google Maps URL */}
                              <a
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] rounded-lg font-bold shadow-2xs transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-[#FAF9F5] dark:text-[#0D1117]" />
                                <span>{isHindi ? 'गूगल मैप्स पर खोलें' : 'Open in Maps'}</span>
                                <ExternalLink className="w-3 h-3 text-white/80 dark:text-[#0D1117]/80" />
                              </a>

                              {/* Get Driving / Transit Directions */}
                              <a
                                href={directionsUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#283243] text-[#2B2927] dark:text-[#F1F5F9] rounded-lg font-bold transition-colors"
                              >
                                <Navigation className="w-3.5 h-3.5 text-[#E87D4D]" />
                                <span>{isHindi ? 'रास्ता देखें' : 'Directions'}</span>
                              </a>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyLink(place.uri)}
                              className="text-[11px] font-semibold text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] flex items-center gap-1 cursor-pointer"
                            >
                              {copiedUri === place.uri ? (
                                <>
                                  <Check className="w-3 h-3 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                                  <span className="text-[#2D5A5A] dark:text-[#2DD4BF] font-bold">{isHindi ? 'कॉपी हो गया' : 'Copied'}</span>
                                </>
                              ) : (
                                <>
                                  <Share2 className="w-3 h-3" />
                                  <span>{isHindi ? 'लिंक शेयर' : 'Share'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Official Government Skill Portals Footnote */}
              <div className="bg-[#FAF9F5] dark:bg-[#121820] border border-[#E5E0D5] dark:border-[#262F3D] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                    {isHindi ? 'आधिकारिक सरकारी कौशल पोर्टल' : 'Official Government Skill Links'}
                  </h4>
                  <p className="text-[#6B665F] dark:text-[#94A3B8]">
                    {isHindi ? 'सीधे सरकारी वेबसाइट पर प्रवेश परीक्षा, एडमिट कार्ड और ऑनलाइन फॉर्म भरें।' : 'Official admissions, trade curriculum, and online certification portals.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.skillindiadigital.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] font-bold text-[#2D5A5A] dark:text-[#2DD4BF] hover:border-[#2D5A5A] flex items-center gap-1"
                  >
                    <span>Skill India</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://ncvtmis.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] font-bold text-[#2D5A5A] dark:text-[#2DD4BF] hover:border-[#2D5A5A] flex items-center gap-1"
                  >
                    <span>NCVT MIS</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://findmycsc.nic.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#2D3748] font-bold text-[#2D5A5A] dark:text-[#2DD4BF] hover:border-[#2D5A5A] flex items-center gap-1"
                  >
                    <span>CSC Locator</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* Right Column: Embedded Interactive Google Map */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={viewMode === 'split' ? 'lg:col-span-5' : 'w-full'}>
              <div className="sticky top-20 bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-xl overflow-hidden shadow-xs">
                
                {/* Map Header */}
                <div className="p-3 bg-[#FAF9F5] dark:bg-[#10151C] border-b border-[#E5E0D5] dark:border-[#262F3D] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9]">
                    <MapPin className="w-4 h-4 text-[#E87D4D]" />
                    <span>{isHindi ? `गूगल मैप्स लाइव दृश्य: ${selectedDistrict}` : `Google Maps View: ${selectedDistrict}`}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${currentEmbedQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#2D5A5A] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                  >
                    <span>{isHindi ? 'बड़ी स्क्रीन पर खोलें' : 'Full Screen'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Google Maps Embed iframe */}
                <div className="w-full h-[380px] sm:h-[500px] bg-[#FAF9F5] dark:bg-[#10151C] relative">
                  <iframe
                    title="Google Maps Vocational Centers View"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${currentEmbedQuery}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>

                {/* Map Footer Tip */}
                <div className="p-3 bg-[#FAF9F5] dark:bg-[#10151C] border-t border-[#E5E0D5] dark:border-[#262F3D] text-[11px] text-[#6B665F] dark:text-[#94A3B8] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8] shrink-0" />
                  <span>
                    {isHindi
                      ? 'संकेत: आप नक्शे पर ज़ूम इन/आउट कर सकते हैं और किसी भी केंद्र पर क्लिक करके सीधे ड्राइविंग व बस का रास्ता देख सकते हैं।'
                      : 'Tip: Click any marker to view walking/bus transit directions and contact timings.'}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
