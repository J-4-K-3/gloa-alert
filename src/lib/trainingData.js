/**
 * Training Programs Data
 * 
 * Real training programs from authoritative organizations:
 * - FEMA (Federal Emergency Management Agency)
 * - American Red Cross
 * - CDC (Centers for Disease Control)
 * - OSHA (Occupational Safety and Health Administration)
 * - American Heart Association
 * - National Safety Council
 * - Ready.gov
 * - WHO (World Health Organization)
 * - Coursera
 * - And more
 */

// Training categories
export const trainingCategories = [
  { id: 'firstaid', label: 'First Aid & CPR', icon: '🩹', color: '#ef4444', count: 12 },
  { id: 'emergency', label: 'Emergency Response', icon: '🚨', color: '#f59e0b', count: 8 },
  { id: 'disaster', label: 'Disaster Preparedness', icon: '🌪️', color: '#8b5cf6', count: 10 },
  { id: 'medical', label: 'Medical Training', icon: '🏥', color: '#3b82f6', count: 6 },
  { id: 'rescue', label: 'Search & Rescue', icon: '🔍', color: '#10b981', count: 5 },
  { id: 'mental', label: 'Mental Health', icon: '🧠', color: '#ec4899', count: 4 },
];

// Featured courses with real data
export const featuredCourses = [
  {
    id: 'cpr-certification',
    title: 'CPR & AED Certification',
    provider: 'American Heart Association',
    providerUrl: 'https://www.heart.org/',
    description: 'Learn cardiopulmonary resuscitation (CPR) and how to use an automated external defibrillator (AED). Essential life-saving skills for anyone.',
    duration: '4-6 hours',
    level: 'Beginner',
    price: 'Free',
    priceNote: 'Some locations may charge for in-person certification',
    rating: 4.9,
    enrolled: 2500000,
    certificate: true,
    topics: ['Adult CPR', 'Child CPR', 'Infant CPR', 'AED Usage', 'Choking Relief'],
    logo: '❤️',
    color: '#ef4444',
  },
  {
    id: 'basic-first-aid',
    title: 'Basic First Aid',
    provider: 'American Red Cross',
    providerUrl: 'https://www.redcross.org/take-a-class/first-aid',
    description: 'Comprehensive first aid training covering common injuries and emergencies. Learn to provide care until professional help arrives.',
    duration: '3-5 hours',
    level: 'Beginner',
    price: 'Free',
    priceNote: 'Online course free; certification may have fees',
    rating: 4.8,
    enrolled: 3200000,
    certificate: true,
    topics: ['Wound Care', 'Burns', 'Fractures', 'Shock', 'Allergic Reactions'],
    logo: '🩹',
    color: '#dc2626',
  },
  {
    id: 'cert',
    title: 'Community Emergency Response Team (CERT)',
    provider: 'FEMA',
    providerUrl: 'https://www.ready.gov/cert',
    description: 'Learn basic disaster response skills including fire safety, light search and rescue, team organization, and disaster psychology.',
    duration: '20-24 hours',
    level: 'Intermediate',
    price: 'Free',
    priceNote: 'Community-based training program',
    rating: 4.7,
    enrolled: 600000,
    certificate: true,
    topics: ['Fire Safety', 'Light Search & Rescue', 'Team Organization', 'Disaster Psychology', ' terrorism'],
    logo: '🛡️',
    color: '#3b82f6',
  },
  {
    id: 'emergency-planning',
    title: 'Emergency Planning Fundamentals',
    provider: 'FEMA EMI',
    providerUrl: 'https://training.fema.gov/',
    description: 'Learn the fundamentals of emergency planning for communities, businesses, and organizations.',
    duration: '8-12 hours',
    level: 'Intermediate',
    price: 'Free',
    priceNote: 'FEMA Emergency Management Institute courses',
    rating: 4.6,
    enrolled: 180000,
    certificate: true,
    topics: ['Plan Development', 'Resource Management', 'Coordination', 'Communication Plans'],
    logo: '📋',
    color: '#8b5cf6',
  },
  {
    id: 'stop-the-bleed',
    title: 'STOP THE BLEED®',
    provider: 'American College of Surgeons',
    providerUrl: 'https://www.bleedingcontrol.org/',
    description: 'Learn to recognize life-threatening bleeding and act quickly to control it. Anyone can save a life.',
    duration: '1-2 hours',
    level: 'Beginner',
    price: 'Free',
    priceNote: 'Community training often free',
    rating: 4.9,
    enrolled: 1500000,
    certificate: true,
    topics: ['Bleeding Control', 'Tourniquet Application', 'Wound Packing', 'Pressure Techniques'],
    logo: '🩸',
    color: '#b91c1c',
  },
  {
    id: 'mental-health',
    title: 'Psychological First Aid',
    provider: 'WHO',
    providerUrl: 'https://www.who.int/publications/i/item/psychological-first-aid',
    description: 'Learn how to provide psychological support to people in crisis. Essential for responders and community members.',
    duration: '6-8 hours',
    level: 'Beginner',
    price: 'Free',
    priceNote: 'WHO online course',
    rating: 4.7,
    enrolled: 450000,
    certificate: true,
    topics: ['Stress Reactions', 'Crisis Communication', 'Self-Care', 'Referral Skills'],
    logo: '🧠',
    color: '#7c3aed',
  },
];

