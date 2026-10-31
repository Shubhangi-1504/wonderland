export const MISSIONS = [
  {
    id: 'technova-m1',
    companyId: 'technova',
    code: 'MISSION 01',
    title: 'Become a Shareholder',
    location: 'TechNova Stock Exchange',
    level: 'Beginner',
    reward: '100 XP',
    xp: 100,
    status: 'AVAILABLE',
    type: 'Equities & Ownership',
    summary: 'Understand what a company is, discover what shares represent, and learn how shareholders become part-owners of businesses.',
    objectives: [
      'Understand what a company is',
      'Understand what a share represents',
      'Understand why companies issue shares'
    ]
  },
  {
    id: 'technova-m2',
    companyId: 'technova',
    code: 'MISSION 02',
    title: 'Meet the Market',
    location: 'TechNova Stock Exchange',
    level: 'Beginner',
    reward: '120 XP',
    xp: 120,
    status: 'COMING_SOON',
    type: 'Trading Mechanics',
    summary: 'Explore how stock exchanges work, meet buyers and sellers, and discover why share prices fluctuate continuously.',
    objectives: [
      'Understand stock exchanges',
      'Learn about buyers and sellers',
      'Discover why stock prices change'
    ]
  },
  {
    id: 'technova-m3',
    companyId: 'technova',
    code: 'MISSION 03',
    title: 'Bull vs Bear',
    location: 'TechNova Stock Exchange',
    level: 'Intermediate',
    reward: '150 XP',
    xp: 150,
    status: 'COMING_SOON',
    type: 'Market Cycles',
    summary: 'Decode market sentiment, analyze rising bull markets versus declining bear markets, and navigate volatility.',
    objectives: [
      'Understand bull markets',
      'Understand bear markets',
      'Explore market volatility'
    ]
  },
  {
    id: 'greenenergy-m1',
    companyId: 'greenenergy',
    code: 'MISSION 01',
    title: 'Discover Mutual Funds',
    location: 'GreenEnergy Corporation',
    level: 'Beginner',
    reward: '120 XP',
    xp: 120,
    status: 'COMING_SOON',
    type: 'Collective Investing',
    summary: 'Explore the world of mutual funds and discover how investors pool money to invest across diverse assets.',
    objectives: [
      'Understand pooled investments',
      'Learn about fund managers',
      'Discover diversification'
    ]
  },
  {
    id: 'greenenergy-m2',
    companyId: 'greenenergy',
    code: 'MISSION 02',
    title: 'The SIP Challenge',
    location: 'GreenEnergy Corporation',
    level: 'Intermediate',
    reward: '150 XP',
    xp: 150,
    status: 'COMING_SOON',
    type: 'Compounding',
    summary: 'Understand systematic investment plans (SIP), explore regular contributions, and master the math of compounding.',
    objectives: [
      'Understand systematic investment plans',
      'Explore regular contributions',
      'Learn about compounding'
    ]
  },
  {
    id: 'foodsphere-m1',
    companyId: 'foodsphere',
    code: 'MISSION 01',
    title: 'Startup to IPO',
    location: 'FoodSphere Corporation',
    level: 'Beginner',
    reward: '120 XP',
    xp: 120,
    status: 'COMING_SOON',
    type: 'Public Offerings',
    summary: 'Discover how companies grow, raise money from the public, and enter the stock exchange through an IPO.',
    objectives: [
      'Understand what an IPO is',
      'Discover why companies go public',
      'Learn about issue prices and listing'
    ]
  },
  {
    id: 'foodsphere-m2',
    companyId: 'foodsphere',
    code: 'MISSION 02',
    title: 'IPO Detective',
    location: 'FoodSphere Corporation',
    level: 'Intermediate',
    reward: '150 XP',
    xp: 150,
    status: 'COMING_SOON',
    type: 'Due Diligence',
    summary: 'Explore company disclosures, evaluate basic IPO risks, and learn how to analyze a company prospectus.',
    objectives: [
      'Explore company information',
      'Understand basic IPO risks',
      'Learn how to evaluate a fictional company'
    ]
  }
];

export const ACHIEVEMENTS = [
  {
    id: 'a1',
    title: 'City Explorer',
    description: 'Enter Stock Market City and inspect all 3 landmark corporate headquarters.',
    progress: '3/3',
    unlocked: true,
    reward: 'Explorer Badge + 100 XP'
  },
  {
    id: 'a2',
    title: 'First Shareholder',
    description: 'Complete Mission 01: Become a Shareholder at TechNova Stock Exchange.',
    progress: '1/1',
    unlocked: true,
    reward: 'Shareholder Badge + 100 XP'
  },
  {
    id: 'a3',
    title: 'Market Analyst',
    description: 'Explore the 3 virtual companies and compare their business models.',
    progress: '3/3',
    unlocked: true,
    reward: 'Analyst Ribbon'
  }
];

export const MISSIONS_DATA = MISSIONS;
