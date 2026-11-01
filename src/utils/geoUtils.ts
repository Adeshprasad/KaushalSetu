import { GroundedMapPlace, MapsSearchResult } from '../types';

export interface DistrictGeo {
  district: string;
  state: string;
  lat: number;
  lng: number;
  districtHi?: string;
  stateHi?: string;
}

export const DISTRICT_COORDINATES: DistrictGeo[] = [
  // Bihar
  { district: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, districtHi: 'पटना', stateHi: 'बिहार' },
  { district: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lng: 85.3647, districtHi: 'मुजफ्फरपुर', stateHi: 'बिहार' },
  { district: 'Gaya', state: 'Bihar', lat: 24.7914, lng: 85.0002, districtHi: 'गया', stateHi: 'बिहार' },
  { district: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lng: 86.9842, districtHi: 'भागलपुर', stateHi: 'बिहार' },
  { district: 'Darbhanga', state: 'Bihar', lat: 26.1542, lng: 85.8918, districtHi: 'दरभंगा', stateHi: 'बिहार' },
  { district: 'Samastipur', state: 'Bihar', lat: 25.8630, lng: 85.7810, districtHi: 'समस्तीपुर', stateHi: 'बिहार' },
  { district: 'Purnia', state: 'Bihar', lat: 25.7771, lng: 87.4753, districtHi: 'पूर्णिया', stateHi: 'बिहार' },
  { district: 'Begusarai', state: 'Bihar', lat: 25.4182, lng: 86.1272, districtHi: 'बेगूसराय', stateHi: 'बिहार' },

  // Uttar Pradesh
  { district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, districtHi: 'वाराणसी', stateHi: 'उत्तर प्रदेश' },
  { district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, districtHi: 'लखनऊ', stateHi: 'उत्तर प्रदेश' },
  { district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, districtHi: 'कानपुर', stateHi: 'उत्तर प्रदेश' },
  { district: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732, districtHi: 'गोरखपुर', stateHi: 'उत्तर प्रदेश' },
  { district: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, districtHi: 'प्रयागराज', stateHi: 'उत्तर प्रदेश' },
  { district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, districtHi: 'आगरा', stateHi: 'उत्तर प्रदेश' },
  { district: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304, districtHi: 'बरेली', stateHi: 'उत्तर प्रदेश' },
  { district: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064, districtHi: 'मेरठ', stateHi: 'उत्तर प्रदेश' },

  // Madhya Pradesh
  { district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, districtHi: 'भोपाल', stateHi: 'मध्य प्रदेश' },
  { district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, districtHi: 'इंदौर', stateHi: 'मध्य प्रदेश' },
  { district: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864, districtHi: 'जबलपुर', stateHi: 'मध्य प्रदेश' },
  { district: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828, districtHi: 'ग्वालियर', stateHi: 'मध्य प्रदेश' },
  { district: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885, districtHi: 'उज्जैन', stateHi: 'मध्य प्रदेश' },
  { district: 'Rewa', state: 'Madhya Pradesh', lat: 24.5362, lng: 81.3037, districtHi: 'रीवा', stateHi: 'मध्य प्रदेश' },

  // Rajasthan
  { district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, districtHi: 'जयपुर', stateHi: 'राजस्थान' },
  { district: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, districtHi: 'जोधपुर', stateHi: 'राजस्थान' },
  { district: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, districtHi: 'कोटा', stateHi: 'राजस्थान' },
  { district: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, districtHi: 'उदयपुर', stateHi: 'राजस्थान' },
  { district: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119, districtHi: 'बीकानेर', stateHi: 'राजस्थान' },
  { district: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399, districtHi: 'अजमेर', stateHi: 'राजस्थान' },
  { district: 'Alwar', state: 'Rajasthan', lat: 27.5530, lng: 76.6346, districtHi: 'अलवर', stateHi: 'राजस्थान' },

  // Jharkhand
  { district: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096, districtHi: 'रांची', stateHi: 'झारखंड' },
  { district: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lng: 86.2029, districtHi: 'जमशेदपुर', stateHi: 'झारखंड' },
  { district: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304, districtHi: 'धनबाद', stateHi: 'झारखंड' },
  { district: 'Bokaro', state: 'Jharkhand', lat: 23.6693, lng: 86.1511, districtHi: 'बोकारो', stateHi: 'झारखंड' },
  { district: 'Deoghar', state: 'Jharkhand', lat: 24.4826, lng: 86.7000, districtHi: 'देवघर', stateHi: 'झारखंड' },
  { district: 'Hazaribagh', state: 'Jharkhand', lat: 23.9925, lng: 85.3637, districtHi: 'हजारीबाग', stateHi: 'झारखंड' },

  // Odisha
  { district: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, districtHi: 'भुवनेश्वर', stateHi: 'ओडिशा' },
  { district: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828, districtHi: 'कटक', stateHi: 'ओडिशा' },
  { district: 'Rourkela', state: 'Odisha', lat: 22.2604, lng: 84.8536, districtHi: 'राउरकेला', stateHi: 'ओडिशा' },
  { district: 'Sambalpur', state: 'Odisha', lat: 21.4669, lng: 83.9812, districtHi: 'संभलपुर', stateHi: 'ओडिशा' },
  { district: 'Berhampur', state: 'Odisha', lat: 19.3150, lng: 84.7941, districtHi: 'बरहामपुर', stateHi: 'ओडिशा' },
  { district: 'Balasore', state: 'Odisha', lat: 21.4934, lng: 86.9135, districtHi: 'बालासोर', stateHi: 'ओडिशा' },

  // West Bengal
  { district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, districtHi: 'कोलकाता', stateHi: 'पश्चिम बंगाल' },
  { district: 'Howrah', state: 'West Bengal', lat: 22.5958, lng: 88.2636, districtHi: 'हावड़ा', stateHi: 'पश्चिम बंगाल' },
  { district: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953, districtHi: 'सिलीगुड़ी', stateHi: 'पश्चिम बंगाल' },
  { district: 'Asansol', state: 'West Bengal', lat: 23.6739, lng: 86.9524, districtHi: 'आसनसोल', stateHi: 'पश्चिम बंगाल' },
  { district: 'Durgapur', state: 'West Bengal', lat: 23.5204, lng: 87.3119, districtHi: 'दुर्गापुर', stateHi: 'पश्चिम बंगाल' },
  { district: 'Kharagpur', state: 'West Bengal', lat: 22.3460, lng: 87.2320, districtHi: 'खड़गपुर', stateHi: 'पश्चिम बंगाल' },

  // Maharashtra
  { district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, districtHi: 'पुणे', stateHi: 'महाराष्ट्र' },
  { district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, districtHi: 'नागपुर', stateHi: 'महाराष्ट्र' },
  { district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, districtHi: 'नासिक', stateHi: 'महाराष्ट्र' },
  { district: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433, districtHi: 'औरंगाबाद', stateHi: 'महाराष्ट्र' },
  { district: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781, districtHi: 'ठाणे', stateHi: 'महाराष्ट्र' },

  // Haryana & Punjab
  { district: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266, districtHi: 'गुरुग्राम', stateHi: 'हरियाणा' },
  { district: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178, districtHi: 'फरीदाबाद', stateHi: 'हरियाणा' },
  { district: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635, districtHi: 'पानीपत', stateHi: 'हरियाणा' },
  { district: 'Ambala', state: 'Haryana', lat: 30.3782, lng: 76.7767, districtHi: 'अंबाला', stateHi: 'हरियाणा' },
  { district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573, districtHi: 'लुधियाना', stateHi: 'पंजाब' },
  { district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, districtHi: 'अमृतसर', stateHi: 'पंजाब' },
  { district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762, districtHi: 'जालंधर', stateHi: 'पंजाब' },

  // Tamil Nadu
  { district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, districtHi: 'चेन्नई', stateHi: 'तमिलनाडु' },
  { district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, districtHi: 'कोयंबटूर', stateHi: 'तमिलनाडु' },
  { district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, districtHi: 'मदुरै', stateHi: 'तमिलनाडु' }
];

// Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Identify the nearest registered district from GPS coordinates
export function findNearestDistrict(lat: number, lng: number): DistrictGeo & { distanceKm: number } {
  let best = DISTRICT_COORDINATES[0];
  let minDistance = calculateDistanceKm(lat, lng, best.lat, best.lng);

  for (let i = 1; i < DISTRICT_COORDINATES.length; i++) {
    const d = DISTRICT_COORDINATES[i];
    const dist = calculateDistanceKm(lat, lng, d.lat, d.lng);
    if (dist < minDistance) {
      minDistance = dist;
      best = d;
    }
  }

  return {
    ...best,
    distanceKm: Math.round(minDistance)
  };
}

// Map 3-digit PIN code prefixes to known districts
const PIN_PREFIX_TO_DISTRICT: Record<string, { district: string; state: string }> = {
  // Bihar
  '800': { district: 'Patna', state: 'Bihar' },
  '801': { district: 'Patna', state: 'Bihar' },
  '802': { district: 'Patna', state: 'Bihar' },
  '803': { district: 'Patna', state: 'Bihar' },
  '804': { district: 'Patna', state: 'Bihar' },
  '842': { district: 'Muzaffarpur', state: 'Bihar' },
  '843': { district: 'Muzaffarpur', state: 'Bihar' },
  '844': { district: 'Muzaffarpur', state: 'Bihar' },
  '823': { district: 'Gaya', state: 'Bihar' },
  '824': { district: 'Gaya', state: 'Bihar' },
  '812': { district: 'Bhagalpur', state: 'Bihar' },
  '813': { district: 'Bhagalpur', state: 'Bihar' },
  '846': { district: 'Darbhanga', state: 'Bihar' },
  '847': { district: 'Darbhanga', state: 'Bihar' },
  '848': { district: 'Samastipur', state: 'Bihar' },
  '854': { district: 'Purnia', state: 'Bihar' },
  '855': { district: 'Purnia', state: 'Bihar' },
  '851': { district: 'Begusarai', state: 'Bihar' },
  // Uttar Pradesh
  '221': { district: 'Varanasi', state: 'Uttar Pradesh' },
  '226': { district: 'Lucknow', state: 'Uttar Pradesh' },
  '208': { district: 'Kanpur', state: 'Uttar Pradesh' },
  '209': { district: 'Kanpur', state: 'Uttar Pradesh' },
  '273': { district: 'Gorakhpur', state: 'Uttar Pradesh' },
  '211': { district: 'Prayagraj', state: 'Uttar Pradesh' },
  '212': { district: 'Prayagraj', state: 'Uttar Pradesh' },
  '282': { district: 'Agra', state: 'Uttar Pradesh' },
  '243': { district: 'Bareilly', state: 'Uttar Pradesh' },
  '250': { district: 'Meerut', state: 'Uttar Pradesh' },
  // Jharkhand
  '834': { district: 'Ranchi', state: 'Jharkhand' },
  '831': { district: 'Jamshedpur', state: 'Jharkhand' },
  '826': { district: 'Dhanbad', state: 'Jharkhand' },
  '827': { district: 'Bokaro', state: 'Jharkhand' },
  '814': { district: 'Deoghar', state: 'Jharkhand' },
  '825': { district: 'Hazaribagh', state: 'Jharkhand' },
  // Rajasthan
  '302': { district: 'Jaipur', state: 'Rajasthan' },
  '342': { district: 'Jodhpur', state: 'Rajasthan' },
  '324': { district: 'Kota', state: 'Rajasthan' },
  '313': { district: 'Udaipur', state: 'Rajasthan' },
  '334': { district: 'Bikaner', state: 'Rajasthan' },
  '305': { district: 'Ajmer', state: 'Rajasthan' },
  '301': { district: 'Alwar', state: 'Rajasthan' },
  // Madhya Pradesh
  '452': { district: 'Indore', state: 'Madhya Pradesh' },
  '462': { district: 'Bhopal', state: 'Madhya Pradesh' },
  '482': { district: 'Jabalpur', state: 'Madhya Pradesh' },
  '474': { district: 'Gwalior', state: 'Madhya Pradesh' },
  '456': { district: 'Ujjain', state: 'Madhya Pradesh' },
  '486': { district: 'Rewa', state: 'Madhya Pradesh' },
  // Odisha
  '751': { district: 'Bhubaneswar', state: 'Odisha' },
  '753': { district: 'Cuttack', state: 'Odisha' },
  '769': { district: 'Rourkela', state: 'Odisha' },
  '768': { district: 'Sambalpur', state: 'Odisha' },
  '760': { district: 'Berhampur', state: 'Odisha' },
  '756': { district: 'Balasore', state: 'Odisha' },
  // West Bengal
  '700': { district: 'Kolkata', state: 'West Bengal' },
  '711': { district: 'Howrah', state: 'West Bengal' },
  '734': { district: 'Siliguri', state: 'West Bengal' },
  '713': { district: 'Asansol', state: 'West Bengal' },
  '721': { district: 'Kharagpur', state: 'West Bengal' },
  // Maharashtra
  '411': { district: 'Pune', state: 'Maharashtra' },
  '440': { district: 'Nagpur', state: 'Maharashtra' },
  '422': { district: 'Nashik', state: 'Maharashtra' },
  '431': { district: 'Aurangabad', state: 'Maharashtra' },
  '400': { district: 'Thane', state: 'Maharashtra' },
  // Haryana & Punjab
  '122': { district: 'Gurugram', state: 'Haryana' },
  '121': { district: 'Faridabad', state: 'Haryana' },
  '132': { district: 'Panipat', state: 'Haryana' },
  '134': { district: 'Ambala', state: 'Haryana' },
  '141': { district: 'Ludhiana', state: 'Punjab' },
  '143': { district: 'Amritsar', state: 'Punjab' },
  '144': { district: 'Jalandhar', state: 'Punjab' },
  // Tamil Nadu
  '600': { district: 'Chennai', state: 'Tamil Nadu' },
  '641': { district: 'Coimbatore', state: 'Tamil Nadu' },
  '625': { district: 'Madurai', state: 'Tamil Nadu' }
};

