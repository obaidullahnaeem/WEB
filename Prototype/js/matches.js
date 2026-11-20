/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Dual Score Confirmation & Leaderboard Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Render shared navigation
  renderSharedNavbar('matches');

  let currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // State
  let activeLeaderboardSport = 'All'; // 'All' | 'Badminton' | 'Table Tennis' | 'Lawn Tennis'

  // DOM Elements - Matches Section
  const matchesListContainer = document.getElementById('matchesListContainer');

  // DOM Elements - Leaderboard Section
  const leaderboardBody = document.getElementById('leaderboardBody');
  const leaderboardSportTabs = document.getElementById('leaderboardSportTabs');
  const leaderboardPlayerCount = document.getElementById('leaderboardPlayerCount');
  const toastContainer = document.getElementById('toastContainer');

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
  // 1. My Matches & Dual Score Confirmation Section
  // ==========================================================================
  function renderMatches() {
    if (!matchesListContainer) return;
    matchesListContainer.innerHTML = '';

    const matches = getMatches();

    // Filter matches involving current student
    const myMatches = matches.filter(
      m => (m.player1 && m.player1.rollNumber === currentUser.rollNumber) ||
           (m.player2 && m.player2.rollNumber === currentUser.rollNumber)
    );

    if (myMatches.length === 0) {
      matchesListContainer.innerHTML = `
        <div class="empty-opponents-box">
          <div class="empty-icon">🎾</div>
          <h3>No Recorded Intramural Matches</h3>
          <p>You have not recorded any competitive matches yet. Book a court to schedule a verified game!</p>
        </div>
      `;
      return;
    }

    myMatches.forEach(m => {
      const card = document.createElement('div');
      card.className = 'match-card';

      // Check whether current user is Player 1 or Player 2
      const isPlayer1 = m.player1.rollNumber === currentUser.rollNumber;
      const me = isPlayer1 ? m.player1 : m.player2;
      const opponent = isPlayer1 ? m.player2 : m.player1;

      // Status badge style
      let statusBadgeClass = 'badge-booked';
      let statusIcon = '⏳';
      let statusLabel = m.status;
      if (m.status === 'Confirmed') {
        statusBadgeClass = 'badge-open';
        statusIcon = '✅';
        statusLabel = 'Confirmed & Completed';
      } else if (m.status === 'Flagged') {
        statusBadgeClass = 'badge-locked';
        statusIcon = '🚩';
        statusLabel = 'Flagged: Score Conflict';
      } else if (m.status === 'Voided') {
        statusBadgeClass = 'badge-booked';
        statusIcon = '⚪';
        statusLabel = 'Voided by Directorate';
      }

      card.innerHTML = `
        <div class="match-card-header">
          <div class="match-info-meta">
            <span style="font-weight:700; color:var(--fccu-navy); font-size:0.95rem;">${escapeHtml(m.sport)}</span>
            <span>&bull;</span>
            <span>${escapeHtml(m.court)}</span>
            <span>&bull;</span>
            <span>${escapeHtml(m.date)}</span>
            <span class="match-id-badge" style="background:#f1f5f9; padding:0.15rem 0.4rem; border-radius:4px; font-family:monospace; font-size:0.75rem; color:#475569;">#${escapeHtml(m.id)}</span>
          </div>
          <span class="badge-state ${statusBadgeClass}">
            ${statusIcon} ${statusLabel}
          </span>
        </div>

        <div class="match-versus-grid">
          <!-- Current User Side -->
          <div class="player-side-box">
            <div class="avatar-circle" style="width:38px; height:38px; font-size:0.85rem;">
              ${me.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style="font-weight:700; font-size:0.95rem;">
                ${escapeHtml(me.name)} <span class="you-tag">You</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
                Baseline: <strong>${me.elo} Elo</strong> &bull; Submitted: <strong>${me.submission ? escapeHtml(me.submission) : 'Pending Your Action'}</strong>
              </div>
            </div>
          </div>

          <!-- VS Badge -->
          <div class="vs-badge-circle">VS</div>

          <!-- Opponent Side -->
          <div class="player-side-box align-right">
            <div style="text-align:right;">
              <div style="font-weight:700; font-size:0.95rem;">
                ${escapeHtml(opponent.name)}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
                Baseline: <strong>${opponent.elo} Elo</strong> &bull; Official Score: <strong>${opponent.submission ? escapeHtml(opponent.submission) : 'Awaiting Submission'}</strong>
              </div>
            </div>
            <div class="avatar-circle" style="width:38px; height:38px; font-size:0.85rem; background: #0369a1;">
              ${opponent.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
          </div>
        </div>

        <!-- Dynamic Action Area based on Status -->
        <div class="match-actions-area">
          ${m.status === 'Pending' ? `
            <div class="dual-score-box">
              <div style="font-size: 0.82rem; font-weight:700; color:var(--fccu-navy); display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.5rem;">
                <span>Official Scorecard Verification:</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">
                  Opponent record logged &bull; Confirm your match outcome
                </span>
              </div>

              <div class="dual-score-controls-row">
                <div class="user-score-buttons" style="width: 100%; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                  <span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">
                    Your Verified Result:
                  </span>
                  <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn-score-choice btn-score-win ${me.submission === 'Win' ? 'active' : ''}" data-match="${m.id}" data-action="user-win">
                      🏆 Submit Win
                    </button>
                    <button type="button" class="btn-score-choice btn-score-loss ${me.submission === 'Loss' ? 'active' : ''}" data-match="${m.id}" data-action="user-loss">
                      Submit Loss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          ${m.status === 'Confirmed' ? `
            <div class="elo-breakdown-card">
              <span style="font-size:1.35rem;">📐</span>
              <div>
                <strong>Elo Math Breakdown:</strong> ${escapeHtml(m.mathBreakdown || 'Dual confirmation verified. Transparent Elo change applied.')}
                <div style="font-size:0.78rem; color:#0284c7; margin-top:0.25rem;">
                  Official Status: <strong>Completed</strong> &bull; Rating adjustments committed to FCCU Intramural Ladder.
                </div>
              </div>
            </div>
          ` : ''}

          ${m.status === 'Flagged' ? `
            <div class="dispute-flagged-card">
              <span style="font-size:1.35rem;">⚠️</span>
              <div>
                <strong>Conflicting Scores Flagged:</strong> Both athletes submitted conflicting outcomes ("Win").
                <div style="font-size:0.78rem; color:#be123c; margin-top:0.25rem; font-weight:600;">
                  Match is frozen with Zero Elo deduction and has been forwarded to Mam Sadia's Admin Dispute Arbitration Queue.
                </div>
              </div>
            </div>
          ` : ''}

          ${m.status === 'Voided' ? `
            <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:var(--radius-md); padding:0.75rem 1rem; font-size:0.82rem; color:var(--text-muted);">
              ⚪ <strong>Match Voided by Sports Directorate:</strong> Resolved with zero rating deductions applied to either student athlete.
            </div>
          ` : ''}
        </div>
      `;

      // Attach event listeners for user's submission
      if (m.status === 'Pending') {
        const btnWin = card.querySelector('[data-action="user-win"]');
        const btnLoss = card.querySelector('[data-action="user-loss"]');

        if (btnWin) {
          btnWin.addEventListener('click', () => {
            handleStudentScoreSubmission(m.id, 'Win');
          });
        }

        if (btnLoss) {
          btnLoss.addEventListener('click', () => {
            handleStudentScoreSubmission(m.id, 'Loss');
          });
        }
      }

      matchesListContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // Dual Score Confirmation Logic (Strictly satisfies M-101 and M-102 specifications)
  // ==========================================================================
  function handleStudentScoreSubmission(matchId, myChoice) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const isPlayer1 = match.player1.rollNumber === currentUser.rollNumber;
    if (isPlayer1) {
      match.player1.submission = myChoice;
    } else {
      match.player2.submission = myChoice;
    }

    const s1 = match.player1.submission;
    const s2 = match.player2.submission;

    // SCENARIO 1: Matching Outcomes (One Win, One Loss) e.g. Match M-101 vs Daniyal Khan
    if ((s1 === 'Win' && s2 === 'Loss') || (s1 === 'Loss' && s2 === 'Win')) {
      match.status = 'Confirmed';

      const p1Won = s1 === 'Win';
      const eloCalc = calculateElo(match.player1.elo, match.player2.elo, p1Won ? 1 : 0, 32);

      const deltaP1 = eloCalc.changeA >= 0 ? `+${eloCalc.changeA}` : `${eloCalc.changeA}`;
      const deltaP2 = eloCalc.changeB >= 0 ? `+${eloCalc.changeB}` : `${eloCalc.changeB}`;

      match.eloChange = eloCalc.changeA;
      match.mathBreakdown = `${match.player1.name}: ${match.player1.elo} ${deltaP1} = ${eloCalc.newRatingA} Elo | ${match.player2.name}: ${match.player2.elo} ${deltaP2} = ${eloCalc.newRatingB} Elo (${eloCalc.formulaBreakdown})`;
      match.notes = 'Dual submissions agree. Match confirmed & completed.';

      // Update current user's session
      if (isPlayer1) {
        currentUser.elo = eloCalc.newRatingA;
        if (s1 === 'Win') currentUser.wins = (currentUser.wins || 0) + 1;
        else currentUser.losses = (currentUser.losses || 0) + 1;
      } else {
        currentUser.elo = eloCalc.newRatingB;
        if (s2 === 'Win') currentUser.wins = (currentUser.wins || 0) + 1;
        else currentUser.losses = (currentUser.losses || 0) + 1;
      }
      saveCurrentUser(currentUser);

      // Update top bar Elo pill
      const userEloPill = document.getElementById('userEloPill');
      if (userEloPill) {
        userEloPill.innerHTML = `<span class="icon">🏆</span> <strong>${currentUser.elo} Elo</strong>`;
      }

      // Update persistent student roster for both athletes
      const students = getStudents();
      const p1Record = students.find(s => s.rollNumber === match.player1.rollNumber);
      if (p1Record) {
        p1Record.elo = eloCalc.newRatingA;
        if (s1 === 'Win') p1Record.wins = (p1Record.wins || 0) + 1;
        else p1Record.losses = (p1Record.losses || 0) + 1;
      }

      const p2Record = students.find(s => s.rollNumber === match.player2.rollNumber);
      if (p2Record) {
        p2Record.elo = eloCalc.newRatingB;
        if (s2 === 'Win') p2Record.wins = (p2Record.wins || 0) + 1;
        else p2Record.losses = (p2Record.losses || 0) + 1;
      }
      saveStudents(students);

      saveMatches(matches);
      renderMatches();
      renderLeaderboard();
      showToast(`Dual confirmation verified! Result confirmed: ${p1Won ? match.player1.name : match.player2.name} won. Elo updated transparently to ${currentUser.elo}.`, 'success');

    // SCENARIO 2: Conflicting Scores (Both Claimed Win) e.g. Match M-102 vs Raza Mehmood
    } else if (s1 === 'Win' && s2 === 'Win') {
      match.status = 'Flagged';
      match.eloChange = 0;
      match.notes = 'Conflicting SCORE records: Both athletes claimed Win. Zero Elo deduction applied pending Directorate arbitration.';

      // Push to Mam Sadia's Admin Dispute Arbitration Queue
      let disputes = [];
      try {
        disputes = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_DISPUTES)) || [];
      } catch (e) {
        disputes = [];
      }

      const disputeIndex = disputes.findIndex(d => d.id === match.id);
      const disputeEntry = {
        ...match,
        flaggedAt: new Date().toLocaleString(),
        reason: 'Both athletes claimed Win in dual score confirmation'
      };

      if (disputeIndex !== -1) {
        disputes[disputeIndex] = disputeEntry;
      } else {
        disputes.push(disputeEntry);
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_DISPUTES, JSON.stringify(disputes));

      saveMatches(matches);
      renderMatches();
      showToast('⚠️ Conflicting SCORE records detected! Match frozen with Zero Elo deduction and routed to Mam Sadia\'s Admin Dispute Queue.', 'warning');
    }
  }

  // ==========================================================================
  // 2. Public Campus Elo Leaderboard Section
  // ==========================================================================
  function initLeaderboardTabs() {
    if (!leaderboardSportTabs) return;
    leaderboardSportTabs.innerHTML = '';

    const tabs = ['All', 'Badminton', 'Table Tennis', 'Lawn Tennis'];

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-sport-tab ${activeLeaderboardSport.toLowerCase() === tab.toLowerCase() ? 'active' : ''}`;
      btn.textContent = tab;

      btn.addEventListener('click', () => {
        activeLeaderboardSport = tab;
        initLeaderboardTabs();
        renderLeaderboard();
      });

      leaderboardSportTabs.appendChild(btn);
    });
  }

  function renderLeaderboard() {
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '';

    const students = getStudents();

    // Filter by sport
    let filtered = students.filter(s => !s.disciplinaryHold); // Only active, non-hold athletes on public ladder
    if (activeLeaderboardSport !== 'All') {
      filtered = filtered.filter(s => s.sport.toLowerCase() === activeLeaderboardSport.toLowerCase());
    }

    // Sort descending by verified Elo Rating
    filtered.sort((a, b) => b.elo - a.elo);

    if (leaderboardPlayerCount) {
      leaderboardPlayerCount.textContent = `${filtered.length} Athletes Ranked`;
    }

    // STRICT PRIVACY RULE: Display ONLY Rank, Athlete Name, Roll No, Sport, Elo, and Wins/Losses.
    // Strictly protect CNIC, CGPA, and Disciplinary Holds from public student views.
    filtered.forEach((athlete, index) => {
      const tr = document.createElement('tr');
      const isMe = athlete.rollNumber === currentUser.rollNumber;
      if (isMe) tr.className = 'current-user-row';

      const rank = index + 1;
      let rankDisplay = `${rank}`;
      let rankClass = '';
      if (rank === 1) {
        rankDisplay = `🥇 1`;
        rankClass = 'rank-top-1';
      } else if (rank === 2) {
        rankDisplay = `🥈 2`;
        rankClass = 'rank-top-2';
      } else if (rank === 3) {
        rankDisplay = `🥉 3`;
        rankClass = 'rank-top-3';
      }

      const totalGames = (athlete.wins || 0) + (athlete.losses || 0);
      const winRate = totalGames > 0 ? Math.round(((athlete.wins || 0) / totalGames) * 100) : 0;

      tr.innerHTML = `
        <td class="rank-badge-cell ${rankClass}">
          ${rankDisplay}
        </td>
        <td>
          <strong>${escapeHtml(athlete.name)}</strong>
          ${isMe ? '<span class="you-tag">You</span>' : ''}
        </td>
        <td style="color:var(--text-muted); font-size:0.82rem; font-family:monospace;">
          ${escapeHtml(athlete.rollNumber)}
        </td>
        <td>
          <span class="opponent-sport-badge">${escapeHtml(athlete.sport)}</span>
        </td>
        <td style="font-weight:800; color: #b45309; font-size:0.95rem;">
          ⭐ ${athlete.elo}
        </td>
        <td>
          <div style="font-weight:600; color:var(--fccu-navy); font-size:0.84rem;">
            ${athlete.wins || 0}W - ${athlete.losses || 0}L (${winRate}%)
          </div>
          <div style="background:#e2e8f0; height:4px; border-radius:2px; margin-top:3px; max-width:80px;">
            <div style="background:var(--fccu-blue); height:4px; border-radius:2px; width:${winRate}%;"></div>
          </div>
        </td>
      `;

      leaderboardBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Initialize
  renderMatches();
  initLeaderboardTabs();
  renderLeaderboard();
});
