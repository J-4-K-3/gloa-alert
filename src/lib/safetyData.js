/**
 * Safety Protocols Data
 * 
 * Comprehensive safety protocols sourced from real-world organizations:
 * - FEMA (Federal Emergency Management Agency)
 * - WHO (World Health Organization)
 * - Red Cross
 * - CDC (Centers for Disease Control)
 * - OSHA (Occupational Safety and Health Administration)
 * - USGS (United States Geological Survey)
 * - Ready.gov
 * - UNDRR (United Nations Office for Disaster Risk Reduction)
 */

// Emergency Types with their respective protocols
export const emergencyTypes = [
  { id: 'earthquake', label: 'Earthquake', icon: '📉', color: '#f59e0b' },
  { id: 'flood', label: 'Flood', icon: '🌊', color: '#3b82f6' },
  { id: 'hurricane', label: 'Hurricane', icon: '🌀', color: '#8b5cf6' },
  { id: 'wildfire', label: 'Wildfire', icon: '🔥', color: '#ef4444' },
  { id: 'tornado', label: 'Tornado', icon: '🌪️', color: '#dc2626' },
  { id: 'tsunami', label: 'Tsunami', icon: '🌊', color: '#06b6d4' },
  { id: 'volcano', label: 'Volcanic Eruption', icon: '🌋', color: '#ea580c' },
  { id: 'winterstorm', label: 'Winter Storm', icon: '❄️', color: '#60a5fa' },
  { id: 'heatwave', label: 'Heat Wave', icon: '🌡️', color: '#f97316' },
  { id: 'general', label: 'General Emergency', icon: '⚠️', color: '#6b7280' },
];

// Regional safety guidelines (can be expanded with location data)
export const regionalGuidelines = {
  'North America': {
    primaryAgency: 'FEMA',
    emergencyNumber: '911',
    femaResources: true,
    specificAdvice: [
      'Follow FEMA and local emergency management guidelines',
      'Register with your local emergency notification system',
      'Know your community evacuation routes',
      'Keep emergency supplies ready for at least 72 hours',
    ],
  },
  'Europe': {
    primaryAgency: 'EU Civil Protection',
    emergencyNumber: '112',
    femaResources: false,
    specificAdvice: [
      'Use the European Emergency Number 112 for all emergencies',
      'Follow EU civil protection guidelines',
      'Register with your national emergency alert system',
      'Know the location of nearest emergency shelters',
    ],
  },
  'Asia': {
    primaryAgency: 'National Disaster Management',
    emergencyNumber: '911',
    femaResources: false,
    specificAdvice: [
      'Follow national disaster management authority guidelines',
      'Know your local tsunami/earthquake evacuation zones',
      'Keep emergency supplies and important documents together',
      'Stay informed through official government channels',
    ],
  },
  'default': {
    primaryAgency: 'Local Emergency Services',
    emergencyNumber: '911',
    femaResources: true,
    specificAdvice: [
      'Know your local emergency numbers',
      'Identify safe locations in your area',
      'Keep emergency supplies ready',
      'Stay informed through official sources',
    ],
  },
};

