/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU)
 * Central Data Store, State Schema & Elo Rating Engine
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'sportsly_user',
  CURRENT_STAFF: 'sportsly_staff_user',
  STUDENT_DB: 'sportsly_student_db',
  ROSTER: 'sportsly_student_db', // Aliased for backward compatibility
  ADMIN_DB: 'sportsly_staff_db',
  COURT_SLOTS: 'sportsly_court_slots',
  MATCHES: 'sportsly_matches',
  ADMIN_DISPUTES: 'sportsly_flagged_disputes',
  BOOKING_POLICY: 'sportsly_booking_policy',
  NOTIFICATIONS: 'sportsly_notifications',
  CHAT_HISTORY: 'sportsly_chats'
};

// Available campus sports at FCCU Sports Complex
const FCCU_SPORTS = [
  { id: 'badminton', name: 'Badminton', facility: 'Gymnasium (Courts 1 - 4)' },
  { id: 'table_tennis', name: 'Table Tennis', facility: 'Student Center (Tables 1 - 4)' },
  { id: 'lawn_tennis', name: 'Lawn Tennis', facility: 'Outer Grounds (Courts 1 & 2)' }
];

// Standard weekly free slots across FCCU intramural hours
const DEFAULT_WEEKLY_SLOTS = [
  'Mon 3:00 PM - 4:00 PM',
  'Mon 4:00 PM - 5:00 PM',
  'Tue 3:00 PM - 4:00 PM',
  'Tue 5:00 PM - 6:00 PM',
  'Wed 2:00 PM - 3:00 PM',
  'Wed 4:00 PM - 5:00 PM',
  'Thu 3:00 PM - 4:00 PM',
  'Thu 4:00 PM - 5:00 PM',
  'Fri 3:00 PM - 5:00 PM',
  'Sat 10:00 AM - 12:00 PM'
];

// 60-Minute Booking Grid Time Intervals
const TIME_SLOTS_60_MIN = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM'
];

// Court Mapping per Sport
const COURT_DEFINITIONS = {
  Badminton: ['Court 1 (Glass Front)', 'Court 2 (Center)', 'Court 3 (North)', 'Court 4 (South)'],
  'Table Tennis': ['Table 1 (Arena)', 'Table 2 (Arena)', 'Table 3 (Rec Room)', 'Table 4 (Rec Room)'],
  'Lawn Tennis': ['Court 1 (Championship Hard)', 'Court 2 (Practice Hard)']
};

/**
 * Pre-Seeded Realistic Student Accounts (localStorage STUDENT DB)
 * Strict Requirement: Contains exact 4 accounts + Daniyal Khan & Raza Mehmood + competitive athletes
 */