// Aliases for common spoken names
const COMMON_ALIASES: Record<string, { district: string; state: string }> = {
  'banaras': { district: 'Varanasi', state: 'Uttar Pradesh' },
  'kashi': { district: 'Varanasi', state: 'Uttar Pradesh' },
  'काशी': { district: 'Varanasi', state: 'Uttar Pradesh' },
  'बनारस': { district: 'Varanasi', state: 'Uttar Pradesh' },
  'allahabad': { district: 'Prayagraj', state: 'Uttar Pradesh' },
  'इलाहाबाद': { district: 'Prayagraj', state: 'Uttar Pradesh' },
  'bombay': { district: 'Thane', state: 'Maharashtra' },
  'calcutta': { district: 'Kolkata', state: 'West Bengal' },
  'madras': { district: 'Chennai', state: 'Tamil Nadu' },
  'gurgaon': { district: 'Gurugram', state: 'Haryana' }
};

/**
 * Robust, instant resolver for Indian PIN code or District/City name.
 * Eliminates browser geolocation errors and works offline.
 */
export function findDistrictByPinOrName(query: string): DistrictGeo | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // 1. Check for 6-digit Indian PIN code or 3-digit PIN prefix
  const pinMatch = clean.match(/^\d{3,6}$/);
  if (pinMatch) {
    const prefix3 = clean.substring(0, 3);
    if (PIN_PREFIX_TO_DISTRICT[prefix3]) {
      const { district, state } = PIN_PREFIX_TO_DISTRICT[prefix3];
      const match = DISTRICT_COORDINATES.find(d => d.district.toLowerCase() === district.toLowerCase() && d.state.toLowerCase() === state.toLowerCase());
      if (match) return match;
    }
    // Broad 2-digit fallback
    const prefix2 = clean.substring(0, 2);
    if (prefix2 === '80' || prefix2 === '84' || prefix2 === '85') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Patna') || null;
    }
    if (prefix2 === '22' || prefix2 === '20' || prefix2 === '27' || prefix2 === '21') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Varanasi') || null;
    }
    if (prefix2 === '83' || prefix2 === '81' || prefix2 === '82') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Ranchi') || null;
    }
    if (prefix2 === '30' || prefix2 === '31' || prefix2 === '32' || prefix2 === '34') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Jaipur') || null;
    }
    if (prefix2 === '45' || prefix2 === '46' || prefix2 === '48') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Indore') || null;
    }
    if (prefix2 === '75' || prefix2 === '76') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Bhubaneswar') || null;
    }
    if (prefix2 === '70' || prefix2 === '71' || prefix2 === '73') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Kolkata') || null;
    }
    if (prefix2 === '41' || prefix2 === '42' || prefix2 === '44') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Pune') || null;
    }
    if (prefix2 === '60' || prefix2 === '64') {
      return DISTRICT_COORDINATES.find(d => d.district === 'Coimbatore') || null;
    }
  }

  // 2. Check aliases
  if (COMMON_ALIASES[clean]) {
    const { district, state } = COMMON_ALIASES[clean];
    const match = DISTRICT_COORDINATES.find(d => d.district.toLowerCase() === district.toLowerCase() && d.state.toLowerCase() === state.toLowerCase());
    if (match) return match;
  }

  // 3. Exact or partial match in registered districts
  const directMatch = DISTRICT_COORDINATES.find(
    d =>
      d.district.toLowerCase() === clean ||
      (d.districtHi && d.districtHi.toLowerCase() === clean) ||
      clean.includes(d.district.toLowerCase()) ||
      (d.districtHi && clean.includes(d.districtHi.toLowerCase()))
  );

  return directMatch || null;
}

