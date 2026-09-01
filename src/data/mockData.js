/**
 * Festora Mock Dataset - Centered on Hyderabad & National Campus Scene
 */

export const categoriesData = [
  { id: 'cultural', title: 'Cultural Fests', count: '48 Events', icon: 'Music', color: '#8B5CF6', desc: 'Music nights, dance battles, drama & fashion shows' },
  { id: 'tech', title: 'Tech & Hackathons', count: '34 Events', icon: 'Cpu', color: '#6D28D9', desc: '24-hour coding sprints, AI challenges & robot wars' },
  { id: 'sports', title: 'Sports Meets', count: '29 Events', icon: 'Trophy', color: '#7C3AED', desc: 'Inter-college football, cricket, esports & athletics' },
  { id: 'workshops', title: 'Workshops & Talks', count: '22 Events', icon: 'BookOpen', color: '#A78BFA', desc: 'Industry masterclasses, leadership talks & tech bootcamps' },
  { id: 'quiz', title: 'Quizzes & Debates', count: '18 Events', icon: 'HelpCircle', color: '#8B5CF6', desc: 'General trivia, parliamentary debates & business case studies' },
  { id: 'gaming', title: 'Esports & Gaming', count: '15 Events', icon: 'Gamepad2', color: '#6D28D9', desc: 'Valorant, BGMI, FIFA & retro arcade tournaments' },
];