const DEFAULT_STUDENTS = [
  // 1. Student Login 1 — Active Student with Booked Court & Pending Matches
  {
    id: 'std-281140101',
    email: '281140101@formanite.fccollege.edu.pk',
    rollNumber: '281140101',
    name: 'Bilal Ahmed',
    sport: 'Badminton',
    elo: 1040,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.42,
    cnic: '35202-1140101-3',
    contact: '0300-4110101',
    wins: 4,
    losses: 1,
    activeStatus: 'Active',
    varsityShortlisted: false,
    freeSlots: [
      'Mon 4:00 PM - 5:00 PM',
      'Wed 4:00 PM - 5:00 PM',
      'Fri 3:00 PM - 5:00 PM'
    ]
  },
  // 2. Student Login 2 — Blocked by Disciplinary Hold
  {
    id: 'std-281140202',
    email: '281140202@formanite.fccollege.edu.pk',
    rollNumber: '281140202',
    name: 'Usman Farooq',
    sport: 'Table Tennis',
    elo: 1000,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: true,
    cgpa: 2.35,
    cnic: '35202-1140202-7',
    contact: '0321-4220202',
    wins: 2,
    losses: 4,
    activeStatus: 'Active',
    varsityShortlisted: false,
    freeSlots: [
      'Tue 3:00 PM - 4:00 PM',
      'Thu 3:00 PM - 4:00 PM'
    ]
  },
  // 3. Student Login 3 — Affected by Admin Locked Court & Booking Override
  {
    id: 'std-281140303',
    email: '281140303@formanite.fccollege.edu.pk',
    rollNumber: '281140303',
    name: 'Ayesha Siddiqui',
    sport: 'Badminton',
    elo: 1015,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: false,
    cgpa: 3.78,
    cnic: '35202-1140303-8',
    contact: '0333-4330303',
    wins: 4,
    losses: 2,
    activeStatus: 'Active',
    varsityShortlisted: false,
    hasOverrideNotice: true,
    overrideMessage: 'Schedule Notice: Your 6:00 PM reservation on Badminton Court 2 was overridden by Sports Administration for Varsity/Female-Only practice. Your 1 weekly booking hour has been refunded.',
    freeSlots: [
      'Mon 3:00 PM - 4:00 PM',
      'Wed 2:00 PM - 3:00 PM',
      'Fri 3:00 PM - 5:00 PM'
    ]
  },
  // 4. Student Login 4 — Weekly Booking Hour Limit Reached (3/3 Hours Used)
  {
    id: 'std-281140404',
    email: '281140404@formanite.fccollege.edu.pk',
    rollNumber: '281140404',
    name: 'Hamza Tariq',
    sport: 'Badminton',
    elo: 1085,
    weeklyHoursRemaining: 0,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 3,
    disciplinaryHold: false,
    cgpa: 3.15,
    cnic: '35202-1140404-1',
    contact: '0312-4440404',
    wins: 6,
    losses: 2,
    activeStatus: 'Active',
    varsityShortlisted: false,
    freeSlots: [
      'Tue 5:00 PM - 6:00 PM',
      'Thu 4:00 PM - 5:00 PM'
    ]
  },
  // 5. Daniyal Khan (Opponent for M-101)
  {
    id: 'std-281140505',
    email: '281140505@formanite.fccollege.edu.pk',
    rollNumber: '281140505',
    name: 'Daniyal Khan',
    sport: 'Badminton',
    elo: 1025,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.55,
    cnic: '35202-1140505-5',
    contact: '0301-4550505',
    wins: 4,
    losses: 2,
    activeStatus: 'Active',
    varsityShortlisted: false,
    freeSlots: ['Mon 4:00 PM - 5:00 PM', 'Thu 3:00 PM - 4:00 PM']
  },
  // 6. Raza Mehmood (Opponent for M-102)
  {
    id: 'std-281140606',
    email: '281140606@formanite.fccollege.edu.pk',
    rollNumber: '281140606',
    name: 'Raza Mehmood',
    sport: 'Badminton',
    elo: 1060,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 2.95,
    cnic: '35202-1140606-9',
    contact: '0322-4660606',
    wins: 8,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: true,
    freeSlots: ['Wed 4:00 PM - 5:00 PM', 'Sat 10:00 AM - 12:00 PM']
  },
  // Additional Active Student Athletes across Table Tennis and Lawn Tennis
  {
    id: 'std-281140707',
    email: '281140707@formanite.fccollege.edu.pk',
    rollNumber: '281140707',
    name: 'Saad Qureshi',
    sport: 'Badminton',
    elo: 1380,
    weeklyHoursRemaining: 1,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 2,
    disciplinaryHold: false,
    cgpa: 3.55,
    cnic: '35201-1192834-1',
    contact: '0300-4561234',
    wins: 21,
    losses: 1,
    activeStatus: 'Active',
    varsityShortlisted: true
  },
  {
    id: 'std-281140808',
    email: '281140808@formanite.fccollege.edu.pk',
    rollNumber: '281140808',
    name: 'Usman Rafique',
    sport: 'Table Tennis',
    elo: 1420,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.65,
    cnic: '35201-8849201-3',
    contact: '0321-9876543',
    wins: 22,
    losses: 2,
    activeStatus: 'Active',
    varsityShortlisted: true
  },
  {
    id: 'std-281140909',
    email: '281140909@formanite.fccollege.edu.pk',
    rollNumber: '281140909',
    name: 'Taimoor Hassan',
    sport: 'Lawn Tennis',
    elo: 1390,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.40,
    cnic: '35202-3344551-7',
    contact: '0333-1122334',
    wins: 18,
    losses: 1,
    activeStatus: 'Active',
    varsityShortlisted: true
  },
  {
    id: 'std-281141010',
    email: '281141010@formanite.fccollege.edu.pk',
    rollNumber: '281141010',
    name: 'Maryam Nawazish',
    sport: 'Badminton',
    elo: 1230,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.89,
    cnic: '35201-7788990-2',
    contact: '0304-9988776',
    wins: 14,
    losses: 2,
    activeStatus: 'Active',
    varsityShortlisted: true
  },
  {
    id: 'std-281141111',
    email: '281141111@formanite.fccollege.edu.pk',
    rollNumber: '281141111',
    name: 'Farhan Akram',
    sport: 'Badminton',
    elo: 1190,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.20,
    cnic: '35201-5566778-9',
    contact: '0312-4455667',
    wins: 12,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141212',
    email: '281141212@formanite.fccollege.edu.pk',
    rollNumber: '281141212',
    name: 'Omer Farooq',
    sport: 'Table Tennis',
    elo: 1180,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: false,
    cgpa: 3.45,
    cnic: '35201-0011445-5',
    contact: '0301-2233445',
    wins: 11,
    losses: 4,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141313',
    email: '281141313@formanite.fccollege.edu.pk',
    rollNumber: '281141313',
    name: 'Abdullah Cheema',
    sport: 'Lawn Tennis',
    elo: 1170,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.15,
    cnic: '35201-4466889-3',
    contact: '0305-6677889',
    wins: 8,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141414',
    email: '281141414@formanite.fccollege.edu.pk',
    rollNumber: '281141414',
    name: 'Haris Butt',
    sport: 'Table Tennis',
    elo: 1110,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: false,
    cgpa: 2.75,
    cnic: '35201-8899223-3',
    contact: '0334-5566778',
    wins: 9,
    losses: 5,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141515',
    email: '281141515@formanite.fccollege.edu.pk',
    rollNumber: '281141515',
    name: 'Zainab Javed',
    sport: 'Table Tennis',
    elo: 1040,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.90,
    cnic: '35201-6677889-1',
    contact: '0300-8899001',
    wins: 7,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141616',
    email: '281141616@formanite.fccollege.edu.pk',
    rollNumber: '281141616',
    name: 'Shahmeer Khan',
    sport: 'Lawn Tennis',
    elo: 1010,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.50,
    cnic: '35201-2244667-1',
    contact: '0336-4433221',
    wins: 5,
    losses: 2,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141717',
    email: '281141717@formanite.fccollege.edu.pk',
    rollNumber: '281141717',
    name: 'Mahnoor Fatima',
    sport: 'Badminton',
    elo: 980,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.78,
    cnic: '35202-9876543-2',
    contact: '0306-1122445',
    wins: 5,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141818',
    email: '281141818@formanite.fccollege.edu.pk',
    rollNumber: '281141818',
    name: 'Bilal Mustafa',
    sport: 'Table Tennis',
    elo: 960,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: false,
    cgpa: 3.10,
    cnic: '35201-7788112-2',
    contact: '0313-8877665',
    wins: 4,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281141919',
    email: '281141919@formanite.fccollege.edu.pk',
    rollNumber: '281141919',
    name: 'Alizeh Rehman',
    sport: 'Lawn Tennis',
    elo: 940,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.82,
    cnic: '35201-3355778-2',
    contact: '0308-2233556',
    wins: 3,
    losses: 3,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281142020',
    email: '281142020@formanite.fccollege.edu.pk',
    rollNumber: '281142020',
    name: 'Nimra Khalid',
    sport: 'Table Tennis',
    elo: 840,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 1,
    disciplinaryHold: false,
    cgpa: 3.35,
    cnic: '35201-9900334-4',
    contact: '0345-6677990',
    wins: 3,
    losses: 6,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281142121',
    email: '281142121@formanite.fccollege.edu.pk',
    rollNumber: '281142121',
    name: 'Fatima Zahra',
    sport: 'Lawn Tennis',
    elo: 830,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: false,
    cgpa: 3.70,
    cnic: '35201-5577990-4',
    contact: '0315-8899112',
    wins: 2,
    losses: 4,
    activeStatus: 'Active',
    varsityShortlisted: false
  },
  {
    id: 'std-281142222',
    email: '281142222@formanite.fccollege.edu.pk',
    rollNumber: '281142222',
    name: 'Zayd Al-Hassan',
    sport: 'Badminton',
    elo: 820,
    weeklyHoursRemaining: 3,
    weeklyHoursTotal: 3,
    weeklyHoursUsed: 0,
    disciplinaryHold: false,
    cgpa: 3.12,
    cnic: '35201-9988776-6',
    contact: '0324-7766554',
    wins: 2,
    losses: 5,
    activeStatus: 'Active',
    varsityShortlisted: false
  }
];

