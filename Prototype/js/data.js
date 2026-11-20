/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU)
 * Central Data Store, State Schema & Elo Engine (Shared across Chunks 1, 2, and 3)
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'sportsly_user',
  CHAT_HISTORY: 'sportsly_chats',
  AVAILABILITY: 'sportsly_availability',
  COURT_SLOTS: 'sportsly_court_slots',
  MATCHES: 'sportsly_matches',
  ADMIN_DISPUTES: 'sportsly_flagged_disputes',
  ROSTER: 'sportsly_roster',
  TOURNAMENT: 'sportsly_tournament'
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
 * Full FCCU Student Athlete Roster
 * NOTE ON PRIVACY ARCHITECTURE:
 * Public views (Opponent Cards in Chunk 1, Leaderboard in Chunk 2) STRICTLY display ONLY:
 * Rank, Name, Roll No, Sport, Elo, and Win/Loss record.
 * Confidential fields (CNIC, CGPA, Disciplinary Holds) are RESTRICTED and ONLY accessible
 * to coaches and authorized athletic admins in Chunk 3 (admin.html Tab 3).
 */
const DEFAULT_ROSTER = [
  {
    id: 'fccu-01',
    name: 'Saad Qureshi',
    rollNumber: '231019201',
    sport: 'Badminton',
    elo: 1380,
    wins: 21,
    losses: 1,
    cnic: '35201-1192834-1',
    contact: '+92 300 4561234',
    cgpa: 3.55,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: true
  },
  {
    id: 'fccu-02',
    name: 'Usman Rafique',
    rollNumber: '231084920',
    sport: 'Table Tennis',
    elo: 1420,
    wins: 22,
    losses: 2,
    cnic: '35201-8849201-3',
    contact: '+92 321 9876543',
    cgpa: 3.65,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: true
  },
  {
    id: 'fccu-03',
    name: 'Taimoor Hassan',
    rollNumber: '241077291',
    sport: 'Lawn Tennis',
    elo: 1390,
    wins: 18,
    losses: 1,
    cnic: '35202-3344551-7',
    contact: '+92 333 1122334',
    cgpa: 3.40,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: true
  },
  {
    id: 'fccu-04',
    name: 'Maryam Nawazish',
    rollNumber: '241038491',
    sport: 'Badminton',
    elo: 1230,
    wins: 14,
    losses: 2,
    cnic: '35201-7788990-2',
    contact: '+92 304 9988776',
    cgpa: 3.89,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: true
  },
  {
    id: 'fccu-05',
    name: 'Farhan Akram',
    rollNumber: '241088492',
    sport: 'Badminton',
    elo: 1190,
    wins: 12,
    losses: 3,
    cnic: '35201-5566778-9',
    contact: '+92 312 4455667',
    cgpa: 3.20,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-06',
    name: 'Omer Farooq',
    rollNumber: '251029384',
    sport: 'Table Tennis',
    elo: 1180,
    wins: 11,
    losses: 4,
    cnic: '35201-0011445-5',
    contact: '+92 301 2233445',
    cgpa: 3.45,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-07',
    name: 'Abdullah Cheema',
    rollNumber: '251048291',
    sport: 'Lawn Tennis',
    elo: 1170,
    wins: 8,
    losses: 3,
    cnic: '35201-4466889-3',
    contact: '+92 305 6677889',
    cgpa: 3.15,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-08',
    name: 'Haris Butt',
    rollNumber: '241099231',
    sport: 'Table Tennis',
    elo: 1110,
    wins: 9,
    losses: 5,
    cnic: '35201-8899223-3',
    contact: '+92 334 5566778',
    cgpa: 2.75,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-09',
    name: 'Daniyal Shah',
    rollNumber: '251039482',
    sport: 'Badminton',
    elo: 1090,
    wins: 8,
    losses: 4,
    cnic: '35201-4455667-3',
    contact: '+92 322 3344556',
    cgpa: 2.95,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-10',
    name: 'Zainab Javed',
    rollNumber: '251049281',
    sport: 'Table Tennis',
    elo: 1040,
    wins: 7,
    losses: 3,
    cnic: '35201-6677889-1',
    contact: '+92 300 8899001',
    cgpa: 3.90,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-11',
    name: 'Hamza Tariq',
    rollNumber: '251019283',
    sport: 'Badminton',
    elo: 1020,
    wins: 6,
    losses: 2,
    cnic: '35201-1234567-1',
    contact: '+92 302 7788990',
    cgpa: 3.42,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-12',
    name: 'Shahmeer Khan',
    rollNumber: '251092819',
    sport: 'Lawn Tennis',
    elo: 1010,
    wins: 5,
    losses: 2,
    cnic: '35201-2244667-1',
    contact: '+92 336 4433221',
    cgpa: 3.50,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-13',
    name: 'Muhammad Bilal', // Current demo logged-in student
    rollNumber: '251084912',
    sport: 'Badminton',
    elo: 1000,
    wins: 3,
    losses: 1,
    cnic: '35201-9988221-5',
    contact: '+92 323 5544332',
    cgpa: 3.30,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-14',
    name: 'Mahnoor Fatima',
    rollNumber: '251084729',
    sport: 'Badminton',
    elo: 980,
    wins: 5,
    losses: 3,
    cnic: '35202-9876543-2',
    contact: '+92 306 1122445',
    cgpa: 3.78,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-15',
    name: 'Bilal Mustafa',
    rollNumber: '251093847',
    sport: 'Table Tennis',
    elo: 960,
    wins: 4,
    losses: 3,
    cnic: '35201-7788112-2',
    contact: '+92 313 8877665',
    cgpa: 3.10,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-16',
    name: 'Alizeh Rehman',
    rollNumber: '251074829',
    sport: 'Lawn Tennis',
    elo: 940,
    wins: 3,
    losses: 3,
    cnic: '35201-3355778-2',
    contact: '+92 308 2233556',
    cgpa: 3.82,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-17',
    name: 'Ayesha Siddiqui',
    rollNumber: '251094821',
    sport: 'Badminton',
    elo: 930,
    wins: 4,
    losses: 4,
    cnic: '35201-7788990-4',
    contact: '+92 331 4455778',
    cgpa: 3.61,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-18',
    name: 'Nimra Khalid',
    rollNumber: '251083920',
    sport: 'Table Tennis',
    elo: 840,
    wins: 3,
    losses: 6,
    cnic: '35201-9900334-4',
    contact: '+92 345 6677990',
    cgpa: 3.35,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-19',
    name: 'Fatima Zahra',
    rollNumber: '251092831',
    sport: 'Lawn Tennis',
    elo: 830,
    wins: 2,
    losses: 4,
    cnic: '35201-5577990-4',
    contact: '+92 315 8899112',
    cgpa: 3.70,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-20',
    name: 'Zayd Al-Hassan',
    rollNumber: '251064829',
    sport: 'Badminton',
    elo: 820,
    wins: 2,
    losses: 5,
    cnic: '35201-9988776-6',
    contact: '+92 324 7766554',
    cgpa: 3.12,
    activeStatus: 'Active',
    disciplinaryHold: false,
    varsityShortlisted: false
  },
  {
    id: 'fccu-21',
    name: 'Talha Sheikh',
    rollNumber: '251083721',
    sport: 'Badminton',
    elo: 640,
    wins: 1,
    losses: 7,
    cnic: '35201-3344556-9',
    contact: '+92 335 1199882',
    cgpa: 2.80,
    activeStatus: 'Active',
    disciplinaryHold: true, // Example student with Disciplinary Hold
    varsityShortlisted: false
  }
];