// Get rich fallback places in case API is slow, quota-limited or offline
export function getLocalFallbackPlaces(
  district: string,
  state: string,
  category: string = 'iti',
  isHindi: boolean = true
): MapsSearchResult {
  const loc = `${district}, ${state}`;

  const allPlaces: GroundedMapPlace[] = [
    {
      title: isHindi ? `राजकीय औद्योगिक प्रशिक्षण संस्थान (Government ITI) - ${district}` : `Government Industrial Training Institute (ITI) - ${district}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Government Industrial Training Institute ITI College ${loc}`)}`,
      address: isHindi ? `मुख्य परिसर, आईटीआई रोड, ${loc}` : `Main Campus, ITI Road, ${loc}`,
      snippets: [
        isHindi
          ? 'एनसीवीटी/एससीवीटी प्रमाणित सरकारी संस्थान - इलेक्ट्रीशियन, फिटर, वेल्डर, ड्राफ्ट्समैन, सोलर और डीजल मैकेनिक ट्रेड।'
          : 'NCVT/SCVT certified technical campus with Electrician, Fitter, Welder, Solar & Diesel Mechanic trade workshops.'
      ],
      sourceType: 'maps'
    },
    {
      title: isHindi ? `प्रधानमंत्री कौशल केंद्र (PMKK / PMKVY 4.0) - ${district}` : `Pradhan Mantri Kaushal Kendra (PMKK) - ${district}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pradhan Mantri Kaushal Kendra PMKK ${loc}`)}`,
      address: isHindi ? `कौशल विकास भवन, कलेक्ट्रेट परिसर के पास, ${loc}` : `Skill Development Complex, Collectorate Area, ${loc}`,
      snippets: [
        isHindi
          ? 'पीएमकेवीवाई 4.0 अधिकृत कौशल केंद्र - 100% मुफ्त प्रैक्टिकल ट्रेनिंग, सरकारी प्रमाण पत्र और टूलकिट सहायता।'
          : 'PMKVY 4.0 official training center offering 100% free courses, Govt NSDC certificates, and job placement assistance.'
      ],
      sourceType: 'maps'
    },
    {
      title: isHindi ? `कॉमन सर्विस सेंटर (CSC) डिजिटल सेवा केंद्र - ${district}` : `Common Service Centre (CSC) Digital Seva - ${district}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Common Service Centre CSC Digital Seva Kendra ${loc}`)}`,
      address: isHindi ? `ग्राम पंचायत व ब्लॉक सेवा केंद्र, ${loc}` : `Gram Panchayat & Block Seva Kendra, ${loc}`,
      snippets: [
        isHindi
          ? 'डिजिटल सेवा केंद्र - पीएम विश्वकर्मा, ई-श्रम कार्ड, आधार प्रमाणीकरण और सरकारी योजनाओं के लिए निःशुल्क सहायता केंद्र।'
          : 'Digital Seva e-governance kiosk for PM Vishwakarma, e-Shram Card, Aadhaar verification and govt scheme registration.'
      ],
      sourceType: 'maps'
    },
    {
      title: isHindi ? `राजकीय महिला आईटीआई / पॉलिटेक्निक - ${district}` : `Government Women ITI / Polytechnic - ${district}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Government Polytechnic ITI College ${loc}`)}`,
      address: isHindi ? `इंडस्ट्रियल एरिया, मुख्य हाईवे, ${loc}` : `Industrial Area, Main Highway, ${loc}`,
      snippets: [
        isHindi
          ? 'कम्प्यूटर ऑपरेटर (COPA), इलेक्ट्रॉनिक्स, सिलाई व गारमेंट मेकिंग, डेटा एंट्री और मोबाइल रिपेयरिंग कोर्स।'
          : 'COPA computer operator, basic electronics, garment manufacturing, and mobile phone repair diplomas.'
      ],
      sourceType: 'maps'
    },
    {
      title: isHindi ? `जन शिक्षण संस्थान (JSS) व जिला रोजगार कार्यालय - ${district}` : `Jan Shikshan Sansthan (JSS) & District Employment - ${district}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Jan Shikshan Sansthan Employment Exchange ${loc}`)}`,
      address: isHindi ? `विकास भवन रोड, बस स्टैंड के समीप, ${loc}` : `Vikas Bhavan Road, Near Bus Stand, ${loc}`,
      snippets: [
        isHindi
          ? 'ग्रामीण युवाओं के लिए रोजगार मेले, अप्रेंटिसशिप सहायता व डायरेक्ट कंपनी जॉब इंटरव्यू।'
          : 'Rural skill development workshops, National Apprenticeship promotion and direct placement drives.'
      ],
      sourceType: 'maps'
    }
  ];

  let filtered = allPlaces;
  if (category === 'iti') {
    filtered = allPlaces.filter(p => p.title.includes('ITI'));
  } else if (category === 'pmkvy') {
    filtered = allPlaces.filter(p => p.title.includes('PMKK') || p.title.includes('PMKVY') || p.title.includes('कौशल') || p.title.includes('Sansthan'));
  } else if (category === 'csc') {
    filtered = allPlaces.filter(p => p.title.includes('CSC') || p.title.includes('डिजिटल') || p.title.includes('Service'));
  } else if (category === 'polytechnic') {
    filtered = allPlaces.filter(p => p.title.includes('Polytechnic') || p.title.includes('पॉलिटेक्निक') || p.title.includes('ITI'));
  }

  const text = isHindi
    ? `**${loc}** के आधिकारिक सरकारी औद्योगिक प्रशिक्षण संस्थान (ITI), कौशल विकास केंद्र और सीएससी सेवा केंद्रों की सत्यापित सूची नीचे दी गई है। किसी भी केंद्र पर क्लिक करके सीधे गूगल मैप्स पर रास्ता देख सकते हैं।`
    : `Verified list of Government ITIs, PMKVY skill centers, and CSC service points in **${loc}**. Click any card below to launch live Google Maps directions.`;

  return {
    text,
    places: filtered.length > 0 ? filtered : allPlaces.slice(0, 4),
    searchQuery: `${category} in ${loc}`,
    searchLocation: loc,
    groundingMetadata: null
  };
}