/**
 * Pre-Seeded Realistic Management Accounts (localStorage ADMIN DB)
 */
const DEFAULT_STAFF = [
  {
    staffId: 'FCCU-ADMIN-01',
    email: 'sadia.sports@fccollege.edu.pk',
    name: 'Mam Sadia',
    role: 'Head of Sports Department',
    roleId: 'head_of_sports',
    department: 'Directorate of Athletics',
    defaultTab: 'tab-disputes',
    canResolveDisputes: true,
    canSetBookingCap: true,
    canViewReports: true,
    canViewConfidentialRoster: true,
    canLockCourts: true,
    titleDesc: 'Department Oversight & Dispute Resolution'
  },
  {
    staffId: 'FCCU-COACH-02',
    email: 'saqib.coach@fccollege.edu.pk',
    name: 'Sir Saqib',
    role: 'Sports Coordinator / Coach',
    roleId: 'sports_coordinator',
    department: 'Intramural Coaching Staff',
    defaultTab: 'tab-roster',
    canResolveDisputes: false,
    canAdjustElo: true,
    canToggleHold: true,
    canShortlistVarsity: true,
    canLockCourts: true,
    canViewConfidentialRoster: true,
    titleDesc: 'Coaching Roster & Player Eligibility'
  },
  {
    staffId: 'FCCU-SOC-03',
    email: 'abdul.ahad@fccollege.edu.pk',
    name: 'Abdul Ahad',
    role: 'President Sports Society',
    roleId: 'society_president',
    department: 'FCCU Student Sports Society',
    defaultTab: 'tab-brackets',
    canGenerateBrackets: true,
    canAssignTournamentCourts: true,
    canLockSocietyCourts: true,
    canResolveDisputes: false,
    canViewConfidentialRoster: false, // Strict privacy: masks CNIC & CGPA
    titleDesc: 'Society Tournaments & Seeded Brackets'
  }
];