// Re-map MOCK_OPPONENTS to match roster
const MOCK_OPPONENTS = DEFAULT_ROSTER.map(student => ({
  id: student.id,
  name: student.name,
  sport: student.sport,
  elo: student.elo,
  winLoss: `${student.wins}W - ${student.losses}L`,
  winRate: `${Math.round((student.wins / Math.max(1, student.wins + student.losses)) * 100)}%`,
  playNowActive: Math.random() > 0.5,
  _internalCnic: student.cnic,
  _internalCgpa: student.cgpa
}));

// ============================================================================
// State Accessors & Initializers
// ============================================================================

function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  // Keep roster in sync with current user's Elo, name, etc.
  const roster = getRoster();
  const idx = roster.findIndex(s => s.rollNumber === user.rollNumber);
  if (idx !== -1) {
    roster[idx].elo = user.elo;
    roster[idx].name = user.name;
    roster[idx].sport = user.selectedSport || roster[idx].sport;
    saveRoster(roster);
  }
}

function getRoster() {
  const data = localStorage.getItem(STORAGE_KEYS.ROSTER);
  if (!data) {
    saveRoster(DEFAULT_ROSTER);
    return DEFAULT_ROSTER;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    saveRoster(DEFAULT_ROSTER);
    return DEFAULT_ROSTER;
  }
}

