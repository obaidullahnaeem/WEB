/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Admin, Coach & Sports Directorate (Chunk 3)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Render shared navigation
  renderSharedNavbar('admin');

  let currentUser = getCurrentUser();

  // Active Admin Tab State
  let activeTabId = 'tab-courts'; // 'tab-courts' | 'tab-disputes' | 'tab-roster' | 'tab-brackets'
  let rosterSearchTerm = '';
  let bracketSport = 'Badminton';

  // DOM Elements - Tab Buttons & Panes
  const tabButtons = document.querySelectorAll('.btn-admin-tab');
  const tabPanes = document.querySelectorAll('.admin-tab-content');
  const toastContainer = document.getElementById('toastContainer');

  // DOM Elements - Tab 1: Court Locking
  const adminSportSelect = document.getElementById('adminSportSelect');
  const adminCourtSelect = document.getElementById('adminCourtSelect');
  const adminDateSelect = document.getElementById('adminDateSelect');
  const adminTimeSelect = document.getElementById('adminTimeSelect');
  const adminLockCategory = document.getElementById('adminLockCategory');
  const btnLockCourt = document.getElementById('btnLockCourt');
  const lockedCourtsList = document.getElementById('lockedCourtsList');

  // DOM Elements - Tab 2: Dispute Queue
  const disputeQueueList = document.getElementById('disputeQueueList');
  const disputeCountBadge = document.getElementById('disputeCountBadge');
  const btnSimulateDispute = document.getElementById('btnSimulateDispute');

  // DOM Elements - Tab 3: Restricted Roster
  const rosterSearchInput = document.getElementById('rosterSearchInput');
  const rosterTableBody = document.getElementById('rosterTableBody');
  const rosterTotalCount = document.getElementById('rosterTotalCount');

  // DOM Elements - Tab 4: Brackets & Usage Reports
  const bracketSportSelect = document.getElementById('bracketSportSelect');
  const btnGenerateBracket = document.getElementById('btnGenerateBracket');
  const bracketTreeContainer = document.getElementById('bracketTreeContainer');

  // ==========================================================================
  // Helper: Toast Notifications
  // ==========================================================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '⛔';

    toast.innerHTML = `
      <span style="font-size: 1.1rem; flex-shrink: 0;">${icon}</span>
      <div>${message}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ==========================================================================
  // Tab Switching Logic
  // ==========================================================================
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      activeTabId = targetTab;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      if (targetTab === 'tab-courts') renderLockedCourts();
      if (targetTab === 'tab-disputes') renderDisputeQueue();
      if (targetTab === 'tab-roster') renderRestrictedRoster();
      if (targetTab === 'tab-brackets') renderSeededBracket();
    });
  });

  // ==========================================================================
  // TAB 1: Court Blocking & Override Controls
  // ==========================================================================
  function initCourtLockForm() {
    if (!adminSportSelect || !adminCourtSelect) return;

    // Populate Courts dropdown based on sport
    function populateCourtOptions(sport) {
      adminCourtSelect.innerHTML = '';
      const courts = COURT_DEFINITIONS[sport] || [];
      courts.forEach((cName, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = cName;
        adminCourtSelect.appendChild(opt);
      });
    }

    populateCourtOptions(adminSportSelect.value);

    adminSportSelect.addEventListener('change', (e) => {
      populateCourtOptions(e.target.value);
    });

    // Populate 1-3 weeks ahead dates
    if (adminDateSelect) {
      adminDateSelect.innerHTML = '';
      const today = new Date();
      for (let w = 1; w <= 3; w++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + (w * 7));
        const opt = document.createElement('option');
        opt.value = futureDate.toISOString().split('T')[0];
        opt.textContent = `Week +${w}: ${futureDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        adminDateSelect.appendChild(opt);
      }
    }

    // Populate 60-min time slots
    if (adminTimeSelect) {
      adminTimeSelect.innerHTML = '';
      TIME_SLOTS_60_MIN.forEach((tStr, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = tStr;
        adminTimeSelect.appendChild(opt);
      });
    }

    // "Lock Court" Action with Overriding Conflict Check
    if (btnLockCourt) {
      btnLockCourt.addEventListener('click', () => {
        const sport = adminSportSelect.value;
        const courtIndex = parseInt(adminCourtSelect.value, 10);
        const timeIndex = parseInt(adminTimeSelect.value, 10);
        const lockCategory = adminLockCategory.value;
        const courtName = COURT_DEFINITIONS[sport][courtIndex];
        const timeSlot = TIME_SLOTS_60_MIN[timeIndex];

        const allSlots = getCourtSlots();
        const slot = allSlots.find(
          s => s.sport.toLowerCase() === sport.toLowerCase() &&
               s.courtIndex === courtIndex &&
               s.timeIndex === timeIndex
        );

        if (!slot) return;

        // Check for conflicting casual booking
        if (slot.state === 'Booked' && slot.bookedBy) {
          const studentName = slot.bookedBy.name || 'Student';
          const roll = slot.bookedBy.rollNumber || 'N/A';

          const proceedOverride = confirm(
            `⚠️ Conflicting casual booking found!\n\n${studentName} (Roll: ${roll}) currently holds this slot on ${courtName} at ${timeSlot}.\n\nOverride & Alert Student? This will cancel their reservation and restore their 1 weekly hour.`
          );

          if (!proceedOverride) return;

          // Override: Cancel booking & restore 1 weekly hour to student
          if (currentUser && currentUser.rollNumber === roll) {
            currentUser.weeklyHoursRemaining = Math.min(3, currentUser.weeklyHoursRemaining + 1);
            saveCurrentUser(currentUser);
          }

          showToast(`Casual booking by ${studentName} overridden. 1 weekly hour refunded.`, 'warning');
        }

        // Apply Administrative Lock
        slot.state = 'Locked';
        slot.lockReason = lockCategory;
        slot.bookedBy = null;
        saveCourtSlots(allSlots);

        renderLockedCourts();
        showToast(`Court Locked: ${courtName} set to [${lockCategory}] for ${timeSlot}.`, 'success');
      });
    }
  }

  function renderLockedCourts() {
    if (!lockedCourtsList) return;
    lockedCourtsList.innerHTML = '';

    const allSlots = getCourtSlots();
    const locked = allSlots.filter(s => s.state === 'Locked');

    if (locked.length === 0) {
      lockedCourtsList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No administrative locks active on campus courts.</p>`;
      return;
    }

    locked.forEach(slot => {
      const item = document.createElement('div');
      item.style.cssText = 'background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;';
      item.innerHTML = `
        <div>
          <span class="badge-state badge-locked" style="margin-right:0.4rem;">🔒 ${escapeHtml(slot.lockReason || 'Locked')}</span>
          <strong style="color:var(--fccu-navy);">${escapeHtml(slot.sport)}: ${escapeHtml(slot.courtName)}</strong>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-left:0.4rem;">(${escapeHtml(slot.timeSlot)})</span>
        </div>
        <button type="button" class="btn-demo-pill" style="color:#b91c1c; border-color:#fca5a5;" data-id="${slot.id}">
          Unlock Court
        </button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        slot.state = 'Open';
        slot.lockReason = null;
        saveCourtSlots(allSlots);
        renderLockedCourts();
        showToast(`${slot.courtName} unlocked and reopened for student booking.`, 'info');
      });

      lockedCourtsList.appendChild(item);
    });
  }

  // ==========================================================================
  // TAB 2: Flagged Score Dispute Queue
  // ==========================================================================
  function renderDisputeQueue() {
    if (!disputeQueueList) return;
    disputeQueueList.innerHTML = '';

    const matches = getMatches();
    const flagged = matches.filter(m => m.status === 'Flagged');

    if (disputeCountBadge) {
      disputeCountBadge.textContent = `${flagged.length} Dispute${flagged.length === 1 ? '' : 's'}`;
    }

    if (flagged.length === 0) {
      disputeQueueList.innerHTML = `
        <div class="empty-opponents-box">
          <div class="empty-icon">⚖️</div>
          <h3>Dispute Queue Clean</h3>
          <p>There are no flagged match disputes requiring referee arbitration.</p>
        </div>
      `;
      return;
    }

    flagged.forEach(match => {
      const card = document.createElement('div');
      card.className = 'dispute-item-card';

      card.innerHTML = `
        <div class="dispute-header-row">
          <div>
            <span class="badge-state badge-locked">🚩 Conflicting Scores</span>
            <strong style="color:var(--fccu-navy); font-size:1rem; margin-left:0.5rem;">${escapeHtml(match.sport)} &bull; ${escapeHtml(match.court)}</strong>
            <span style="font-size:0.8rem; color:var(--text-muted); margin-left:0.5rem;">(${escapeHtml(match.date)})</span>
          </div>
          <span style="font-size:0.75rem; color:#be123c; font-weight:700;">Zero Elo Deducted (Frozen)</span>
        </div>

        <div style="background:#ffffff; border-radius:var(--radius-sm); padding:0.75rem 1rem; border:1px solid #fecdd3; font-size:0.85rem; margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
            <span><strong>Player 1:</strong> ${escapeHtml(match.player1.name)} (${match.player1.elo} Elo) &bull; Submitted: <span style="color:#15803d; font-weight:700;">${escapeHtml(match.player1.submission || 'Win')}</span></span>
            <span>Roll: ${escapeHtml(match.player1.rollNumber)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span><strong>Player 2:</strong> ${escapeHtml(match.player2.name)} (${match.player2.elo} Elo) &bull; Submitted: <span style="color:#15803d; font-weight:700;">${escapeHtml(match.player2.submission || 'Win')}</span></span>
            <span>Roll: ${escapeHtml(match.player2.rollNumber)}</span>
          </div>
        </div>

        <div style="font-size:0.8rem; color:#7f1d1d; margin-bottom:0.75rem;">
          <strong>Referee Note:</strong> Both athletes claimed victory. As an Admin/Coach, review referee camera footage or intramural scorecards to declare the official winner or void without penalty.
        </div>

        <!-- Admin Resolution Actions -->
        <div class="dispute-actions-row">
          <button type="button" class="btn-resolve-win btn-resolve-p1" data-id="${match.id}">
            🏆 Confirm ${escapeHtml(match.player1.name.split(' ')[0])} as Winner
          </button>
          <button type="button" class="btn-resolve-win btn-resolve-p2" data-id="${match.id}">
            🏆 Confirm ${escapeHtml(match.player2.name.split(' ')[0])} as Winner
          </button>
          <button type="button" class="btn-resolve-void btn-void-match" data-id="${match.id}">
            ⚪ Void Match (No Penalty)
          </button>
        </div>
      `;

      // Resolution Listeners
      card.querySelector('.btn-resolve-p1').addEventListener('click', () => {
        resolveDispute(match.id, match.player1.name);
      });
      card.querySelector('.btn-resolve-p2').addEventListener('click', () => {
        resolveDispute(match.id, match.player2.name);
      });
      card.querySelector('.btn-void-match').addEventListener('click', () => {
        voidDispute(match.id);
      });

      disputeQueueList.appendChild(card);
    });
  }

  function resolveDispute(matchId, winnerName) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    match.status = 'Confirmed';
    const isP1Winner = winnerName === match.player1.name;
    const userOutcome = isP1Winner ? 1 : 0;

    const eloCalc = calculateElo(match.player1.elo, match.player2.elo, userOutcome, 32);

    match.eloChange = eloCalc.changeA;
    match.mathBreakdown = `Arbitrated by Sports Directorate: ${winnerName} declared winner. ${match.player1.name}: ${eloCalc.newRatingA} Elo | ${match.player2.name}: ${eloCalc.newRatingB} Elo`;
    match.notes = `Dispute Resolved by Coach: ${winnerName} verified.`;

    // Update roster ratings
    const roster = getRoster();
    const p1 = roster.find(r => r.rollNumber === match.player1.rollNumber);
    if (p1) {
      p1.elo = eloCalc.newRatingA;
      if (isP1Winner) p1.wins += 1;
      else p1.losses += 1;
    }
    const p2 = roster.find(r => r.rollNumber === match.player2.rollNumber);
    if (p2) {
      p2.elo = eloCalc.newRatingB;
      if (!isP1Winner) p2.wins += 1;
      else p2.losses += 1;
    }
    saveRoster(roster);

    // If current student was involved, update local session
    if (currentUser && currentUser.rollNumber === match.player1.rollNumber) {
      currentUser.elo = eloCalc.newRatingA;
      saveCurrentUser(currentUser);
    }

    saveMatches(matches);
    renderDisputeQueue();
    showToast(`Dispute resolved! ${winnerName} confirmed as winner and ratings adjusted.`, 'success');
  }

  function voidDispute(matchId) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    match.status = 'Voided';
    match.eloChange = 0;
    match.notes = 'Arbitrated by Sports Directorate: Match Voided. Zero Elo deduction applied.';

    saveMatches(matches);
    renderDisputeQueue();
    showToast('Match voided with zero Elo deduction.', 'info');
  }

  // Simulate new dispute button
  if (btnSimulateDispute) {
    btnSimulateDispute.addEventListener('click', () => {
      const matches = getMatches();
      matches.unshift({
        id: `match-dispute-${Date.now()}`,
        sport: 'Table Tennis',
        court: 'Arena Table 1',
        date: 'Today, 03:00 PM',
        player1: {
          name: currentUser ? currentUser.name : 'Muhammad Bilal',
          rollNumber: currentUser ? currentUser.rollNumber : '251084912',
          elo: currentUser ? currentUser.elo : 1000,
          submission: 'Win'
        },
        player2: {
          name: 'Zainab Javed',
          rollNumber: '251049281',
          elo: 1040,
          submission: 'Win'
        },
        status: 'Flagged',
        eloChange: 0,
        notes: 'Simulated score conflict: Both athletes claimed Win.'
      });
      saveMatches(matches);
      renderDisputeQueue();
      showToast('Simulated score dispute pushed to queue.', 'warning');
    });
  }

  // ==========================================================================
  // TAB 3: Student Roster & Manual Elo Adjustment (Restricted View)
  // ==========================================================================
  function initRosterControls() {
    if (rosterSearchInput) {
      rosterSearchInput.addEventListener('input', (e) => {
        rosterSearchTerm = e.target.value.toLowerCase().trim();
        renderRestrictedRoster();
      });
    }
  }

  function renderRestrictedRoster() {
    if (!rosterTableBody) return;
    rosterTableBody.innerHTML = '';

    const roster = getRoster();

    // Filter by search term
    const filtered = roster.filter(s => {
      const term = rosterSearchTerm;
      return (
        s.name.toLowerCase().includes(term) ||
        s.rollNumber.toLowerCase().includes(term) ||
        s.sport.toLowerCase().includes(term) ||
        (s.cnic && s.cnic.includes(term))
      );
    });

    if (rosterTotalCount) {
      rosterTotalCount.textContent = `${filtered.length} Students`;
    }

    filtered.forEach(athlete => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(athlete.name)}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(athlete.sport)}</div>
        </td>
        <td style="font-family:monospace; font-weight:600;">
          ${escapeHtml(athlete.rollNumber)}
        </td>
        <!-- RESTRICTED CONFIDENTIAL FIELDS (Coach / Admin Only) -->
        <td style="font-family:monospace; font-size:0.8rem; color:#991b1b;">
          ${escapeHtml(athlete.cnic || '35201-XXXXXXX-X')}
        </td>
        <td style="font-size:0.8rem; color:var(--text-secondary);">
          ${escapeHtml(athlete.contact || '+92 300 0000000')}
        </td>
        <td>
          <span style="font-weight:700; color:#0369a1;">${athlete.cgpa || 3.0}</span>
        </td>
        <td>
          <span class="quota-pill ${athlete.activeStatus === 'Active' ? 'available' : 'limit-reached'}" style="font-size:0.7rem; padding:0.15rem 0.5rem;">
            ${escapeHtml(athlete.activeStatus || 'Active')}
          </span>
        </td>
        <!-- Disciplinary Hold Toggle -->
        <td>
          <label style="display:inline-flex; align-items:center; gap:0.35rem; cursor:pointer;">
            <input type="checkbox" class="hold-toggle-input" data-id="${athlete.id}" ${athlete.disciplinaryHold ? 'checked' : ''} />
            <span style="font-size:0.75rem; font-weight:700; color:${athlete.disciplinaryHold ? '#b91c1c' : '#64748b'};">
              ${athlete.disciplinaryHold ? '⚠️ On Hold' : 'Clean'}
            </span>
          </label>
        </td>
        <!-- Elo Rank & Manual Adjustment -->
        <td>
          <div class="inline-elo-edit">
            <input type="number" class="inline-elo-input" value="${athlete.elo}" data-id="${athlete.id}" min="100" max="3000" />
            <button type="button" class="btn-elo-save" data-id="${athlete.id}" title="Save Adjusted Elo">
              Save
            </button>
          </div>
        </td>
        <!-- Shortlist for Varsity Trials Toggle Badge -->
        <td>
          <span class="varsity-badge ${athlete.varsityShortlisted ? 'shortlisted' : ''}" data-id="${athlete.id}" title="Click to toggle Varsity Shortlist">
            ${athlete.varsityShortlisted ? '⭐ Shortlisted' : '➕ Shortlist'}
          </span>
        </td>
      `;

      // Event listener for Disciplinary Hold toggle
      const holdBox = tr.querySelector('.hold-toggle-input');
      holdBox.addEventListener('change', (e) => {
        athlete.disciplinaryHold = e.target.checked;
        saveRoster(roster);
        renderRestrictedRoster();
        showToast(`Disciplinary Hold for ${athlete.name} set to ${athlete.disciplinaryHold ? 'ACTIVE (Login Blocked)' : 'CLEARED'}.`, athlete.disciplinaryHold ? 'warning' : 'success');
      });

      // Event listener for Manual Elo Adjustment
      const btnSaveElo = tr.querySelector('.btn-elo-save');
      const inputElo = tr.querySelector('.inline-elo-input');
      btnSaveElo.addEventListener('click', () => {
        const newElo = parseInt(inputElo.value, 10);
        if (isNaN(newElo) || newElo < 100 || newElo > 3000) {
          alert('Please enter a valid Elo rating between 100 and 3000.');
          return;
        }

        athlete.elo = newElo;
        saveRoster(roster);

        // If adjusting current user, sync session
        if (currentUser && currentUser.rollNumber === athlete.rollNumber) {
          currentUser.elo = newElo;
          saveCurrentUser(currentUser);
        }

        renderRestrictedRoster();
        showToast(`Rating for ${athlete.name} manually updated to ${newElo} Elo.`, 'success');
      });

      // Event listener for Varsity Shortlist toggle
      const varsityBadge = tr.querySelector('.varsity-badge');
      varsityBadge.addEventListener('click', () => {
        athlete.varsityShortlisted = !athlete.varsityShortlisted;
        saveRoster(roster);
        renderRestrictedRoster();
        showToast(
          athlete.varsityShortlisted 
            ? `⭐ ${athlete.name} shortlisted for FCCU Varsity Squad Trials!` 
            : `${athlete.name} removed from shortlist.`,
          'info'
        );
      });

      rosterTableBody.appendChild(tr);
    });
  }

  // ==========================================================================
  // TAB 4: Elo Tournament Bracket Generator & Usage Reports
  // ==========================================================================
  function initBracketControls() {
    if (bracketSportSelect) {
      bracketSportSelect.addEventListener('change', (e) => {
        bracketSport = e.target.value;
      });
    }

    if (btnGenerateBracket) {
      btnGenerateBracket.addEventListener('click', () => {
        renderSeededBracket();
        showToast(`Balanced seeded tournament bracket generated for ${bracketSport}!`, 'success');
      });
    }
  }

  function renderSeededBracket() {
    if (!bracketTreeContainer) return;
    bracketTreeContainer.innerHTML = '';

    const roster = getRoster();
    // Filter athletes by sport
    const athletesInSport = roster
      .filter(s => s.sport.toLowerCase() === bracketSport.toLowerCase())
      .sort((a, b) => b.elo - a.elo); // Seeded by highest to lowest Elo

    // Take top 8 players for an 8-player knockout bracket
    const top8 = athletesInSport.slice(0, 8);

    // Balanced pairing:
    // Seed 1 vs Seed 8, Seed 4 vs Seed 5, Seed 2 vs Seed 7, Seed 3 vs Seed 6
    // This prevents beginners from facing top seeds in unfair chaos while ensuring fair tournament progression.
    const matchups = [
      { seedA: 1, pA: top8[0], seedB: 8, pB: top8[7] || { name: 'Qualifier A', elo: 800 } },
      { seedA: 4, pA: top8[3] || { name: 'Qualifier D', elo: 950 }, seedB: 5, pB: top8[4] || { name: 'Qualifier E', elo: 920 } },
      { seedA: 2, pA: top8[1] || { name: 'Qualifier B', elo: 1050 }, seedB: 7, pB: top8[6] || { name: 'Qualifier G', elo: 840 } },
      { seedA: 3, pA: top8[2] || { name: 'Qualifier C', elo: 1010 }, seedB: 6, pB: top8[5] || { name: 'Qualifier F', elo: 890 } }
    ];

    const courts = COURT_DEFINITIONS[bracketSport] || ['Court 1', 'Court 2'];

    let qfCardsHtml = matchups.map((m, idx) => `
      <div class="bracket-matchup-card">
        <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem; display:flex; justify-content:space-between;">
          <span>Match #${idx + 1}</span>
          <span>Round of 8</span>
        </div>
        <div class="seed-row">
          <span><strong>#${m.seedA}</strong> ${escapeHtml(m.pA.name)}</span>
          <span style="color:#b45309; font-weight:700;">${m.pA.elo} Elo</span>
        </div>
        <div class="seed-row">
          <span><strong>#${m.seedB}</strong> ${escapeHtml(m.pB.name)}</span>
          <span style="color:#b45309; font-weight:700;">${m.pB.elo} Elo</span>
        </div>

        <!-- Manual Court Assignment Override Dropdown -->
        <select class="court-override-select">
          <option value="">-- Assign Court --</option>
          ${courts.map(c => `<option value="${c}" ${c.includes('1') && idx === 0 ? 'selected' : ''}>📍 ${c}</option>`).join('')}
          <option value="Female-Only">🚺 Female-Only Reserved Court</option>
          <option value="Finals Court">🏆 Center Court (Championship)</option>
        </select>
      </div>
    `).join('');

    let sfCardsHtml = `
      <div class="bracket-matchup-card" style="margin-top: 2rem;">
        <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;">Semi-Final 1</div>
        <div class="seed-row">
          <span>Winner Match #1</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <div class="seed-row">
          <span>Winner Match #2</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <select class="court-override-select">
          <option>📍 Center Court (Semi-Finals)</option>
        </select>
      </div>

      <div class="bracket-matchup-card" style="margin-top: 3.5rem;">
        <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;">Semi-Final 2</div>
        <div class="seed-row">
          <span>Winner Match #3</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <div class="seed-row">
          <span>Winner Match #4</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <select class="court-override-select">
          <option>📍 Court 2 (Semi-Finals)</option>
        </select>
      </div>
    `;

    let finalsCardHtml = `
      <div class="bracket-matchup-card" style="margin-top: 5rem; border-color:var(--fccu-accent-gold); box-shadow: 0 4px 15px rgba(245,158,11,0.25);">
        <div style="font-size:0.75rem; font-weight:800; color:#b45309; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.35rem;">
          <span>🏆</span> FCCU Intramural Championship Finals
        </div>
        <div class="seed-row">
          <span>Winner SF 1</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <div class="seed-row">
          <span>Winner SF 2</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <select class="court-override-select" style="background:#fef3c7; border-color:#fcd34d;">
          <option selected>🏆 Gymnasium Center Glass Court (Finals)</option>
        </select>
      </div>
    `;

    bracketTreeContainer.innerHTML = `
      <div class="bracket-rounds-row">
        <div class="bracket-round-column">
          <h3>Quarter-Finals (Round 1)</h3>
          ${qfCardsHtml}
        </div>
        <div class="bracket-round-column">
          <h3>Semi-Finals</h3>
          ${sfCardsHtml}
        </div>
        <div class="bracket-round-column">
          <h3>Championship Final</h3>
          ${finalsCardHtml}
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Initialize all sections
  initCourtLockForm();
  initRosterControls();
  initBracketControls();

  renderLockedCourts();
  renderDisputeQueue();
  renderRestrictedRoster();
  renderSeededBracket();
});