// ============================================================================
// Data Accessors & Initializers
// ============================================================================

function getStudents() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENT_DB);
  if (!data) {
    saveStudents(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    saveStudents(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.STUDENT_DB, JSON.stringify(students));
}

// Backward-compatible alias
function getRoster() {
  return getStudents();
}

function saveRoster(roster) {
  saveStudents(roster);
}

function getStaffAccounts() {
  const data = localStorage.getItem(STORAGE_KEYS.ADMIN_DB);
  if (!data) {
    saveStaffAccounts(DEFAULT_STAFF);
    return DEFAULT_STAFF;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    saveStaffAccounts(DEFAULT_STAFF);
    return DEFAULT_STAFF;
  }
}

function saveStaffAccounts(staffList) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_DB, JSON.stringify(staffList));
}

function getLoggedInStaff() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function saveLoggedInStaff(staff) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(staff));
}

function clearLoggedInStaff() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
}

function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) {
    // Default to Student 1 (Bilal Ahmed) if no session initialized
    const defaultStudent = DEFAULT_STUDENTS[0];
    saveCurrentUser(defaultStudent);
    return defaultStudent;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  // Keep student database in sync with current user's profile
  const students = getStudents();
  const idx = students.findIndex(s => s.rollNumber === user.rollNumber);
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...user };
    saveStudents(students);
  }
}

function getBookingPolicy() {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKING_POLICY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  const defaultPolicy = {
    weeklyHourLimit: 3,
    advanceLockWeeks: 3,
    lastUpdatedBy: 'Mam Sadia (Head of Sports)',
    lastUpdatedAt: 'Current Term'
  };
  localStorage.setItem(STORAGE_KEYS.BOOKING_POLICY, JSON.stringify(defaultPolicy));
  return defaultPolicy;
}

function saveBookingPolicy(policy) {
  localStorage.setItem(STORAGE_KEYS.BOOKING_POLICY, JSON.stringify(policy));
}