function saveRoster(roster) {
  localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster));
}

// ============================================================================
// Court Booking Grid State Generator (Chunk 2)
// ============================================================================

function getCourtSlots() {
  const data = localStorage.getItem(STORAGE_KEYS.COURT_SLOTS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Fallback to generator
    }
  }

  // Generate initial slots matching UML states: "Open", "Booked", "Locked"
  const slots = [];
  const sports = ['Badminton', 'Table Tennis', 'Lawn Tennis'];

  sports.forEach(sport => {
    const courts = COURT_DEFINITIONS[sport];
    courts.forEach((courtName, cIdx) => {
      TIME_SLOTS_60_MIN.forEach((timeSlot, tIdx) => {
        let state = 'Open';
        let bookedBy = null;
        let lockReason = null;

        // Controlled seed to make grid look realistic & demonstrate all 3 UML states:
        // 1. One slot booked by the current student for "Cancel Booking" test
        if (sport === 'Badminton' && cIdx === 0 && tIdx === 3) {
          state = 'Booked';
          bookedBy = {
            name: 'Muhammad Bilal',
            rollNumber: '251084912',
            isCurrentUser: true,
            opponent: 'Hamza Tariq',
            bookedAt: 'Today, 10:15 AM'
          };
        }
        // 2. Some slots booked by other FCCU students (Amber)
        else if ((cIdx === 1 && tIdx === 1) || (cIdx === 0 && tIdx === 5) || (cIdx === 2 && tIdx === 4)) {
          state = 'Booked';
          bookedBy = {
            name: 'Mahnoor Fatima',
            rollNumber: '251084729',
            isCurrentUser: false,
            opponent: 'Daniyal Shah',
            bookedAt: 'Yesterday, 04:00 PM'
          };
        }
        // 3. Some slots locked by Admin / Coach (Red)
        else if (cIdx === 3 && (tIdx === 6 || tIdx === 7)) {
          state = 'Locked';
          lockReason = 'Team Practice (Varsity Squad)';
        } else if (cIdx === 1 && tIdx === 7) {
          state = 'Locked';
          lockReason = 'Female-Only Dedicated Hours';
        } else if (sport === 'Lawn Tennis' && cIdx === 0 && tIdx === 0) {
          state = 'Locked';
          lockReason = 'Court Maintenance';
        }

        slots.push({
          id: `slot_${sport.toLowerCase().replace(/\s+/g, '_')}_c${cIdx}_t${tIdx}`,
          sport,
          courtName,
          courtIndex: cIdx,
          timeSlot,
          timeIndex: tIdx,
          state, // "Open" | "Booked" | "Locked"
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
// Matches & Dual Score Confirmation State (Chunk 2)
// ============================================================================

function getMatches() {
  const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Fallback
    }
  }

  // Seed user's initial matches illustrating all UML states:
  // "Pending", "Confirmed" (Completed), "Flagged", "Voided"
  const initialMatches = [
    {
      id: 'match-101',
      sport: 'Badminton',
      court: 'Gymnasium Court 2',
      date: 'Today, 04:00 PM',
      player1: {
        name: 'Muhammad Bilal',
        rollNumber: '251084912',
        elo: 1000,
        submission: null // Not submitted yet
      },
      player2: {
        name: 'Hamza Tariq',
        rollNumber: '251019283',
        elo: 1020,
        submission: null // Ready to simulate
      },
      status: 'Pending', // Pending dual confirmation
      eloChange: null,
      notes: 'Intramural regular season match'
    },
    {
      id: 'match-102',
      sport: 'Badminton',
      court: 'Gymnasium Court 1',
      date: 'Yesterday, 03:00 PM',
      player1: {
        name: 'Muhammad Bilal',
        rollNumber: '251084912',
        elo: 1000,
        submission: 'Win'
      },
      player2: {
        name: 'Daniyal Shah',
        rollNumber: '251039482',
        elo: 1090,
        submission: 'Win' // Conflicting score!
      },
      status: 'Flagged', // In dispute queue
      eloChange: 0,
      notes: 'Disputed: Both players claimed Win. Zero Elo deduction applied pending referee review.'
    },
    {
      id: 'match-103',
      sport: 'Badminton',
      court: 'Gymnasium Court 3',
      date: 'Nov 17, 2026',
      player1: {
        name: 'Muhammad Bilal',
        rollNumber: '251084912',
        elo: 1000,
        submission: 'Win'
      },
      player2: {
        name: 'Mahnoor Fatima',
        rollNumber: '251084729',
        elo: 980,
        submission: 'Loss'
      },
      status: 'Confirmed', // Completed
      eloChange: 16,
      mathBreakdown: 'Player A (1000) vs Player B (980) → Expected: 53% | K=32 | Result: Win (+16 Elo)',
      notes: 'Dual score verified. Ratings adjusted.'
    }
  ];

  saveMatches(initialMatches);
  return initialMatches;
}

function saveMatches(matches) {
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
}

// ============================================================================
// Elo Rating Engine (Transparent Math & Formula Breakdown)
// ============================================================================

/**
 * Standard Elo Rating Formula:
 * E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 * New_R_A = R_A + K * (S_A - E_A)
 * where K = 32 for collegiate intramural athletics.
 */
function calculateElo(ratingA, ratingB, outcomeA, kFactor = 32) {
  // outcomeA: 1 for Win, 0 for Loss
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const changeA = Math.round(kFactor * (outcomeA - expectedA));
  const newRatingA = ratingA + changeA;

  // Player B's complementary outcome
  const expectedB = 1 - expectedA;
  const outcomeB = 1 - outcomeA;
  const changeB = Math.round(kFactor * (outcomeB - expectedB));
  const newRatingB = ratingB + changeB;

  return {
    changeA,
    newRatingA,
    changeB,
    newRatingB,
    expectedPercentA: Math.round(expectedA * 100),
    expectedPercentB: Math.round(expectedB * 100),
    kFactor,
    formulaBreakdown: `Expected: ${Math.round(expectedA * 100)}% | Δ: ${changeA >= 0 ? '+' : ''}${changeA} Elo (K=${kFactor})`
  };
}

// ============================================================================
// Shared Navigation Bar Component Generator
// Ensures seamless navigation across index.html, dashboard.html, booking.html, matches.html, admin.html
// ============================================================================

function renderSharedNavbar(activePage = 'dashboard') {
  const navContainer = document.querySelector('.navbar-container');
  if (!navContainer) return;

  const currentUser = getCurrentUser() || {
    name: 'Muhammad Bilal',
    rollNumber: '251084912',
    elo: 1000,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3
  };

  const navLinks = [
    { id: 'dashboard', label: 'Matchmaking', href: 'dashboard.html', icon: '🏸' },
    { id: 'booking', label: 'Court Booking', href: 'booking.html', icon: '📅' },
    { id: 'matches', label: 'Scores & Ladder', href: 'matches.html', icon: '🏆' },
    { id: 'admin', label: 'Coach / Admin', href: 'admin.html', icon: '🛡️', badge: 'Staff' }
  ];

  let linksHtml = navLinks.map(link => {
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
          <h1>Sportsly <span class="brand-badge">FCCU</span></h1>
          <span class="brand-subtitle">Forman Christian College &bull; Athletics Directorate</span>
        </div>
      </a>
    </div>

    <!-- Navigation Tab Links -->
    <nav class="fccu-nav-tabs">
      ${linksHtml}
    </nav>

    <!-- Top Bar Stats & Student Identity -->
    <div class="user-bar-profile">
      <span class="stat-pill elo-badge" id="userEloPill" title="Your current Elo rating">
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

      <button type="button" class="btn-logout" id="btnLogout" title="Switch profile or return to login">
        Logout
      </button>
    </div>
  `;

  // Attach logout handler
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}