// Comprehensive safety protocols organized by category
export const safetyProtocols = {
  immediateActions: {
    title: 'Immediate Actions',
    icon: '🚨',
    description: 'What to do in the first minutes of an emergency',
    steps: [
      {
        number: 1,
        title: 'STOP - Assess the Situation',
        content: 'Stop what you\'re doing. Stay calm. Quickly evaluate immediate danger - check for fire, gas leaks, structural damage, or other hazards. Look for the safest path to exit if needed.',
        source: 'FEMA',
        sourceUrl: 'https://www.ready.gov/',
        color: '#ef4444',
      },
      {
        number: 2,
        title: 'PROTECT - Ensure Safety',
        content: 'Move to a safe location if necessary. Protect yourself and help others if it\'s safe to do so. If you smell gas, leave immediately. If there\'s fire, get out and stay out. Call for help if trapped.',
        source: 'Red Cross',
        sourceUrl: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html',
        color: '#f59e0b',
      },
      {
        number: 3,
        title: 'RESPOND - Take Action',
        content: 'Call emergency services (911 or local number). Provide clear location and nature of emergency. Apply first aid if trained. Follow official evacuation instructions. Do not re-enter damaged areas.',
        source: 'FEMA',
        sourceUrl: 'https://www.ready.gov/kit',
        color: '#10b981',
      },
      {
        number: 4,
        title: 'COMMUNICATE - Alert Others',
        content: 'Text instead of call when possible to keep lines open for emergencies. Use social media to alert family/neighbors. Report your status to emergency contacts. Listen to emergency broadcasts.',
        source: 'FEMA',
        sourceUrl: 'https://www.ready.gov/make-a-plan',
        color: '#3b82f6',
      },
    ],
  },
  
  emergencyKit: {
    title: 'Emergency Kit Checklist',
    icon: '🎒',
    description: 'Essential supplies to have ready for any emergency',
    categories: [
      {
        name: 'Water & Food',
        items: [
          'Water: 1 gallon per person per day (3-day supply)',
          'Non-perishable food (3-day supply minimum)',
          'Manual can opener',
          'Water purification tablets or filter',
          'Food for infants/children if applicable',
          'Pet food and supplies if applicable',
        ],
        source: 'FEMA',
        sourceUrl: 'https://www.ready.gov/build-a-kit',
      },
      {
        name: 'First Aid & Medical',
        items: [
          'First aid kit with bandages, antiseptic, pain relievers',
          'Prescription medications (7-day supply)',
          'Medical records and insurance information',
          'Personal medical devices (glasses, hearing aids)',
          'Emergency blanket',
          'Dust masks (N95)',
          'Hand sanitizer and moist towelettes',
        ],
        source: 'CDC',
        sourceUrl: 'https://www.cdc.gov/disasters/foodwater/prepare.html',
      },
      {
        name: 'Equipment',
        items: [
          'Flashlight with extra batteries',
          'Battery-powered or hand-crank radio',
          'Cell phone with chargers and backup battery',
          'Multi-tool or knife',
          'Whistle (to signal for help)',
          'Work gloves',
          'Dust masks',
          'Plastic sheeting and duct tape',
          'Wrench or pliers (to turn off utilities)',
        ],
        source: 'Ready.gov',
        sourceUrl: 'https://www.ready.gov/kits',
      },
      {
        name: 'Documents & Personal',
        items: [
          'Copies of important documents (ID, insurance, medical records)',
          'Family and emergency contact information',
          'Cash (small bills)',
          'Map of local area',
          'Photographs of family members',
          'Emergency blanket or sleeping bag',
          'Change of clothing',
          'Sanitation supplies',
        ],
        source: 'FEMA',
        sourceUrl: 'https://www.ready.gov/document-family-references',
      },
    ],
  },
  
  evacuation: {
    title: 'Evacuation Procedures',
    icon: '🏃',
    description: 'When and how to evacuate safely',
    stages: [
      {
        stage: '1',
        title: 'Order',
        content: 'Follow evacuation orders from local authorities immediately. Leave early enough to avoid being trapped.',
        color: '#ef4444',
      },
      {
        stage: '2',
        title: 'Routes',
        content: 'Use designated evacuation routes. Follow signs and instructions from emergency personnel.',
        color: '#f59e0b',
      },
      {
        stage: '3',
        title: 'Secure',
        content: 'Turn off utilities (gas, water, electricity) if instructed. Lock your home. Take your emergency kit.',
        color: '#10b981',
      },
      {
        stage: '4',
        title: 'Shelter',
        content: 'Go to designated shelters or a safe location. Register with emergency services so they know you\'re safe.',
        color: '#3b82f6',
      },
    ],
    tips: [
      'Keep your vehicle gas tank at least half full',
      'Know multiple evacuation routes from your area',
      'Never drive through flooded roads - turn around, don\'t drown',
      'Follow police, fire, and rescue directions',
      'Use hazard lights if stranded, stay with your vehicle',
      'Check on neighbors who may need assistance',
    ],
    sources: [
      { name: 'FEMA Evacuation', url: 'https://www.ready.gov/evacuation' },
      { name: 'Red Cross', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html' },
    ],
  },
  
  shelterInPlace: {
    title: 'Shelter in Place',
    icon: '🏠',
    description: 'When to stay inside and how to do it safely',
    when: [
      'Chemical, biological, or radiological incident',
      'Severe weather (tornado, hurricane)',
      'Active shooter/threat situation',
      'Local authorities instruct you to shelter',
    ],
    steps: [
      'Go indoors immediately. Close and lock all doors and windows.',
      'Turn off HVAC systems (heating, cooling, ventilation).',
      'Go to a room with few windows and doors if possible.',
      'Seal gaps under doorways and around windows with wet towels or plastic sheeting.',
      'Listen to emergency broadcasts for instructions.',
      'Stay away from windows and glass doors.',
      'Do not leave until authorities announce it\'s safe.',
    ],
    sources: [
      { name: 'FEMA Shelter', url: 'https://www.ready.gov/shelter' },
      { name: 'CDC', url: 'https://emergency.cdc.gov/shelter/default.asp' },
    ],
  },
  
  communication: {
    title: 'Emergency Communication',
    icon: '📱',
    description: 'How to communicate effectively during emergencies',
    chains: [
      {
        title: 'Primary Contact Chain',
        content: 'Designate a primary contact outside your immediate area who can relay messages between family members. This is crucial when local lines are overloaded.',
        source: 'FEMA',
      },
      {
        title: 'Out-of-Area Contact',
        content: 'Choose someone far from your location as an out-of-area contact. Local calls may be easier to complete than long-distance during emergencies.',
        source: 'Ready.gov',
      },
    ],
    checkIn: [
      'Set predetermined check-in times (e.g., every 2 hours)',
      'Use text messaging - it uses less bandwidth than calls',
      'Use social media (Facebook Safety Check, Twitter) when phone lines are down',
      'Leave a note at home with your location/status if evacuating',
      'Register with Safe and Well website after disasters',
    ],
    sources: [
      { name: 'Ready.gov', url: 'https://www.ready.gov/make-a-plan' },
      { name: 'Red Cross', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html' },
    ],
  },
  
  firstAid: {
    title: 'Basic First Aid for Emergencies',
    icon: '🩹',
    description: 'Essential first aid knowledge for emergency situations',
    conditions: [
      {
        title: 'Bleeding',
        steps: [
          'Apply direct pressure with clean cloth',
          'Elevate the wounded area above heart level',
          'Do not remove the cloth if blood soaks through - add more',
          'Apply bandage firmly but not too tight',
          'Seek immediate medical help for severe bleeding',
        ],
        source: 'Red Cross',
        sourceUrl: 'https://www.redcross.org/take-a-class/resources/prepare-athome',
      },
      {
        title: 'Burns',
        steps: [
          'Cool the burn with cool (not cold) running water for 10-20 minutes',
          'Remove jewelry or tight items before swelling',
          'Do not apply ice, butter, or toothpaste',
          'Cover with sterile, non-stick dressing',
          'Seek medical help for severe burns',
        ],
        source: 'CDC',
        sourceUrl: 'https://www.cdc.gov/disasters/burns.html',
      },
      {
        title: 'Choking',
        steps: [
          'Encourage person to cough if they can',
          'Perform Heimlich maneuver if person cannot speak or breathe',
          'Stand behind the person, wrap arms around waist',
          'Make a fist above navel, thrust upward',
          'Repeat until object is expelled or person becomes unconscious',
        ],
        source: 'Red Cross',
        sourceUrl: 'https://www.redcross.org/take-a-class/resources/prepare-athome',
      },
      {
        title: 'Shock',
        steps: [
          'Lay person down on their back if possible',
          'Elevate legs about 12 inches unless you suspect head/neck/back injury',
          'Keep person warm with blanket or coat',
          'Do not give food or drink',
          'Monitor breathing and be ready to perform CPR',
        ],
        source: 'Red Cross',
        sourceUrl: 'https://www.redcross.org/take-a-class/resources/prepare-athome',
      },
    ],
  },
  
  disasterSpecific: {
    title: 'Disaster-Specific Protocols',
    icon: '🌍',
    description: 'Safety protocols for different types of emergencies',
    disasters: [
      {
        type: 'earthquake',
        icon: '📉',
        color: '#f59e0b',
        before: [
          'Secure heavy furniture (water heaters, bookshelves) to walls',
          'Identify safe spots in each room (under sturdy tables, against interior walls)',
          'Know how to turn off gas, water, and electricity',
          'Practice "Drop, Cover, and Hold On" regularly',
          'Keep emergency kit and important documents accessible',
        ],
        during: [
          'DROP to your hands and knees',
          'COVER your head and neck under sturdy furniture',
          'HOLD ON until the shaking stops',
          'Stay away from windows and glass',
          'If outdoors, move to clear area away from buildings/trees',
          'If driving, pull over safely away from bridges/overpasses',
        ],
        after: [
          'Expect aftershocks - they can be dangerous',
          'Check for injuries and provide first aid',
          'Check for gas leaks (smell) - if you smell gas, evacuate immediately',
          'Inspect your home for structural damage before entering',
          'Use flashlights, not candles, until you\'re sure there\'s no gas leak',
          'Listen to emergency broadcasts for information',
        ],
        sources: [
          { name: 'FEMA Earthquake', url: 'https://www.ready.gov/earthquakes' },
          { name: 'USGS', url: 'https://www.usgs.gov/faqs/what-should-i-do-during-earthquake' },
        ],
      },
      {
        type: 'flood',
        icon: '🌊',
        color: '#3b82f6',
        before: [
          'Know your flood zone - check FEMA flood maps',
          'Elevate furnace, water heater, electric panel if in flood zone',
          'Move valuables to higher floors',
          'Stock emergency supplies',
          'Know evacuation routes',
        ],
        during: [
          'Move to higher ground immediately',
          'Do not walk or drive through flood waters',
          '6 inches of moving water can knock you down',
          '12 inches of water can sweep a car away',
          'If trapped in a building, go to the highest level (roof only if necessary)',
          'Do not climb into a closed attic - you may become trapped',
        ],
        after: [
          'Avoid walking in flood water - it may be electrically charged',
          'Do not return home until officials say it\'s safe',
          'Watch for snakes and other dangerous animals in flooded areas',
          'Clean and disinfect everything that got wet',
          'Take photos of damage for insurance',
        ],
        sources: [
          { name: 'FEMA Flood', url: 'https://www.ready.gov/floods' },
          { name: 'Red Cross', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html' },
        ],
      },
      {
        type: 'hurricane',
        icon: '🌀',
        color: '#8b5cf6',
        before: [
          'Know your evacuation zone and routes',
          'Reinforce windows/doors or install hurricane shutters',
          'Trim trees and remove outdoor furniture',
          'Fill gas tanks and charge all devices',
          'Stock up on water (1 gallon per person per day)',
          'Know how to turn off utilities',
        ],
        during: [
          'Stay indoors away from windows and glass doors',
          'Close all interior doors to compartmentalize pressure',
          'Listen to battery-operated radio for updates',
          'Use flashlights, not candles, if power goes out',
          'If in a high-rise, move to interior lowest floor',
          'Never go outside until officials announce it\'s safe',
        ],
        after: [
          'Be aware of continuing dangers from flooding and winds',
          'Avoid walking or driving through flood debris',
          'Watch for downed power lines',
          'Check food and water supplies - discard anything that touched flood water',
          'Document damage with photos for insurance',
        ],
        sources: [
          { name: 'FEMA Hurricane', url: 'https://www.ready.gov/hurricanes' },
          { name: 'NOAA', url: 'https://www.nhc.noaa.gov/prepare/readyyourself.php' },
        ],
      },
      {
        type: 'wildfire',
        icon: '🔥',
        color: '#ef4444',
        before: [
          'Create defensible space around your home (30 ft minimum)',
          'Clear roof and gutters of dead leaves/debris',
          'Connect garden hoses for use by firefighters',
          'Keep emergency kit in your vehicle',
          'Know evacuation routes and zones',
          'Sign up for emergency alerts',
        ],
        during: [
          'Leave immediately when ordered - don\'t wait',
          'Close all windows and doors to prevent drafts',
          'Turn off air conditioning/circulation',
          'Turn on all lights so your home is visible in smoke',
          'Follow police/fire department directions',
          'Call 911 when you are safely out',
        ],
        after: [
          'Don\'t return home until officials say it\'s safe',
          'Watch for hot spots - fires can reignite',
          'Use N95 masks for ash and smoke protection',
          'Check for structural damage before entering',
          'Throw away food that was exposed to heat/smoke',
        ],
        sources: [
          { name: 'Ready.gov Wildfire', url: 'https://www.ready.gov/wildfires' },
          { name: 'CAL FIRE', url: 'https://www.fire.ca.gov/' },
        ],
      },
      {
        type: 'tornado',
        icon: '🌪️',
        color: '#dc2626',
        before: [
          'Know your community\'s warning system (sirens)',
          'Identify safe shelter locations (basement, interior room)',
          'Practice tornado drills with your family',
          'Keep emergency kit in your shelter area',
          'Remove dead trees/limbs from your yard',
        ],
        during: [
          'Go to basement or interior room without windows',
          'Cover yourself with mattress or blankets',
          'Protect your head and neck with your arms',
          'If in a mobile home, leave immediately for sturdy building',
          'If in a vehicle, don\'t try to outrun a tornado - find sturdy shelter',
          'If caught outdoors, lie flat in a ditch or ravine',
        ],
        after: [
          'Stay in shelter until officials announce danger has passed',
          'Watch for falling debris and structural damage',
          'Check for injuries - provide first aid as needed',
          'Be aware of gas leaks - smell for odor',
          'Use flashlights, not candles, until utility companies confirm safety',
        ],
        sources: [
          { name: 'FEMA Tornado', url: 'https://www.ready.gov/tornadoes' },
          { name: 'NOAA Storm Prediction Center', url: 'https://www.spc.noaa.gov/faq/' },
        ],
      },
    ],
  },
};

// Additional resources from authoritative organizations
export const authoritativeResources = [
  {
    organization: 'FEMA',
    description: 'Federal Emergency Management Agency',
    url: 'https://www.fema.gov/',
    topics: ['General Emergency Preparedness', 'Disaster Recovery', 'Emergency Management'],
    logo: '🛡️',
  },
  {
    organization: 'Ready.gov',
    description: 'National public service campaign',
    url: 'https://www.ready.gov/',
    topics: ['Emergency Planning', 'Building Kits', 'Making Plans'],
    logo: '📋',
  },
  {
    organization: 'American Red Cross',
    description: 'Humanitarian organization',
    url: 'https://www.redcross.org/',
    topics: ['Disaster Relief', 'Blood Donation', 'Training'],
    logo: '❤️',
  },
  {
    organization: 'CDC',
    description: 'Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/',
    topics: ['Public Health Emergencies', 'Disease Prevention', 'Health Advisories'],
    logo: '🏥',
  },
  {
    organization: 'WHO',
    description: 'World Health Organization',
    url: 'https://www.who.int/',
    topics: ['Global Health Emergencies', 'Disease Outbreaks', 'Health Guidelines'],
    logo: '🌍',
  },
  {
    organization: 'USGS',
    description: 'United States Geological Survey',
    url: 'https://www.usgs.gov/',
    topics: ['Earthquakes', 'Tsunamis', 'Natural Hazards'],
    logo: '⛰️',
  },
  {
    organization: 'OSHA',
    description: 'Occupational Safety and Health Administration',
    url: 'https://www.osha.gov/',
    topics: ['Workplace Safety', 'Emergency Response', 'Training'],
    logo: '⚒️',
  },
  {
    organization: 'UNDRR',
    description: 'UN Office for Disaster Risk Reduction',
    url: 'https://www.undrr.org/',
    topics: ['Disaster Risk Reduction', 'Sendai Framework', 'Global Initiatives'],
    logo: '🌐',
  },
];

// Get region-specific guidelines
export const getRegionalGuidelines = (region) => {
  const normalizedRegion = region?.toLowerCase().trim();
  
  if (normalizedRegion?.includes('north america') || normalizedRegion?.includes('united states') || normalizedRegion?.includes('canada')) {
    return regionalGuidelines['North America'];
  }
  if (normalizedRegion?.includes('europe') || normalizedRegion?.includes('eu')) {
    return regionalGuidelines['Europe'];
  }
  if (normalizedRegion?.includes('asia') || normalizedRegion?.includes('pacific')) {
    return regionalGuidelines['Asia'];
  }
  
  return regionalGuidelines['default'];
};

// Get protocols for specific emergency type
export const getEmergencyProtocols = (emergencyType) => {
  const disaster = safetyProtocols.disasterSpecific.disasters.find(
    d => d.type === emergencyType
  );
  return disaster || null;
};