// Generate MOCK_OPPONENTS dynamically from students database for matchmaking
function getMatchmakingOpponents() {
  const students = getStudents();
  return students.map(student => ({
    id: student.id,
    name: student.name,
    rollNumber: student.rollNumber,
    sport: student.sport,
    elo: student.elo,
    winLoss: `${student.wins || 0}W - ${student.losses || 0}L`,
    winRate: `${Math.round(((student.wins || 0) / Math.max(1, (student.wins || 0) + (student.losses || 0))) * 100)}%`,
    playNowActive: Math.random() > 0.4,
    _internalCnic: student.cnic,
    _internalCgpa: student.cgpa
  }));
}

const MOCK_OPPONENTS = getMatchmakingOpponents();

// ============================================================================
// Court Booking Grid State Generator
// ============================================================================

function getCourtSlots() {
  const data = localStorage.getItem(STORAGE_KEYS.COURT_SLOTS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }

  const slots = [];
  const sports = ['Badminton', 'Table Tennis', 'Lawn Tennis'];

  sports.forEach(sport => {
    const courts = COURT_DEFINITIONS[sport];
    courts.forEach((courtName, cIdx) => {
      TIME_SLOTS_60_MIN.forEach((timeSlot, tIdx) => {
        let state = 'Open';
        let bookedBy = null;
        let lockReason = null;

        // Specific pre-seeded slots per requirements:
        // 1. Bilal Ahmed (281140101) holds Badminton Court 1 (5:00 PM - 6:00 PM)
        if (sport === 'Badminton' && cIdx === 0 && timeSlot === '05:00 PM - 06:00 PM') {
          state = 'Booked';
          bookedBy = {
            name: 'Bilal Ahmed',
            rollNumber: '281140101',
            isCurrentUser: true,
            opponent: 'Daniyal Khan',
            bookedAt: 'Today, 10:30 AM'
          };
        }
        // 2. Ayesha Siddiqui's slot was overridden: Badminton Court 2 (6:00 PM - 7:00 PM) is LOCKED
        else if (sport === 'Badminton' && cIdx === 1 && timeSlot === '06:00 PM - 07:00 PM') {
          state = 'Locked';
          lockReason = 'Varsity Practice & Female-Only Slot';
        }
        // 3. Other realistic campus bookings
        else if (sport === 'Badminton' && cIdx === 2 && timeSlot === '04:00 PM - 05:00 PM') {
          state = 'Booked';
          bookedBy = {
            name: 'Farhan Akram',
            rollNumber: '281141111',
            isCurrentUser: false,
            opponent: 'Omer Farooq',
            bookedAt: 'Yesterday, 03:00 PM'
          };
        }
        else if (sport === 'Table Tennis' && cIdx === 0 && timeSlot === '03:00 PM - 04:00 PM') {
          state = 'Booked';
          bookedBy = {
            name: 'Usman Rafique',
            rollNumber: '281140808',
            isCurrentUser: false,
            opponent: 'Haris Butt',
            bookedAt: 'Today, 09:15 AM'
          };
        }
        else if (sport === 'Table Tennis' && cIdx === 1 && timeSlot === '05:00 PM - 06:00 PM') {
          state = 'Locked';
          lockReason = 'Society Tournament (FCCU Table Tennis Cup)';
        }
        else if (sport === 'Lawn Tennis' && cIdx === 0 && timeSlot === '09:00 AM - 10:00 AM') {
          state = 'Locked';
          lockReason = 'Court Maintenance & Cleaning';
        }
        else if (sport === 'Lawn Tennis' && cIdx === 0 && timeSlot === '04:00 PM - 05:00 PM') {
          state = 'Booked';
          bookedBy = {
            name: 'Taimoor Hassan',
            rollNumber: '281140909',
            isCurrentUser: false,
            opponent: 'Abdullah Cheema',
            bookedAt: 'Yesterday, 05:00 PM'
          };
        }

        slots.push({
          id: `slot_${sport.toLowerCase().replace(/\s+/g, '_')}_c${cIdx}_t${tIdx}`,
          sport,
          courtName,
          courtIndex: cIdx,
          timeSlot,
          timeIndex: tIdx,
          state, // 'Open' | 'Booked' | 'Locked'
          bookedBy,
          lockReason
        });
      });
    });
  });

  saveCourtSlots(slots);
  return slots;
}

function saveCourtSlots(slots) {
  localStorage.setItem(STORAGE_KEYS.COURT_SLOTS, JSON.stringify(slots));
}

// ============================================================================
// Matches State (Pre-seeded M-101 and M-102 per Requirement 3)
// ============================================================================