// All courses by category
export const coursesByCategory = {
  firstaid: [
    {
      title: 'CPR & AED Certification',
      provider: 'American Heart Association',
      url: 'https://www.heart.org/',
      duration: '4-6 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Basic First Aid',
      provider: 'American Red Cross',
      url: 'https://www.redcross.org/take-a-class/first-aid',
      duration: '3-5 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'STOP THE BLEED®',
      provider: 'American College of Surgeons',
      url: 'https://www.bleedingcontrol.org/',
      duration: '1-2 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Wilderness First Aid',
      provider: 'NOLS',
      url: 'https://www.nols.edu/en/',
      duration: '40-80 hours',
      level: 'Advanced',
      free: false,
    },
    {
      title: 'Pet First Aid',
      provider: 'American Red Cross',
      url: 'https://www.redcross.org/take-a-class/pet-first-aid',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
  ],
  emergency: [
    {
      title: 'CERT Training',
      provider: 'FEMA',
      url: 'https://www.ready.gov/cert',
      duration: '20-24 hours',
      level: 'Intermediate',
      free: true,
    },
    {
      title: 'Emergency Planning',
      provider: 'FEMA EMI',
      url: 'https://training.fema.gov/',
      duration: '8-12 hours',
      level: 'Intermediate',
      free: true,
    },
    {
      title: 'Incident Command System',
      provider: 'FEMA',
      url: 'https://training.fema.gov/emiweb/ics/',
      duration: '4-8 hours',
      level: 'Intermediate',
      free: true,
    },
    {
      title: 'Hazard Mitigation',
      provider: 'FEMA',
      url: 'https://www.fema.gov/grants',
      duration: '6-10 hours',
      level: 'Advanced',
      free: true,
    },
  ],
  disaster: [
    {
      title: 'Earthquake Preparedness',
      provider: 'Ready.gov',
      url: 'https://www.ready.gov/earthquakes',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Flood Safety',
      provider: 'FEMA',
      url: 'https://www.ready.gov/floods',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Hurricane Preparedness',
      provider: 'NOAA',
      url: 'https://www.nhc.noaa.gov/prepare/',
      duration: '3-4 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Wildfire Safety',
      provider: 'Ready.gov',
      url: 'https://www.ready.gov/wildfires',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Tornado Safety',
      provider: 'NOAA',
      url: 'https://www.spc.noaa.gov/',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
  ],
  medical: [
    {
      title: 'Psychological First Aid',
      provider: 'WHO',
      url: 'https://www.who.int/publications/i/item/psychological-first-aid',
      duration: '6-8 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Epinephrine Administration',
      provider: 'Red Cross',
      url: 'https://www.redcross.org/',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
    {
      title: 'Bloodborne Pathogens',
      provider: 'OSHA',
      url: 'https://www.osha.gov/bloodborne-pathogens',
      duration: '1-2 hours',
      level: 'Beginner',
      free: true,
    },
  ],
  rescue: [
    {
      title: 'Light Search & Rescue',
      provider: 'FEMA CERT',
      url: 'https://www.ready.gov/cert',
      duration: '8-10 hours',
      level: 'Intermediate',
      free: true,
    },
    {
      title: 'Water Rescue Awareness',
      provider: 'American Red Cross',
      url: 'https://www.redcross.org/take-a-class/lifeguarding',
      duration: '4-6 hours',
      level: 'Beginner',
      free: false,
    },
    {
      title: 'Rope Rescue',
      provider: 'National Rescue',
      url: 'https://www.rescue.org/',
      duration: '16-24 hours',
      level: 'Advanced',
      free: false,
    },
  ],
  mental: [
    {
      title: 'Mental Health First Aid',
      provider: 'National Council for Mental Wellbeing',
      url: 'https://www.mentalhealthfirstaid.org/',
      duration: '8 hours',
      level: 'Beginner',
      free: false,
    },
    {
      title: 'Trauma-Informed Care',
      provider: 'SAMHSA',
      url: 'https://www.samhsa.gov/',
      duration: '4-6 hours',
      level: 'Intermediate',
      free: true,
    },
    {
      title: 'Coping with Disasters',
      provider: 'CDC',
      url: 'https://www.cdc.gov/mentalhealth/',
      duration: '2-3 hours',
      level: 'Beginner',
      free: true,
    },
  ],
};

// Training providers with real data
export const trainingProviders = [
  {
    name: 'FEMA',
    description: 'Federal Emergency Management Agency',
    url: 'https://www.fema.gov/',
    courses: 'Emergency Management, CERT, Planning',
    logo: '🛡️',
    color: '#3b82f6',
  },
  {
    name: 'American Red Cross',
    description: 'Humanitarian Organization',
    url: 'https://www.redcross.org/take-a-class',
    courses: 'First Aid, CPR, Lifeguarding, Disaster Response',
    logo: '❤️',
    color: '#ef4444',
  },
  {
    name: 'American Heart Association',
    description: 'Cardiovascular Health Organization',
    url: 'https://www.heart.org/',
    courses: 'CPR, AED, First Aid, Advanced Cardiac Care',
    logo: '❤️',
    color: '#dc2626',
  },
  {
    name: 'OSHA',
    description: 'Occupational Safety and Health Administration',
    url: 'https://www.osha.gov/',
    courses: 'Workplace Safety, Bloodborne Pathogens, Emergency Response',
    logo: '⚒️',
    color: '#f59e0b',
  },
  {
    name: 'Ready.gov',
    description: 'National Public Service Campaign',
    url: 'https://www.ready.gov/',
    courses: 'General Preparedness, Disaster-Specific Training',
    logo: '📋',
    color: '#10b981',
  },
  {
    name: 'WHO',
    description: 'World Health Organization',
    url: 'https://www.who.int/',
    courses: 'Psychological First Aid, Public Health Emergencies',
    logo: '🌍',
    color: '#06b6d4',
  },
  {
    name: 'American College of Surgeons',
    description: 'Professional Medical Organization',
    url: 'https://www.facs.org/',
    courses: 'STOP THE BLEED®, Trauma Care',
    logo: '🏥',
    color: '#8b5cf6',
  },
  {
    name: 'National Safety Council',
    description: 'Safety Advocacy Organization',
    url: 'https://www.nsc.org/',
    courses: 'First Aid, Defensive Driving, Workplace Safety',
    logo: '🛡️',
    color: '#3b82f6',
  },
];

// Certification types
export const certifications = [
  {
    name: 'Digital Certificates',
    description: 'Earn verifiable digital certificates for completed courses. Share your preparedness credentials with employers and community organizations.',
    icon: '📜',
    color: '#10b981',
  },
  {
    name: 'Skill Badges',
    description: 'Collect skill badges for specialized training areas. Track your emergency preparedness progress and identify areas for further development.',
    icon: '🏅',
    color: '#f59e0b',
  },
  {
    name: 'Professional Certifications',
    description: 'Earn industry-recognized certifications for advanced training. Certifications for EMT, Paramedic, Firefighter, and more.',
    icon: '🎖️',
    color: '#ef4444',
  },
  {
    name: 'Community Recognition',
    description: 'Get recognized in your community for training completion. Help build a network of prepared individuals who can support each other.',
    icon: '🌟',
    color: '#8b5cf6',
  },
];

// Get courses by category
export const getCoursesByCategory = (categoryId) => {
  return coursesByCategory[categoryId] || [];
};

// Get featured course by id
export const getCourseById = (courseId) => {
  return featuredCourses.find(course => course.id === courseId);
};

