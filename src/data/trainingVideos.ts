import { TrainingVideo } from '../types';

export const getYoutubeSearchUrl = (query: string): string => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

export const getYoutubeWatchUrl = (youtubeId?: string, fallbackQuery?: string): string => {
  if (youtubeId) {
    return `https://www.youtube.com/watch?v=${youtubeId}`;
  }
  return getYoutubeSearchUrl(fallbackQuery || 'vocational skill training hindi');
};

export const getYoutubeEmbedUrl = (youtubeId?: string): string => {
  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
  }
  return '';
};

export const getYoutubeThumbnailUrl = (youtubeId?: string): string => {
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  return '';
};

export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: 'tr-weld-1',
    title: 'ARC & MIG Welding Complete Practical Course (Basic to Advanced)',
    titleHi: 'आर्क और मिग वेल्डिंग संपूर्ण प्रैक्टिकल कोर्स (शुरुआती से एक्सपर्ट)',
    trade: 'Fabrication & Metalwork',
    canonicalSkill: 'welding',
    channelName: 'Bharat Skills & ITI Technical',
    youtubeId: 'gGrbeDO9ois',
    youtubeUrl: 'https://www.youtube.com/watch?v=gGrbeDO9ois',
    searchQuery: 'arc and mig welding practical course hindi',
    searchQueryHi: 'आर्क वेल्डिंग और मिग वेल्डिंग प्रैक्टिकल हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/gGrbeDO9ois/hqdefault.jpg',
    duration: '28:45',
    level: 'Beginner',
    language: 'Hindi',
    description: 'Learn arc strike, electrode holding angles (45° & 70°), current amperage adjustment, beveling, safety gear, and vertical weld joints with zero porosity.',
    descriptionHi: 'आर्क लगाना, इलेक्ट्रोड पकड़ने का सही कोण, करंट एम्पीयर सेटिंग, बेवलिंग, सुरक्षा चश्मा और मजबूत जोड़ लगाने की पूरी जानकारी।',
    topicsCovered: [
      'Welding Machine Current Settings (80A - 160A)',
      '6013 vs 7018 Electrodes Selection',
      'Safety Gear & Flash Protection Mask',
      'T-Joint, Butt Joint & Lap Joint Practice'
    ],
    certifiedCourseUrl: 'https://www.skillindiadigital.gov.in/courses',
    certificationProvider: 'Skill India Digital & NCVT',
    viewsCount: '480K views',
    isPopular: true
  },
  {
    id: 'tr-solar-1',
    title: 'Rooftop Solar Panel Installation & Inverter Wiring Step-by-Step',
    titleHi: 'रूफटॉप सोलर पैनल इंस्टालेशन और इन्वर्टर वायरिंग सीखें',
    trade: 'Renewable Energy',
    canonicalSkill: 'solar installation',
    channelName: 'Surya Mitra Solar Tech Academy',
    youtubeId: 'baQlD0OIJ8s',
    youtubeUrl: 'https://www.youtube.com/watch?v=baQlD0OIJ8s',
    searchQuery: 'rooftop solar panel installation and inverter wiring practical hindi',
    searchQueryHi: 'सोलर पैनल इंस्टॉलेशन और इन्वर्टर कनेक्शन हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/baQlD0OIJ8s/hqdefault.jpg',
    duration: '34:20',
    level: 'Intermediate',
    language: 'Hindi',
    description: 'Comprehensive installation guide for On-Grid & Off-Grid solar systems: angle calculation, structure mounting, MC4 connector crimping, earthing spike, and inverter grid synchronization.',
    descriptionHi: 'ऑन-ग्रिड व ऑफ-ग्रिड सोलर सिस्टम की स्थापना: दिशा और कोण निर्धारण, स्ट्रक्चर माउंटिंग, MC4 कनेक्टर crimping, अर्थिंग और इन्वर्टर कनेक्शन।',
    topicsCovered: [
      'Solar Panel Tilt Angle for Indian Latitudes',
      'MC4 Connector Crimping & String Sizing',
      'DC Lightning Arrestor & Earth Pit Installation',
      'Solar Charge Controller & Net-Metering Inverter'
    ],
    certifiedCourseUrl: 'https://pmsuryaghar.gov.in/',
    certificationProvider: 'Surya Mitra / MNRE Govt of India',
    viewsCount: '720K views',
    isPopular: true
  },
  {
    id: 'tr-elec-1',
    title: 'Complete House Wiring, MCB Distribution Box & Inverter Connection',
    titleHi: 'घर की पूरी बिजली वायरिंग, MCB बॉक्स व इन्वर्टर वायरिंग',
    trade: 'Electrical & Electronics',
    canonicalSkill: 'electrical repair',
    channelName: 'Electrician Hindi Master',
    youtubeId: 'DI24wB6sXRs',
    youtubeUrl: 'https://www.youtube.com/watch?v=DI24wB6sXRs',
    searchQuery: 'house wiring practical mcb box inverter connection in hindi',
    searchQueryHi: 'हाउस वायरिंग एमसीबी बॉक्स इन्वर्टर कनेक्शन हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/DI24wB6sXRs/hqdefault.jpg',
    duration: '42:15',
    level: 'Beginner',
    language: 'Hindi',
    description: 'Single-phase conduit wiring, Phase-Neutral-Earth color coding, calculating MCB ratings (10A/16A/32A), RCCB earth leakage protection, and dual-pole changeover switches.',
    descriptionHi: 'पाइप वायरिंग, फेज-न्यूट्रल-अर्थिंग तार पहचान, लोड अनुसार सही MCB का चुनाव, RCCB प्रोटेक्शन और इन्वर्टर कनेक्शन।',
    topicsCovered: [
      'Wire Gauge Selection (1.5 sq mm vs 2.5 sq mm)',
      'MCB / RCCB Distribution Board Wiring',
      'Proper Grounding Pit Resistance Check',
      'Modular Switch Board 8-Module Assembly'
    ],
    certifiedCourseUrl: 'https://bharatskills.gov.in/Home/CraftsmenTrainingScheme',
    certificationProvider: 'Bharat Skills / DGT',
    viewsCount: '1.4M views',
    isPopular: true
  },
  {
    id: 'tr-bike-1',
    title: 'Motorcycle & 2-Wheeler Engine Overhaul, Carburetor & Clutch Tuning',
    titleHi: 'मोटरसाइकिल इंजन ओवरहाल, कार्बोरेटर और क्लच प्लेट रिपेयर',
    trade: 'Automotive & Mechanical',
    canonicalSkill: 'motorcycle repair',
    channelName: 'Two Wheeler Mechanic Lab',
    youtubeId: 'LSTa2IpHiWU',
    youtubeUrl: 'https://www.youtube.com/watch?v=LSTa2IpHiWU',
    searchQuery: 'motorcycle engine repair clutch plate carburetor tuning in hindi',
    searchQueryHi: 'बाइक इंजन रिपेयरिंग क्लच प्लेट कार्बोरेटर ट्यूनिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/LSTa2IpHiWU/hqdefault.jpg',
    duration: '26:50',
    level: 'Intermediate',
    language: 'Hindi',
    description: 'Diagnose spark plug issues, tappet adjustment, clutch plate friction replacement, drum & disc brake bleeding, chain sprocket alignment, and starting trouble remedies.',
    descriptionHi: 'स्पार्क प्लग जांच, टैपेट क्लीयरेंस सेटिंग, क्लच प्लेट बदलना, डिस्क ब्रेक सर्विसिंग, चेन स्प्रोकेट सेटिंग और माइलेज सेटिंग।',
    topicsCovered: [
      'Carburetor Air-Fuel Screw Tuning for Mileage',
      'Clutch Plate Disassembly and Friction Check',
      'Magnet Coil & CDI Unit Testing with Multimeter',
      'Front Fork Oil Seal Replacement'
    ],
    certifiedCourseUrl: 'https://www.skillindiadigital.gov.in/',
    certificationProvider: 'Automotive Skills Development Council (ASDC)',
    viewsCount: '530K views',
    isPopular: true
  },
  {
    id: 'tr-tailor-1',
    title: 'Professional Tailoring, Suit & Kurti Drafting and Sewing Masterclass',
    titleHi: 'सिलाई, कटिंग और बुटीक डिज़ाइनिंग मास्टरक्लास',
    trade: 'Textiles & Apparel',
    canonicalSkill: 'tailoring',
    channelName: 'Silai Aur Boutique Tutorials',
    youtubeId: 'yLD8m_jy_6k',
    youtubeUrl: 'https://www.youtube.com/watch?v=yLD8m_jy_6k',
    searchQuery: 'silai cutting and stitching kurti suit drafting tutorial hindi',
    searchQueryHi: 'सिलाई कटिंग और सूट कुर्ती डिजाइनिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/yLD8m_jy_6k/hqdefault.jpg',
    duration: '31:10',
    level: 'Beginner',
    language: 'Hindi',
    description: 'Body measurement formulas, paper drafting, fabric cutting without wastage, neckline piping, armhole curve shaping, and industrial sewing machine maintenance.',
    descriptionHi: 'नाप लेने का सही तरीका, कपड़े की कटिंग, गला पट्टी और पाइपिंग लगाना, आर्महोल की गोलाई और सिलाई मशीन की देखरेख।',
    topicsCovered: [
      'Accurate Body Measurements & Margin Calculation',
      'Princess Cut & Simple Blouse Drafting',
      'Bobbin Case & Thread Tension Adjustment',
      'Overlock & Finishing Techniques'
    ],
    certifiedCourseUrl: 'https://pmvishwakarma.gov.in/',
    certificationProvider: 'PM Vishwakarma Tailoring & Apparel',
    viewsCount: '890K views',
    isPopular: true
  },
  {
    id: 'tr-mobile-1',
    title: 'Mobile Phone Repairing Course: Screen Replacement, Charging Jack & IC Work',
    titleHi: 'मोबाइल रिपेयरिंग: डिस्प्ले स्क्रीन, चार्जिंग जैक और मदरबोर्ड रिपेयर',
    trade: 'Electrical & Electronics',
    canonicalSkill: 'mobile repair',
    channelName: 'Mobile Hardware & Software Guru',
    youtubeId: 'xVdzhvqM1eg',
    youtubeUrl: 'https://www.youtube.com/watch?v=xVdzhvqM1eg',
    searchQuery: 'mobile repairing full course screen replacement charging jack ic soldering hindi',
    searchQueryHi: 'मोबाइल रिपेयरिंग कोर्स डिस्प्ले चार्जिंग जैक सोल्डरिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/xVdzhvqM1eg/hqdefault.jpg',
    duration: '29:40',
    level: 'Intermediate',
    language: 'Hindi',
    description: 'SMD hot air gun operation, replacing broken glass touch screens via separator machine, micro-soldering Type-C charging ports, and battery revival techniques.',
    descriptionHi: 'SMD हॉट एयर गन से चिप निकालना, टच स्क्रीन सेपरेटर चलाना, टाइप-सी चार्जिंग पिन सोल्डरिंग और शॉर्टिंग ढूंढना।',
    topicsCovered: [
      'Multimeter Continuity & Voltage Diagnosis',
      'OCA Machine Display Pasting & Bubble Remover',
      'Type-C Jack Desoldering & Jumper Wire Setup',
      'Power IC & Network Section Troubleshooting'
    ],
    certifiedCourseUrl: 'https://www.skillindiadigital.gov.in/',
    certificationProvider: 'Electronics Sector Skills Council of India (ESSCI)',
    viewsCount: '620K views',
    isPopular: false
  },
  {
    id: 'tr-plumb-1',
    title: 'CPVC & UPVC Plumbing, Water Tank Fitting & Submersible Pump Installation',
    titleHi: 'प्लंबिंग, पानी टंकी फिटिंग और सबमर्सिबल मोटर इंस्टालेशन',
    trade: 'Construction & Facilities',
    canonicalSkill: 'plumbing',
    channelName: 'Plumber Masterclass India',
    youtubeId: 'cPSHwJiZE_c',
    youtubeUrl: 'https://www.youtube.com/watch?v=cPSHwJiZE_c',
    searchQuery: 'plumbing course cpvc upvc pipe water tank fitting hindi',
    searchQueryHi: 'प्लंबिंग काम पानी टंकी और बाथरूम फिटिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/cPSHwJiZE_c/hqdefault.jpg',
    duration: '24:15',
    level: 'Beginner',
    language: 'Hindi',
    description: 'Solvent cement jointing without leaks, concealed pipe cutting in brick walls, overhead water tank manifold connections, non-return valves (NRV), and pressure testing.',
    descriptionHi: 'CPVC पाइप सॉल्वेंट जोड़ना, दीवार में झिरी काटकर पाइप दबाना, पानी की टंकी कनेक्शन, ओवरफ्लो व बाईपास वाल्व फिटिंग।',
    topicsCovered: [
      'CPVC vs UPVC vs GI Pipe Applications',
      'Overhead Tank Automatic Float Valve Installation',
      'Bathroom Concealed Diverter & Mixer Fitting',
      'Submersible Starter & Non-Return Valve Setup'
    ],
    certifiedCourseUrl: 'https://www.ipssc.in/',
    certificationProvider: 'Indian Plumbing Skills Council (IPSC)',
    viewsCount: '390K views',
    isPopular: false
  },
  {
    id: 'tr-tractor-1',
    title: 'Tractor Operation, Rotary Tiller (Rotavator) & Hydraulic System Maintenance',
    titleHi: 'ट्रैक्टर संचालन, रोटावेटर सेटिंग और हाइड्रोलिक सिस्टम देखरेख',
    trade: 'Agriculture & Heavy Machinery',
    canonicalSkill: 'tractor driving',
    channelName: 'Krishi Yantra & Mechanical Hub',
    youtubeId: '1yAWxs61QHo',
    youtubeUrl: 'https://www.youtube.com/watch?v=1yAWxs61QHo',
    searchQuery: 'tractor driving rotavator setting hydraulic service practical hindi',
    searchQueryHi: 'ट्रैक्टर चलाना रोटावेटर हाइड्रोलिक सेटिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/1yAWxs61QHo/hqdefault.jpg',
    duration: '22:30',
    level: 'Beginner',
    language: 'Hindi',
    description: 'Dual clutch operation, PTO rpm speeds (540 vs 1000), rotavator blade alignment, hydraulic position & draft control levers for plowing, and diesel filter bleeding.',
    descriptionHi: 'डुअल क्लच का उपयोग, PTO शाफ्ट रोटावेटर कनेक्शन, जुताई के लिए ड्राफ्ट कंट्रोल लीवर सेटिंग और डीजल फिल्टर एयर निकालना।',
    topicsCovered: [
      'Dual-Speed PTO Gear & Universal Joint Greasing',
      'Hydraulic 3-Point Hitch Sensitivity Adjustment',
      'Engine Oil, Air Filter & Radiator Coolant Check',
      'Field Safety & Hill-Slope Maneuvering'
    ],
    certifiedCourseUrl: 'https://agricoop.nic.in/',
    certificationProvider: 'Agriculture Skill Council of India (ASCI)',
    viewsCount: '310K views',
    isPopular: false
  },
  {
    id: 'tr-mason-1',
    title: 'Modern Masonry, Brickwork Plumb Line (Sahul) & Wall Plastering',
    titleHi: 'राजमिस्त्री काम: साहुल से सीधी ईंट चिनाई और प्लास्टर लेवलिंग',
    trade: 'Construction & Facilities',
    canonicalSkill: 'masonry',
    channelName: 'Civil Construction & Masonry India',
    youtubeId: '_mrDiCdlqaU',
    youtubeUrl: 'https://www.youtube.com/watch?v=_mrDiCdlqaU',
    searchQuery: 'rajmistri kam sahul eent chinai plaster kaise kare hindi',
    searchQueryHi: 'राजमिस्त्री काम साहुल ईंट चिनाई प्लास्टर हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/_mrDiCdlqaU/hqdefault.jpg',
    duration: '27:40',
    level: 'Beginner',
    language: 'Hindi',
    description: 'Cement-sand mixing ratio (1:4 & 1:6), using plumb bob (Sahul) and spirit level for 90° corner columns, damp proof course (DPC), and sponge smooth plaster finishing.',
    descriptionHi: 'सीमेंट-रेत मसाला अनुपात, साहुल और वाटर लेवल पाइप से सीधी दीवार बनाना, कोने का गुनिया मिलाना और चिकना प्लास्टर।',
    topicsCovered: [
      'Mortar Ratio & Water Curing Best Practices',
      'Plumb Bob (Sahul) & Spirit Level Vertical Alignment',
      '9-inch Outer Wall vs 4.5-inch Partition Bonding',
      'Rough & Fine Finish Cement Plaster'
    ],
    certifiedCourseUrl: 'https://www.csdcindia.org/',
    certificationProvider: 'Construction Skill Development Council (CSDCI)',
    viewsCount: '440K views',
    isPopular: false
  },
  {
    id: 'tr-ac-1',
    title: 'Split AC Installation, Vacuuming, Flaring & Gas Charging R32 / R410A',
    titleHi: 'स्प्लिट एसी इंस्टालेशन, कॉपर पाइप फ्लेयरिंग व गैस चार्जिंग',
    trade: 'Electrical & Electronics',
    canonicalSkill: 'ac and refrigeration repair',
    channelName: 'HVAC & Refrigeration Tech',
    youtubeId: 'Gb25hxmH09M',
    youtubeUrl: 'https://www.youtube.com/watch?v=Gb25hxmH09M',
    searchQuery: 'split ac installation flaring vacuum gas charging r32 hindi',
    searchQueryHi: 'स्प्लिट एसी इंस्टालेशन वैक्यूम गैस चार्जिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/Gb25hxmH09M/hqdefault.jpg',
    duration: '38:00',
    level: 'Advanced',
    language: 'Hindi',
    description: 'Indoor-outdoor bracket mounting, copper pipe flare tool usage without cracks, micron vacuum gauge testing, manifold gauge readings, and refrigerant top-up safely.',
    descriptionHi: 'इंडोर और आउटडोर यूनिट लगाना, कॉपर पाइप फ्लेयर बनाना, वैक्यूम पंप से नमी निकालना और R32 गैस चार्ज करना।',
    topicsCovered: [
      'Copper Pipe Bending & Flaring Block Technique',
      'Vacuum Pump Evacuation (Below 500 Microns)',
      'Leakage Detection with Soap Bubbles & Nitrogen',
      'Inverter AC PCB Error Codes Diagnostic'
    ],
    certifiedCourseUrl: 'https://www.skillindiadigital.gov.in/',
    certificationProvider: 'Skill India Digital / ESSCI',
    viewsCount: '510K views',
    isPopular: true
  },
  {
    id: 'tr-carp-1',
    title: 'Modern Carpentry: Plywood Cutting, Modular Kitchen & Hinge Fitting',
    titleHi: 'बढ़ई का काम: प्लाईवुड कटिंग, मॉडर्न फर्नीचर और कब्जे लगाना',
    trade: 'Crafts & Woodwork',
    canonicalSkill: 'carpentry',
    channelName: 'Woodwork & Carpentry Master',
    youtubeId: 'NFpuz7_ztWU',
    youtubeUrl: 'https://www.youtube.com/watch?v=NFpuz7_ztWU',
    searchQuery: 'carpentry woodwork modular furniture auto hinge plywood cutting hindi',
    searchQueryHi: 'बढ़ई का काम प्लाईवुड कटिंग ऑटो हिंज फिटिंग हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/NFpuz7_ztWU/hqdefault.jpg',
    duration: '25:10',
    level: 'Intermediate',
    language: 'Hindi',
    description: 'Circular saw guide rail cutting, edge banding tape heat pasting, 35mm concealed auto-hinges installation, drawer telescopic channel fitting, and wood polish.',
    descriptionHi: 'प्लाईवुड की सीधी कटिंग, एज बेंडिंग टेप चिपकाना, ऑटो हिंज कब्जे लगाना और दराज के टेलीस्कोपिक चैनल फिट करना।',
    topicsCovered: [
      'Circular Saw & Router Machine Safety Guide',
      '35mm Concealed Cup Hinge Hole Marking',
      'Laminate Sheet Pasting with Fevicol SR / Heatx',
      'Telescopic Drawer Channel Alignment'
    ],
    certifiedCourseUrl: 'https://pmvishwakarma.gov.in/',
    certificationProvider: 'PM Vishwakarma Carpenter Trade',
    viewsCount: '360K views',
    isPopular: false
  },
  {
    id: 'tr-cnc-1',
    title: 'CNC & VMC Machine Operation: Tool Setting, G-Code & Work Offset',
    titleHi: 'सीएनसी और वीएमसी मशीन चलाना सीखें: टूल सेटिंग और जी-कोड',
    trade: 'Fabrication & Metalwork',
    canonicalSkill: 'cnc machine operation',
    channelName: 'CNC Technical Training Hub',
    youtubeId: 'lKC5KB0h-as',
    youtubeUrl: 'https://www.youtube.com/watch?v=lKC5KB0h-as',
    searchQuery: 'cnc machine operating practical course g code tool offset hindi',
    searchQueryHi: 'सीएनसी वीएमसी मशीन चलाना सीखें टूल सेटिंग जी कोड हिंदी',
    thumbnailUrl: 'https://img.youtube.com/vi/lKC5KB0h-as/hqdefault.jpg',
    duration: '35:45',
    level: 'Advanced',
    language: 'Hindi',
    description: 'Fanuc control panel introduction, dial gauge centering, Z-axis tool touch-off, G00/G01/G02 programming codes, coolant management, and part inspection using digital vernier.',
    descriptionHi: 'फैनुक कंट्रोल पैनल, डायल गेज से जॉब सेंटरिंग, टूल ऑफसेट लेना, G01/G02 कोडिंग और वर्नियर कैलिपर से नाप लेना।',
    topicsCovered: [
      'Fanuc / Siemens CNC Lathe Interface',
      'G-Code & M-Code Reference Table',
      'Work Coordinate System (G54 - G59)',
      'Vernier Caliper & Micrometer Precision Check'
    ],
    certifiedCourseUrl: 'https://bharatskills.gov.in/',
    certificationProvider: 'National Skill Training Institute (NSTI)',
    viewsCount: '290K views',
    isPopular: false
  }
];