export const hyderabadLocations = [
  { id: 'gachibowli', name: 'Gachibowli', count: '18 Fests', tag: 'Tech & University Hub', image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop' },
  { id: 'madhapur', name: 'Madhapur', count: '14 Events', tag: 'Cultural & Arts Zone', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' },
  { id: 'hitec-city', name: 'HITEC City', count: '22 Events', tag: 'Innovation Belt', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop' },
  { id: 'secunderabad', name: 'Secunderabad', count: '9 Events', tag: 'Heritage & Inter-College', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop' },
  { id: 'kukatpally', name: 'Kukatpally', count: '12 Events', tag: 'Engineering Hub', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop' },
];

export const collegesData = [
  { id: 1, name: "IIIT Hyderabad", city: "Gachibowli", badge: "Felicity 2026", eventsCount: 18, shortName: "IIITH" },
  { id: 2, name: "CBIT Hyderabad", city: "Gandipet", badge: "Shruthi Fest", eventsCount: 22, shortName: "CBIT" },
  { id: 3, name: "VNR VJIET", city: "Bachupally", badge: "Sintillashunz", eventsCount: 15, shortName: "VNR" },
  { id: 4, name: "Osmania University", city: "Amberpet", badge: "State Central", eventsCount: 19, shortName: "OU" },
  { id: 5, name: "JNTU Hyderabad", city: "Kukatpally", badge: "TechFest '26", eventsCount: 24, shortName: "JNTUH" },
  { id: 6, name: "Vasavi College", city: "Ibrahimbagh", badge: "Acumen Fest", eventsCount: 14, shortName: "VCE" },
];

export const eventsData = [
  {
    id: 23,
    alias: 'felicity-2026',
    title: 'FELICITY 2026 — Annual Cultural & Tech Fest',
    college: "IIIT Hyderabad",
    location: "Gachibowli, Hyderabad",
    date: 'Mar 14 - 16, 2026',
    time: '09:00 AM - 10:00 PM IST',
    category: 'Cultural Fests',
    categoryId: 'cultural',
    attendees: '14,200+ Registered',
    tag: 'Trending #1 Event',
    price: 'Free Student Pass',
    badgeColor: '#8B5CF6',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    description: 'Felicity is Hyderabad\'s largest inter-college mega festival. 3 days of EDM pro-nites, hackathons, dance face-offs, and battle of the bands.',
    organizers: 'IIIT Student Cultural Council',
    eligibility: 'Open to all college students with valid student ID.',
    prizes: '₹ 5,000,000 Total Cash & Trophies',
    rules: [
      'Valid student college ID mandatory at main gate.',
      'Online pass verification via Festora app.',
      'Decisions made by judging panel are final.'
    ],
    schedule: [
      { time: 'Day 1 - 10:00 AM', title: 'Inauguration & Battle of the Bands' },
      { time: 'Day 1 - 06:00 PM', title: 'Acoustic Symphony Showcase' },
      { time: 'Day 2 - 02:00 PM', title: 'Street Dance Face-Off' },
      { time: 'Day 2 - 07:00 PM', title: 'Celebrity EDM Pro-Nite' },
      { time: 'Day 3 - 05:00 PM', title: 'Grand Finale & Award Ceremony' }
    ]
  },
  {
    id: 24,
    alias: 'hyd-hack-4',
    title: 'HYD-HACK 4.0 National Hackathon',
    college: 'JNTU Hyderabad',
    location: 'Kukatpally, Hyderabad',
    date: 'Mar 20 - 21, 2026',
    time: '36-Hour Non-stop Sprint',
    category: 'Tech & Hackathons',
    categoryId: 'tech',
    attendees: '3,800+ Engineers',
    tag: '₹ 8 Lakh Prize Pool',
    price: 'Free Entry',
    badgeColor: '#6D28D9',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
    description: 'Build production-ready prototypes across Web3, AI/ML, and FinTech mentored by senior tech leaders from HITEC City & Gachibowli companies.',
    organizers: 'JNTUH Developer Community',
    eligibility: 'Undergraduate & PG engineering students (Teams of 2-4).',
    prizes: '₹ 800,000 Cash Pool + Incubation Support',
    rules: [
      'Fresh code builds only during hackathon time window.',
      'Use of open APIs and public libraries permitted.',
      'Live prototype demonstration mandatory.'
    ],
    schedule: [
      { time: 'Mar 20 - 09:00 AM', title: 'Opening & Track Announcement' },
      { time: 'Mar 20 - 11:00 AM', title: 'Hacking Kick-off' },
      { time: 'Mar 21 - 10:00 AM', title: 'Submission Deadline' },
      { time: 'Mar 21 - 02:00 PM', title: 'Live Demos & Winner Announcement' }
    ]
  },
  {
    id: 25,
    alias: 'cyber-pulse-hyd',
    title: 'CYBER PULSE Pro-Nite ft. EDM Stars',
    college: 'CBIT Hyderabad',
    location: 'Gandipet, Hyderabad',
    date: 'Apr 02, 2026',
    time: '06:00 PM - 01:00 AM IST',
    category: 'Cultural Fests',
    categoryId: 'cultural',
    attendees: '8,900+ Booked',
    tag: 'Live Concert',
    price: 'Pass from ₹ 399',
    badgeColor: '#7C3AED',
    banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    description: 'Electrifying night of laser light shows, heavy bass drops, and national headliner DJ acts live on CBIT open-air grounds.',
    organizers: 'CBIT Shruthi Council',
    eligibility: 'Registered college students & pass holders.',
    prizes: 'VIP Backstage Passes & Official Merch',
    rules: [
      'QR Code Pass mandatory at entry.',
      'Strict campus safety and security protocols.'
    ],
    schedule: [
      { time: '06:00 PM', title: 'Gates Open & Opening DJ Sets' },
      { time: '08:00 PM', title: 'Laser & Sound Spectacle' },
      { time: '09:30 PM', title: 'Headliner EDM Performance' }
    ]
  },
  {
    id: 'robo-wars-vnr',
    title: 'ROBO WARS Heavyweight Arena',
    college: 'VNR VJIET',
    location: 'Bachupally, Hyderabad',
    date: 'Apr 10 - 11, 2026',
    time: '10:00 AM - 06:00 PM IST',
    category: 'Tech & Hackathons',
    categoryId: 'tech',
    attendees: '2,400+ Spectators',
    tag: 'Combat Arena',
    price: 'Free Entry',
    badgeColor: '#8B5CF6',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    description: 'Combat robotics arena battle! Custom 30kg metal bots collide in a bulletproof steel cage with spinner blades and pneumatic flippers.',
    organizers: 'VNR Robotics Guild',
    eligibility: 'Inter-college engineering teams.',
    prizes: '₹ 250,000 Cash Pool',
    rules: [
      '30kg weight limit for combat bots.',
      'Safety cutoff switch mandatory.'
    ],
    schedule: [
      { time: 'Day 1 - 10:00 AM', title: 'Tech Inspection & Weigh-in' },
      { time: 'Day 1 - 01:00 PM', title: 'Group Stage Battles' },
      { time: 'Day 2 - 04:00 PM', title: 'Grand Championship Finals' }
    ]
  },
  {
    id: 'valorant-hyd-league',
    title: 'VALORANT Hyderabad Campus Championship',
    college: 'Osmania University',
    location: 'Amberpet, Hyderabad',
    date: 'Apr 18 - 19, 2026',
    time: '11:00 AM - 08:00 PM IST',
    category: 'Esports & Gaming',
    categoryId: 'gaming',
    attendees: '4,500+ Viewers',
    tag: 'Live Streamed',
    price: 'Free Registration',
    badgeColor: '#6D28D9',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    description: 'The premier college esports tournament in Hyderabad. 64 teams compete across double elimination brackets for the city title.',
    organizers: 'OU Esports Club',
    eligibility: 'Enrolled college students.',
    prizes: '₹ 150,000 + Gaming Gear',
    rules: ['5v5 tournament ruleset on latest patch.'],
    schedule: [
      { time: 'Day 1 - 11:00 AM', title: 'Round of 64 Matches' },
      { time: 'Day 2 - 06:00 PM', title: 'Grand Finals Live Broadcast' }
    ]
  }
];

export const humanStories = [
  {
    quote: "Festora made entry verification for our 14,000-person fest at IIIT Hyderabad completely seamless using QR passes at campus gates.",
    name: "Siddharth Rao",
    role: "Convenor, Felicity Cultural Fest",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    quote: "Finding technical hackathons across Gachibowli and HITEC City colleges used to be chaotic. Festora organizes everything in one sleek place.",
    name: "Sri Vani",
    role: "Lead Organizer, JNTU Developer Guild",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
  }
];

export const userProfile = {
  name: "Bhavadeep Reddy",
  email: "bhavadeep@example.com",
  phone: "+91 98765 43210",
  college: "IIIT Hyderabad",
  year: "3rd Year",
  branch: "Computer Science & Engineering",
  city: "Hyderabad",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
  bio: "Tech enthusiast, hackathon participant, and campus cultural coordinator."
};

export const registeredTickets = [
  {
    ticketId: "FST-2026-00124",
    eventId: "felicity-2026",
    eventTitle: "FELICITY 2026 — Annual Cultural & Tech Fest",
    college: "IIIT Hyderabad",
    location: "Gachibowli, Hyderabad",
    date: "Mar 14 - 16, 2026",
    time: "09:00 AM - 10:00 PM IST",
    ticketType: "FREE STUDENT PASS",
    price: "Free Student Pass",
    status: "CONFIRMED",
    badgeColor: "#22C55E",
    banner: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    registeredOn: "Feb 12, 2026",
    qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FST-2026-00124-BHAVADEEP"
  },
  {
    ticketId: "FST-2026-00389",
    eventId: "hyd-hack-4",
    eventTitle: "HYD-HACK 4.0 National Hackathon",
    college: "JNTU Hyderabad",
    location: "Kukatpally, Hyderabad",
    date: "Mar 20 - 21, 2026",
    time: "36-Hour Non-stop Sprint",
    ticketType: "TEAM HACKER PASS",
    price: "Free Entry",
    status: "CONFIRMED",
    badgeColor: "#22C55E",
    banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
    registeredOn: "Feb 18, 2026",
    qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FST-2026-00389-BHAVADEEP"
  },
  {
    ticketId: "FST-2026-00512",
    eventId: "cyber-pulse-hyd",
    eventTitle: "CYBER PULSE Pro-Nite ft. EDM Stars",
    college: "CBIT Hyderabad",
    location: "Gandipet, Hyderabad",
    date: "Apr 02, 2026",
    time: "06:00 PM - 01:00 AM IST",
    ticketType: "VIP EARLY PASS",
    price: "₹ 399",
    status: "CONFIRMED",
    badgeColor: "#8B5CF6",
    banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    registeredOn: "Feb 22, 2026",
    qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FST-2026-00512-BHAVADEEP"
  },
  {
    ticketId: "FST-2026-00780",
    eventId: "robo-wars-vnr",
    eventTitle: "ROBO WARS Heavyweight Arena",
    college: "VNR VJIET",
    location: "Bachupally, Hyderabad",
    date: "Apr 10 - 11, 2026",
    time: "10:00 AM - 06:00 PM IST",
    ticketType: "ARENA PASS",
    price: "Free Entry",
    status: "UPCOMING",
    badgeColor: "#3B82F6",
    banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop",
    registeredOn: "Feb 26, 2026",
    qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FST-2026-00780-BHAVADEEP"
  }
];