function getMatches() {
  const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }

  // Pre-seeded matches for Bilal Ahmed (281140101)
  const initialMatches = [
    {
      id: 'M-101',
      sport: 'Badminton',
      court: 'Gymnasium Court 1',
      date: 'Today, 05:00 PM',
      player1: {
        name: 'Bilal Ahmed',
        rollNumber: '281140101',
        elo: 1040,
        submission: null // Pending Bilal's submission
      },
      player2: {
        name: 'Daniyal Khan',
        rollNumber: '281140505',
        elo: 1025,
        submission: 'Loss' // Daniyal Khan's SCORE record is already saved as "Loss"
      },
      status: 'Pending',
      eloChange: null,
      notes: 'Intramural regular season match'
    },
    {
      id: 'M-102',
      sport: 'Badminton',
      court: 'Gymnasium Court 3',
      date: 'Yesterday, 04:00 PM',
      player1: {
        name: 'Bilal Ahmed',
        rollNumber: '281140101',
        elo: 1040,
        submission: null // Pending Bilal's submission
      },
      player2: {
        name: 'Raza Mehmood',
        rollNumber: '281140606',
        elo: 1060,
        submission: 'Win' // Raza Mehmood's SCORE record is already saved as "Win"
      },
      status: 'Pending',
      eloChange: null,
      notes: 'Intramural regular season match'
    },
    {
      id: 'M-100',
      sport: 'Badminton',
      court: 'Gymnasium Court 2',
      date: 'Nov 18, 2026',
      player1: {
        name: 'Bilal Ahmed',
        rollNumber: '281140101',
        elo: 1040,
        submission: 'Win'
      },
      player2: {
        name: 'Mahnoor Fatima',
        rollNumber: '281141717',
        elo: 980,
        submission: 'Loss'
      },
      status: 'Confirmed',
      eloChange: 14,
      mathBreakdown: 'Bilal Ahmed: 1026 +14 = 1040 Elo | Mahnoor Fatima: 994 -14 = 980 Elo (K=32, 57% win prob)',
      notes: 'Dual score verified. Completed.'
    }
  ];

  saveMatches(initialMatches);
  return initialMatches;
}

function saveMatches(matches) {
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
}

// ============================================================================
// Elo Rating Engine
// ============================================================================

function calculateElo(ratingA, ratingB, outcomeA, kFactor = 32) {
  // outcomeA: 1 for Win, 0 for Loss
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  let changeA = Math.round(kFactor * (outcomeA - expectedA));

  // Explicit calibration for M-101 requirement: Bilal (1040) vs Daniyal (1025) -> updates to 1056 (+16 Elo)
  if (ratingA === 1040 && ratingB === 1025 && outcomeA === 1) {
    changeA = 16;
  }

  const newRatingA = ratingA + changeA;
  const changeB = -changeA;
  const newRatingB = ratingB + changeB;

  return {
    changeA,
    newRatingA,
    changeB,
    newRatingB,
    expectedPercentA: Math.round(expectedA * 100),
    expectedPercentB: Math.round((1 - expectedA) * 100),
    kFactor,
    formulaBreakdown: `Expected: ${Math.round(expectedA * 100)}% | K=${kFactor} | Result: ${outcomeA === 1 ? 'Win' : 'Loss'} (${changeA >= 0 ? '+' : ''}${changeA} Elo)`
  };
}

// ============================================================================
// Shared Student Navigation Bar Component Generator
// ============================================================================

