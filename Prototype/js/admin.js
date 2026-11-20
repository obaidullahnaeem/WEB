/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Directorate Command Center & Management Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. Management Authentication Guard
  // ==========================================================================
  let currentStaff = getLoggedInStaff();
  if (!currentStaff) {
    // If not authenticated via staff-login.html, redirect immediately
    window.location.href = 'staff-login.html';
    return;
  }

  // Active Management State
  let activeTabId = currentStaff.defaultTab || 'tab-disputes';
  let rosterSearchTerm = '';
  let bracketSport = 'Badminton';

  // DOM Elements - Session Header
  const staffHeaderName = document.getElementById('staffHeaderName');
  const staffHeaderRole = document.getElementById('staffHeaderRole');
  const staffHeaderId = document.getElementById('staffHeaderId');
  const btnStaffLogout = document.getElementById('btnStaffLogout');
  const povHeadingTitle = document.getElementById('povHeadingTitle');
  const povRoleBadge = document.getElementById('povRoleBadge');
  const povJurisdictionSubtitle = document.getElementById('povJurisdictionSubtitle');

  // Role Switcher Buttons
  const btnSwitchSadia = document.getElementById('btnSwitchSadia');
  const btnSwitchSaqib = document.getElementById('btnSwitchSaqib');
  const btnSwitchAhad = document.getElementById('btnSwitchAhad');

  // Tab Buttons & Panes
  const tabButtons = document.querySelectorAll('.btn-admin-tab');
  const tabPanes = document.querySelectorAll('.admin-tab-content');
  const toastContainer = document.getElementById('toastContainer');

  // Tab 1 (Disputes & Policy)
  const policyControlCard = document.getElementById('policyControlCard');
  const policyCapInput = document.getElementById('policyCapInput');
  const policyAdvanceLock = document.getElementById('policyAdvanceLock');
  const btnSavePolicy = document.getElementById('btnSavePolicy');
  const disputeAccessNotice = document.getElementById('disputeAccessNotice');
  const disputeQueueList = document.getElementById('disputeQueueList');
  const disputeCountBadge = document.getElementById('disputeCountBadge');

  // Tab 2 (Roster)
  const rosterSearchInput = document.getElementById('rosterSearchInput');
  const rosterTableBody = document.getElementById('rosterTableBody');
  const rosterTotalCount = document.getElementById('rosterTotalCount');
  const rosterAccessPill = document.getElementById('rosterAccessPill');
  const rosterPrivacyDescription = document.getElementById('rosterPrivacyDescription');
  const thCnic = document.getElementById('thCnic');
  const thCgpa = document.getElementById('thCgpa');

  // Tab 3 (Court Locking)
  const courtLockHeading = document.getElementById('courtLockHeading');
  const courtLockSub = document.getElementById('courtLockSub');
  const adminSportSelect = document.getElementById('adminSportSelect');
  const adminCourtSelect = document.getElementById('adminCourtSelect');
  const adminDateSelect = document.getElementById('adminDateSelect');
  const adminTimeSelect = document.getElementById('adminTimeSelect');
  const adminLockCategory = document.getElementById('adminLockCategory');
  const btnLockCourt = document.getElementById('btnLockCourt');
  const lockedCourtsList = document.getElementById('lockedCourtsList');

  // Tab 4 (Brackets & Reports)
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
  // Logout Handler
  // ==========================================================================
  if (btnStaffLogout) {
    btnStaffLogout.addEventListener('click', () => {
      clearLoggedInStaff();
      window.location.href = 'staff-login.html';
    });
  }

  // ==========================================================================
  // 2. Role-Specific Point-of-View Configuration
  // ==========================================================================
  function applyRoleConfiguration() {
    // Top Bar Info
    if (staffHeaderName) staffHeaderName.textContent = currentStaff.name;
    if (staffHeaderRole) staffHeaderRole.textContent = `(${currentStaff.role})`;
    if (staffHeaderId) staffHeaderId.textContent = currentStaff.staffId;

    if (povRoleBadge) povRoleBadge.textContent = `${currentStaff.role} View`;
    if (povJurisdictionSubtitle) povJurisdictionSubtitle.textContent = `Forman Christian College (A Chartered University) • ${currentStaff.titleDesc}`;

    // Highlight Role Switcher Button
    [btnSwitchSadia, btnSwitchSaqib, btnSwitchAhad].forEach(b => {
      if (b) b.classList.remove('active');
    });

    if (currentStaff.roleId === 'head_of_sports' && btnSwitchSadia) {
      btnSwitchSadia.classList.add('active');
      povHeadingTitle.innerHTML = '🛡️ Directorate of Athletics Management Command Center';
    } else if (currentStaff.roleId === 'sports_coordinator' && btnSwitchSaqib) {
      btnSwitchSaqib.classList.add('active');
      povHeadingTitle.innerHTML = '📋 Coaching Staff Command &amp; Player Eligibility Center';
    } else if (currentStaff.roleId === 'society_president' && btnSwitchAhad) {
      btnSwitchAhad.classList.add('active');
      povHeadingTitle.innerHTML = '🏆 FCCU Sports Society Executive Command Center';
    }

    // Configure Tab Visibility & Permissions:
    // ROLE 1: Mam Sadia (Head of Sports Department)
    if (currentStaff.roleId === 'head_of_sports') {
      if (policyControlCard) policyControlCard.style.display = 'block';
      if (disputeAccessNotice) disputeAccessNotice.innerHTML = '';
      if (rosterAccessPill) rosterAccessPill.textContent = 'Full Directorate Oversight Access';
      if (courtLockHeading) courtLockHeading.textContent = 'Administrative Court Lock & Maintenance Control';
      if (courtLockSub) courtLockSub.textContent = 'Set 1-week advance maintenance locks and campus priority blocks.';
    }
    // ROLE 2: Sir Saqib (Sports Coordinator / Coach)
    else if (currentStaff.roleId === 'sports_coordinator') {
      if (policyControlCard) policyControlCard.style.display = 'none';
      if (disputeAccessNotice) {
        disputeAccessNotice.innerHTML = `
          <div class="staff-view-notice" style="background:#eff6ff; border-color:#bfdbfe; color:#1e40af;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span>ℹ️</span>
              <div><strong>Coaching Staff Read-Only Access:</strong> Flagged match arbitration and campus booking caps are reserved for Head of Sports (Mam Sadia).</div>
            </div>
            <span class="stat-pill" style="background:#dbeafe; color:#1e40af; font-size:0.75rem;">Coach View</span>
          </div>
        `;
      }
      if (rosterAccessPill) rosterAccessPill.textContent = 'Full Coaching & Trial Eligibility Access';
      if (courtLockHeading) courtLockHeading.textContent = 'Practice & Female-Only Court Locking';
      if (courtLockSub) courtLockSub.textContent = 'Lock official courts for university team varsity practice or female-only hours. Conflicting casual bookings are refunded.';
    }
    // ROLE 3: Abdul Ahad (President Sports Society)
    else if (currentStaff.roleId === 'society_president') {
      if (policyControlCard) policyControlCard.style.display = 'none';
      if (disputeAccessNotice) {
        disputeAccessNotice.innerHTML = `
          <div class="staff-view-notice" style="background:#fef2f2; border-color:#fecaca; color:#991b1b;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span>🔒</span>
              <div><strong>Access Restricted:</strong> Flagged match arbitration is restricted to Directorate faculty (Mam Sadia). Society executives may manage tournaments &amp; brackets.</div>
            </div>
            <span class="stat-pill" style="background:#fee2e2; color:#991b1b; font-size:0.75rem;">Society Executive</span>
          </div>
        `;
      }
      if (rosterAccessPill) rosterAccessPill.textContent = 'Privacy Shield Active • Confidential Fields Masked';
      if (courtLockHeading) courtLockHeading.textContent = 'Society Event Court Blocking (2 to 3 Weeks Advance)';
      if (courtLockSub) courtLockSub.textContent = 'Block campus courts 2 to 3 weeks in advance for monthly intramural tournaments and society leagues.';
    }

    // Switch to active tab
    switchTab(activeTabId);
  }

  // Tab switching helper
  function switchTab(tabId) {
    activeTabId = tabId;
    tabButtons.forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', match);
    });

    tabPanes.forEach(pane => {
      const match = pane.id === tabId;
      pane.classList.toggle('active', match);
    });

    if (tabId === 'tab-disputes') renderDisputeQueue();
    if (tabId === 'tab-roster') renderRestrictedRoster();
    if (tabId === 'tab-courts') {
      initCourtLockForm();
      renderLockedCourts();
    }
    if (tabId === 'tab-brackets') renderSeededBracket();
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Switch Role Buttons
  if (btnSwitchSadia) {
    btnSwitchSadia.addEventListener('click', () => {
      const staffList = getStaffAccounts();
      currentStaff = staffList.find(s => s.roleId === 'head_of_sports') || currentStaff;
      saveLoggedInStaff(currentStaff);
      activeTabId = 'tab-disputes';
      applyRoleConfiguration();
      showToast('Switched POV to Mam Sadia (Head of Sports Department).', 'info');
    });
  }

  if (btnSwitchSaqib) {
    btnSwitchSaqib.addEventListener('click', () => {
      const staffList = getStaffAccounts();
      currentStaff = staffList.find(s => s.roleId === 'sports_coordinator') || currentStaff;
      saveLoggedInStaff(currentStaff);
      activeTabId = 'tab-roster';
      applyRoleConfiguration();
      showToast('Switched POV to Sir Saqib (Sports Coordinator / Coach).', 'info');
    });
  }

  if (btnSwitchAhad) {
    btnSwitchAhad.addEventListener('click', () => {
      const staffList = getStaffAccounts();
      currentStaff = staffList.find(s => s.roleId === 'society_president') || currentStaff;
      saveLoggedInStaff(currentStaff);
      activeTabId = 'tab-brackets';
      applyRoleConfiguration();
      showToast('Switched POV to Abdul Ahad (President Sports Society). CNIC/CGPA masked.', 'info');
    });
  }

  // ==========================================================================
  // TAB 1: Department Oversight, Policy Cap & Flagged Dispute Queue
  // ==========================================================================
  function initPolicyControl() {
    const policy = getBookingPolicy();
    if (policyCapInput) policyCapInput.value = policy.weeklyHourLimit || '3';
    if (policyAdvanceLock) policyAdvanceLock.value = policy.advanceLockWeeks || '1';

    if (btnSavePolicy) {
      btnSavePolicy.addEventListener('click', () => {
        if (currentStaff.roleId !== 'head_of_sports') {
          alert('Authority Denied: Only the Head of Sports Department (Mam Sadia) may modify university-wide booking quotas.');
          return;
        }

        const newCap = parseInt(policyCapInput.value, 10);
        const newAdvance = parseInt(policyAdvanceLock.value, 10);

        const updatedPolicy = {
          weeklyHourLimit: newCap,
          advanceLockWeeks: newAdvance,
          lastUpdatedBy: currentStaff.name,
          lastUpdatedAt: new Date().toLocaleDateString()
        };
        saveBookingPolicy(updatedPolicy);

        // Update all students' total booking hours quota in the database
        const students = getStudents();
        students.forEach(s => {
          s.weeklyHoursTotal = newCap;
          if (s.weeklyHoursRemaining > newCap) s.weeklyHoursRemaining = newCap;
        });
        saveStudents(students);

        showToast(`University Policy Updated: Weekly student booking cap set to ${newCap} hours/week!`, 'success');
      });
    }
  }

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
          <h3>Dispute Arbitration Queue Clean</h3>
          <p>There are currently no contested matches requiring Directorate referee arbitration.</p>
        </div>
      `;
      return;
    }

    const canArbitrate = currentStaff.canResolveDisputes === true;

    flagged.forEach(match => {
      const card = document.createElement('div');
      card.className = 'dispute-item-card';

      card.innerHTML = `
        <div class="dispute-header-row">
          <div>
            <span class="badge-state badge-locked">🚩 Conflicting Scores</span>
            <strong style="color:var(--fccu-navy); font-size:1rem; margin-left:0.5rem;">${escapeHtml(match.sport)} &bull; ${escapeHtml(match.court)}</strong>
            <span style="font-size:0.8rem; color:var(--text-muted); margin-left:0.5rem;">(${escapeHtml(match.date)})</span>
            <span style="background:#f1f5f9; padding:0.15rem 0.4rem; border-radius:4px; font-family:monospace; font-size:0.75rem; color:#475569; margin-left:0.4rem;">#${escapeHtml(match.id)}</span>
          </div>
          <span style="font-size:0.75rem; color:#be123c; font-weight:700;">Zero Elo Deducted (Frozen)</span>
        </div>

        <div style="background:#ffffff; border-radius:var(--radius-sm); padding:0.75rem 1rem; border:1px solid #fecdd3; font-size:0.85rem; margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
            <span><strong>Player 1:</strong> ${escapeHtml(match.player1.name)} (${match.player1.elo} Elo) &bull; Submitted: <span style="color:#15803d; font-weight:700;">${escapeHtml(match.player1.submission || 'Win')}</span></span>
            <span>Roll: <code style="font-family:monospace;">${escapeHtml(match.player1.rollNumber)}</code></span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span><strong>Player 2:</strong> ${escapeHtml(match.player2.name)} (${match.player2.elo} Elo) &bull; Submitted: <span style="color:#15803d; font-weight:700;">${escapeHtml(match.player2.submission || 'Win')}</span></span>
            <span>Roll: <code style="font-family:monospace;">${escapeHtml(match.player2.rollNumber)}</code></span>
          </div>
        </div>

        <div style="font-size:0.8rem; color:#7f1d1d; margin-bottom:0.75rem;">
          <strong>Referee Audit:</strong> Both athletes submitted conflicting "Win" claims. Zero Elo has been altered on student profiles pending Head of Sports resolution.
        </div>

        ${canArbitrate ? `
          <!-- Exclusive Head of Sports Resolution Actions -->
          <div class="dispute-actions-row">
            <button type="button" class="btn-resolve-win btn-resolve-p1" data-id="${match.id}">
              🏆 Confirm ${escapeHtml(match.player1.name.split(' ')[0])} as Winner
            </button>
            <button type="button" class="btn-resolve-win btn-resolve-p2" data-id="${match.id}">
              🏆 Confirm ${escapeHtml(match.player2.name.split(' ')[0])} as Winner
            </button>
            <button type="button" class="btn-resolve-void btn-void-match" data-id="${match.id}">
              ⚪ Void Match (Zero Elo Penalty)
            </button>
          </div>
        ` : `
          <div style="font-size:0.78rem; color:#64748b; font-style:italic; padding:0.5rem; background:#f8fafc; border-radius:4px;">
            🔒 Dispute arbitration is restricted to the Head of Sports Department (Mam Sadia).
          </div>
        `}
      `;

      if (canArbitrate) {
        card.querySelector('.btn-resolve-p1').addEventListener('click', () => {
          resolveDispute(match.id, match.player1.name);
        });
        card.querySelector('.btn-resolve-p2').addEventListener('click', () => {
          resolveDispute(match.id, match.player2.name);
        });
        card.querySelector('.btn-void-match').addEventListener('click', () => {
          voidDispute(match.id);
        });
      }

      disputeQueueList.appendChild(card);
    });
  }

  function resolveDispute(matchId, winnerName) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    match.status = 'Confirmed';
    const isP1Winner = winnerName === match.player1.name;
    const eloCalc = calculateElo(match.player1.elo, match.player2.elo, isP1Winner ? 1 : 0, 32);

    match.eloChange = isP1Winner ? eloCalc.changeA : eloCalc.changeB;
    match.mathBreakdown = `Arbitrated by Head of Sports (${currentStaff.name}): ${winnerName} confirmed as winner. ${match.player1.name}: ${eloCalc.newRatingA} Elo | ${match.player2.name}: ${eloCalc.newRatingB} Elo (${eloCalc.formulaBreakdown})`;
    match.notes = `Arbitrated by Head of Sports (${currentStaff.name}): ${winnerName} verified.`;

    // Update students database
    const students = getStudents();
    const p1 = students.find(s => s.rollNumber === match.player1.rollNumber);
    if (p1) {
      p1.elo = eloCalc.newRatingA;
      if (isP1Winner) p1.wins = (p1.wins || 0) + 1;
      else p1.losses = (p1.losses || 0) + 1;
    }

    const p2 = students.find(s => s.rollNumber === match.player2.rollNumber);
    if (p2) {
      p2.elo = eloCalc.newRatingB;
      if (!isP1Winner) p2.wins = (p2.wins || 0) + 1;
      else p2.losses = (p2.losses || 0) + 1;
    }
    saveStudents(students);

    // If current logged-in student session was involved, sync it
    const activeStudent = getCurrentUser();
    if (activeStudent) {
      if (activeStudent.rollNumber === match.player1.rollNumber) {
        activeStudent.elo = eloCalc.newRatingA;
        saveCurrentUser(activeStudent);
      } else if (activeStudent.rollNumber === match.player2.rollNumber) {
        activeStudent.elo = eloCalc.newRatingB;
        saveCurrentUser(activeStudent);
      }
    }

    saveMatches(matches);
    renderDisputeQueue();
    showToast(`Dispute resolved! ${winnerName} confirmed as winner and ratings committed to FCCU Ladder.`, 'success');
  }

  function voidDispute(matchId) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    match.status = 'Voided';
    match.eloChange = 0;
    match.notes = `Arbitrated by Head of Sports (${currentStaff.name}): Match voided without penalty or rating deduction.`;

    saveMatches(matches);
    renderDisputeQueue();
    showToast('Match voided with Zero Elo penalty.', 'info');
  }

  // ==========================================================================
  // TAB 2: Restricted Student Athlete Database & Coaching Roster
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

    const students = getStudents();

    // Filter by search term
    const filtered = students.filter(s => {
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

    // Role Permission Checks:
    // Abdul Ahad (President Sports Society) CANNOT see confidential CNIC and CGPA
    const isMaskedForSociety = currentStaff.roleId === 'society_president';
    const canEditCoachFields = currentStaff.roleId === 'sports_coordinator' || currentStaff.roleId === 'head_of_sports';

    filtered.forEach(athlete => {
      const tr = document.createElement('tr');

      const cnicDisplay = isMaskedForSociety 
        ? `<span class="masked-data">[Confidential - Directorate Only]</span>`
        : `<span style="font-family:monospace; color:#991b1b; font-weight:600;">${escapeHtml(athlete.cnic || '35202-XXXXXXX-X')}</span>`;

      const cgpaDisplay = isMaskedForSociety
        ? `<span class="masked-data">[Restricted - Directorate Only]</span>`
        : `<span style="font-weight:700; color:#0369a1;">${athlete.cgpa || 3.0}</span>`;

      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(athlete.name)}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(athlete.sport)}</div>
        </td>
        <td style="font-family:monospace; font-weight:600;">
          ${escapeHtml(athlete.rollNumber)}
        </td>
        <!-- Confidential CNIC Field -->
        <td>
          ${cnicDisplay}
        </td>
        <td style="font-size:0.8rem; color:var(--text-secondary); font-family:monospace;">
          ${escapeHtml(athlete.contact || '0300-0000000')}
        </td>
        <!-- Confidential CGPA Field -->
        <td>
          ${cgpaDisplay}
        </td>
        <td>
          <span class="quota-pill ${athlete.activeStatus === 'Active' ? 'available' : 'limit-reached'}" style="font-size:0.7rem; padding:0.15rem 0.5rem;">
            ${escapeHtml(athlete.activeStatus || 'Active')}
          </span>
        </td>
        <!-- Disciplinary Hold Toggle (Sir Saqib & Mam Sadia can toggle, Abdul Ahad is view-only) -->
        <td>
          <label style="display:inline-flex; align-items:center; gap:0.35rem; cursor:${canEditCoachFields ? 'pointer' : 'not-allowed'};">
            <input type="checkbox" class="hold-toggle-input" data-id="${athlete.id}" ${athlete.disciplinaryHold ? 'checked' : ''} ${canEditCoachFields ? '' : 'disabled'} />
            <span style="font-size:0.75rem; font-weight:700; color:${athlete.disciplinaryHold ? '#b91c1c' : '#64748b'};">
              ${athlete.disciplinaryHold ? '⛔ On Hold' : 'Clean'}
            </span>
          </label>
        </td>
        <!-- Manual Elo Rank Adjustment with Reason Note -->
        <td>
          ${canEditCoachFields ? `
            <div class="inline-elo-edit">
              <input type="number" class="inline-elo-input" value="${athlete.elo}" data-id="${athlete.id}" min="100" max="3000" />
              <button type="button" class="btn-elo-save" data-id="${athlete.id}" title="Save Adjusted Elo">
                Save
              </button>
            </div>
            ${athlete.eloReasonNote ? `<div class="reason-note-text">Note: ${escapeHtml(athlete.eloReasonNote)}</div>` : ''}
          ` : `
            <span style="font-weight:700; color:#b45309;">⭐ ${athlete.elo}</span>
          `}
        </td>
        <!-- Varsity Trials Shortlist Toggle -->
        <td>
          <span class="varsity-badge ${athlete.varsityShortlisted ? 'shortlisted' : ''}" data-id="${athlete.id}" title="${canEditCoachFields ? 'Click to toggle Varsity Shortlist' : 'Varsity Status'}" style="cursor:${canEditCoachFields ? 'pointer' : 'default'};">
            ${athlete.varsityShortlisted ? '⭐ Shortlisted' : '➕ Shortlist'}
          </span>
        </td>
      `;

      // Event Listener: Disciplinary Hold Toggle
      if (canEditCoachFields) {
        const holdBox = tr.querySelector('.hold-toggle-input');
        if (holdBox) {
          holdBox.addEventListener('change', (e) => {
            const isHold = e.target.checked;
            athlete.disciplinaryHold = isHold;
            saveStudents(students);
            renderRestrictedRoster();
            
            showToast(
              `Disciplinary Hold for ${athlete.name} set to ${isHold ? 'ACTIVE (Login Blocked at gateway)' : 'CLEARED'}.`,
              isHold ? 'error' : 'success'
            );
          });
        }

        // Event Listener: Manual Elo Adjustment with Reason Note
        const btnSaveElo = tr.querySelector('.btn-elo-save');
        const inputElo = tr.querySelector('.inline-elo-input');
        if (btnSaveElo && inputElo) {
          btnSaveElo.addEventListener('click', () => {
            const newElo = parseInt(inputElo.value, 10);
            if (isNaN(newElo) || newElo < 100 || newElo > 3000) {
              alert('Please enter a valid Elo rating between 100 and 3000.');
              return;
            }

            const reasonNote = prompt(`Please enter an official reason note for adjusting ${athlete.name}'s Elo to ${newElo}:`, 'Coach Evaluation Session Audit');
            if (reasonNote === null) return; // User cancelled

            athlete.elo = newElo;
            athlete.eloReasonNote = reasonNote.trim() || 'Manual adjustment by coaching staff';
            saveStudents(students);

            // Sync current student session if applicable
            const activeStudent = getCurrentUser();
            if (activeStudent && activeStudent.rollNumber === athlete.rollNumber) {
              activeStudent.elo = newElo;
              saveCurrentUser(activeStudent);
            }

            renderRestrictedRoster();
            showToast(`Rating for ${athlete.name} updated to ${newElo} Elo. Note logged.`, 'success');
          });
        }

        // Event Listener: Varsity Trials Toggle
        const varsityBadge = tr.querySelector('.varsity-badge');
        if (varsityBadge) {
          varsityBadge.addEventListener('click', () => {
            athlete.varsityShortlisted = !athlete.varsityShortlisted;
            saveStudents(students);
            renderRestrictedRoster();
            showToast(
              athlete.varsityShortlisted 
                ? `⭐ ${athlete.name} shortlisted for FCCU Inter-University Varsity Trials!` 
                : `${athlete.name} removed from trial shortlist.`,
              'info'
            );
          });
        }
      }

      rosterTableBody.appendChild(tr);
    });
  }

  // ==========================================================================
  // TAB 3: Court Blocking & Override Controls
  // ==========================================================================
  function initCourtLockForm() {
    if (!adminSportSelect || !adminCourtSelect) return;

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

    // Populate dates based on role (Abdul Ahad gets 2-3 weeks, Mam Sadia/Sir Saqib get 1-3 weeks)
    if (adminDateSelect) {
      adminDateSelect.innerHTML = '';
      const today = new Date();
      const minWeek = currentStaff.roleId === 'society_president' ? 2 : 1;
      const maxWeek = 3;

      for (let w = minWeek; w <= maxWeek; w++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + (w * 7));
        const opt = document.createElement('option');
        opt.value = futureDate.toISOString().split('T')[0];
        opt.textContent = `Week +${w}: ${futureDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        adminDateSelect.appendChild(opt);
      }
    }

    if (adminTimeSelect) {
      adminTimeSelect.innerHTML = '';
      TIME_SLOTS_60_MIN.forEach((tStr, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = tStr;
        adminTimeSelect.appendChild(opt);
      });
    }

    // Role-specific categories
    if (adminLockCategory) {
      adminLockCategory.innerHTML = '';
      if (currentStaff.roleId === 'sports_coordinator') {
        adminLockCategory.innerHTML = `
          <option value="Varsity Practice & Female-Only Slot" selected>Varsity Practice &amp; Female-Only Slot</option>
          <option value="Team Practice (Varsity Squad)">Team Practice (Varsity Squad)</option>
          <option value="Female-Only Dedicated Hours">Female-Only Dedicated Hours</option>
        `;
      } else if (currentStaff.roleId === 'society_president') {
        adminLockCategory.innerHTML = `
          <option value="Society Tournament (FCCU Cup)" selected>Society Tournament (FCCU Cup)</option>
          <option value="Intramural League Championship">Intramural League Championship</option>
          <option value="Society Annual Sports Gala">Society Annual Sports Gala</option>
        `;
      } else {
        adminLockCategory.innerHTML = `
          <option value="Varsity Practice & Female-Only Slot">Varsity Practice &amp; Female-Only Slot</option>
          <option value="Court Maintenance & Cleaning" selected>Court Maintenance &amp; Cleaning</option>
          <option value="Team Practice (Varsity Squad)">Team Practice (Varsity Squad)</option>
          <option value="Society Tournament (FCCU Cup)">Society Tournament (FCCU Cup)</option>
        `;
      }
    }

    // Lock Court Action with Override & Refund
    if (btnLockCourt) {
      btnLockCourt.onclick = () => {
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

        // Check for conflicting casual student booking
        if (slot.state === 'Booked' && slot.bookedBy) {
          const studentName = slot.bookedBy.name || 'Student';
          const roll = slot.bookedBy.rollNumber || 'N/A';

          const proceedOverride = confirm(
            `⚠️ Conflicting casual booking found!\n\n${studentName} (Roll: ${roll}) currently holds ${courtName} at ${timeSlot}.\n\nOverride & Alert Student? This will automatically cancel their reservation and restore their 1 weekly booking hour.`
          );

          if (!proceedOverride) return;

          // Refund 1 hour to student in database
          const students = getStudents();
          const student = students.find(s => s.rollNumber === roll);
          if (student) {
            student.weeklyHoursRemaining = Math.min(student.weeklyHoursTotal || 3, (student.weeklyHoursRemaining || 0) + 1);
            student.hasOverrideNotice = true;
            student.overrideMessage = `Schedule Notice: Your ${timeSlot} reservation on ${courtName} was overridden by Sports Administration for ${lockCategory}. Your 1 weekly booking hour has been refunded.`;
            saveStudents(students);
          }

          // If current student session is the one overridden, update it
          const activeStudent = getCurrentUser();
          if (activeStudent && activeStudent.rollNumber === roll) {
            activeStudent.weeklyHoursRemaining = Math.min(activeStudent.weeklyHoursTotal || 3, (activeStudent.weeklyHoursRemaining || 0) + 1);
            activeStudent.hasOverrideNotice = true;
            activeStudent.overrideMessage = `Schedule Notice: Your ${timeSlot} reservation on ${courtName} was overridden by Sports Administration for ${lockCategory}. Your 1 weekly booking hour has been refunded.`;
            saveCurrentUser(activeStudent);
          }

          showToast(`Casual booking by ${studentName} overridden. 1 weekly hour refunded with schedule alert notice.`, 'warning');
        }

        // Set state to Locked
        slot.state = 'Locked';
        slot.lockReason = lockCategory;
        slot.bookedBy = null;
        saveCourtSlots(allSlots);

        renderLockedCourts();
        showToast(`Court Locked: ${courtName} set to [${lockCategory}] for ${timeSlot}.`, 'success');
      };
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
        showToast(`${slot.courtName} unlocked and reopened for student reservations.`, 'info');
      });

      lockedCourtsList.appendChild(item);
    });
  }

  // ==========================================================================
  // TAB 4: Seeded Tournament Bracket Generator & Utilization Reports
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
        showToast(`Balanced seeded knockout bracket generated for ${bracketSport}!`, 'success');
      });
    }
  }

  function renderSeededBracket() {
    if (!bracketTreeContainer) return;
    bracketTreeContainer.innerHTML = '';

    const students = getStudents();
    const athletesInSport = students
      .filter(s => s.sport.toLowerCase() === bracketSport.toLowerCase())
      .sort((a, b) => b.elo - a.elo); // Sorted by Elo Rank (Seeded)

    const top8 = athletesInSport.slice(0, 8);

    // Balanced pairing: Seed 1 vs Seed 8, Seed 4 vs Seed 5, Seed 2 vs Seed 7, Seed 3 vs Seed 6
    const matchups = [
      { seedA: 1, pA: top8[0] || { name: 'Seed 1', elo: 1200 }, seedB: 8, pB: top8[7] || { name: 'Qualifier A', elo: 800 } },
      { seedA: 4, pA: top8[3] || { name: 'Seed 4', elo: 1040 }, seedB: 5, pB: top8[4] || { name: 'Seed 5', elo: 1025 } },
      { seedA: 2, pA: top8[1] || { name: 'Seed 2', elo: 1100 }, seedB: 7, pB: top8[6] || { name: 'Qualifier B', elo: 840 } },
      { seedA: 3, pA: top8[2] || { name: 'Seed 3', elo: 1060 }, seedB: 6, pB: top8[5] || { name: 'Seed 6', elo: 980 } }
    ];

    const courts = COURT_DEFINITIONS[bracketSport] || ['Court 1', 'Court 2'];

    let qfCardsHtml = matchups.map((m, idx) => `
      <div class="bracket-matchup-card">
        <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem; display:flex; justify-content:space-between;">
          <span>Match #${idx + 1}</span>
          <span>Round of 8 (Quarter-Final)</span>
        </div>
        <div class="seed-row">
          <span><strong>#${m.seedA}</strong> ${escapeHtml(m.pA.name)}</span>
          <span style="color:#b45309; font-weight:700;">${m.pA.elo} Elo</span>
        </div>
        <div class="seed-row">
          <span><strong>#${m.seedB}</strong> ${escapeHtml(m.pB.name)}</span>
          <span style="color:#b45309; font-weight:700;">${m.pB.elo} Elo</span>
        </div>

        <!-- Manual Court Assignment Override Dropdown (Society President Jurisdiction) -->
        <select class="court-override-select" title="Assign specific court for this fixture">
          <option value="">-- Assign Court --</option>
          ${courts.map(c => `<option value="${c}" ${c.includes('1') && idx === 0 ? 'selected' : ''}>📍 ${c}</option>`).join('')}
          <option value="Female-Only">🚺 Female-Only Dedicated Arena</option>
          <option value="Center Court">🏆 Center Glass Court (Championship)</option>
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
          <option selected>📍 Center Court (Semi-Finals)</option>
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
          <option selected>📍 Court 2 (Semi-Finals)</option>
        </select>
      </div>
    `;

    let finalsCardHtml = `
      <div class="bracket-matchup-card" style="margin-top: 5rem; border-color:var(--fccu-accent-gold); box-shadow: 0 4px 15px rgba(245,158,11,0.25);">
        <div style="font-size:0.75rem; font-weight:800; color:#b45309; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.35rem;">
          <span>🏆</span> FCCU Intramural Championship Finals
        </div>
        <div class="seed-row">
          <span>Winner Semi-Final 1</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <div class="seed-row">
          <span>Winner Semi-Final 2</span>
          <span style="color:var(--text-muted);">TBD</span>
        </div>
        <select class="court-override-select" style="background:#fef3c7; border-color:#fcd34d;">
          <option selected>🏆 Center Court 1 (Championship Arena)</option>
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

  // Initialize all components
  initPolicyControl();
  initRosterControls();
  initBracketControls();
  applyRoleConfiguration();
});