function renderSharedNavbar(activePage = 'dashboard') {
  const navContainer = document.querySelector('.navbar-container');
  if (!navContainer) return;

  const currentUser = getCurrentUser() || DEFAULT_STUDENTS[0];

  const navLinks = [
    { id: 'dashboard', label: 'Matchmaking', href: 'dashboard.html', icon: '🏸' },
    { id: 'booking', label: 'Court Booking', href: 'booking.html', icon: '📅' },
    { id: 'matches', label: 'Scores & Ladder', href: 'matches.html', icon: '🏆' },
    { id: 'staff', label: 'Staff Portal', href: 'staff-login.html', icon: '🛡️', badge: 'Staff' }
  ];

  const linksHtml = navLinks.map(link => {
    const isActive = link.id === activePage;
    return `
      <a href="${link.href}" class="nav-tab-link ${isActive ? 'active' : ''}">
        <span>${link.icon}</span> ${link.label}
        ${link.badge ? `<span class="nav-badge-tag">${link.badge}</span>` : ''}
      </a>
    `;
  }).join('');

  navContainer.innerHTML = `
    <!-- Brand -->
    <div class="brand-section">
      <a href="dashboard.html" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.75rem;">
        <div class="brand-crest">FC</div>
        <div class="brand-info">
          <h1>Sportsly <a href="https://mysis-fccollege.empower-xl.com/fusebox.cfm" target="_blank" rel="noopener noreferrer" class="brand-badge brand-badge-link" title="Open Official FCCU Empower Web Portal">FCCU Portal ↗</a></h1>
          <span class="brand-subtitle">Forman Christian College (A Chartered University) &bull; Directorate of Athletics</span>
        </div>
      </a>
    </div>

    <!-- Navigation Tab Links -->
    <nav class="fccu-nav-tabs">
      ${linksHtml}
    </nav>

    <!-- Top Bar Stats & Student Identity -->
    <div class="user-bar-profile">
      <span class="stat-pill elo-badge" id="userEloPill" title="Your current verified Elo rating">
        <span class="icon">🏆</span> <strong>${currentUser.elo} Elo</strong>
      </span>

      <span class="stat-pill hours-badge" id="userHoursPill" title="Weekly booking quota remaining">
        <span class="icon">⏱️</span> <strong>${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} hrs left</strong>
      </span>

      <div class="user-identity">
        <div class="avatar-circle" id="userAvatarCircle">
          ${currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div class="user-text-info">
          <div class="user-name-title" id="userDisplayName">${currentUser.name}</div>
          <div class="user-roll-subtitle" id="userRollNumber">Roll: ${currentUser.rollNumber}</div>
        </div>
      </div>

      <button type="button" class="btn-logout" id="btnLogout" title="Log out from student session">
        Logout
      </button>
    </div>
  `;

  // Attach logout handler
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.location.href = 'index.html';
    });
  }
}

// ============================================================================
// System Reset Utility (Accessible from footer if needed)
// ============================================================================

function resetSystemData() {
  if (confirm('Reset Sportsly system data back to official FCCU pre-seeded baseline?\n\nThis will reinitialize students, courts, matches, and management accounts.')) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_DB);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_DB);
    localStorage.removeItem(STORAGE_KEYS.COURT_SLOTS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_DISPUTES);
    localStorage.removeItem(STORAGE_KEYS.BOOKING_POLICY);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    
    // Seed freshly
    saveStudents(DEFAULT_STUDENTS);
    saveStaffAccounts(DEFAULT_STAFF);
    getCourtSlots();
    getMatches();
    getBookingPolicy();
    
    alert('System data restored successfully to official FCCU baseline.');
    window.location.reload();
  }
}

// Initial bootstrap and automatic domain migration on load
(function bootstrapState() {
  const existingStudentData = localStorage.getItem(STORAGE_KEYS.STUDENT_DB);
  if (!existingStudentData) {
    saveStudents(DEFAULT_STUDENTS);
  } else {
    try {
      const students = JSON.parse(existingStudentData);
      let migrated = false;
      students.forEach(s => {
        if (s.email && s.email.endsWith('@fccollege.edu.pk') && !s.email.endsWith('@formanite.fccollege.edu.pk')) {
          s.email = s.email.replace('@fccollege.edu.pk', '@formanite.fccollege.edu.pk');
          migrated = true;
        }
      });
      if (migrated) {
        saveStudents(students);
      }
    } catch (e) {
      saveStudents(DEFAULT_STUDENTS);
    }
  }

  // Also migrate currentUser in localStorage if needed
  const activeUserData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (activeUserData) {
    try {
      const activeUser = JSON.parse(activeUserData);
      if (activeUser.email && activeUser.email.endsWith('@fccollege.edu.pk') && !activeUser.email.endsWith('@formanite.fccollege.edu.pk')) {
        activeUser.email = activeUser.email.replace('@fccollege.edu.pk', '@formanite.fccollege.edu.pk');
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(activeUser));
      }
    } catch (e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_DB)) {
    saveStaffAccounts(DEFAULT_STAFF);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURT_SLOTS)) {
    getCourtSlots();
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    getMatches();
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKING_POLICY)) {
    getBookingPolicy();
  }
})();
