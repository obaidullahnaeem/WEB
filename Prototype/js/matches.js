/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Dual Score Confirmation & Leaderboard (Chunk 2)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Render shared navigation
  renderSharedNavbar('matches');

  let currentUser = getCurrentUser() || {
    name: 'Muhammad Bilal',
    rollNumber: '251084912',
    elo: 1000,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    selectedSport: 'Badminton'
  };

  // State
  let activeLeaderboardSport = 'All'; // 'All' | 'Badminton' | 'Table Tennis' | 'Lawn Tennis'

  // DOM Elements - Matches Section
  const matchesListContainer = document.getElementById('matchesListContainer');
  const btnResetMatches = document.getElementById('btnResetMatches');
  const btnAddSampleMatch = document.getElementById('btnAddSampleMatch');

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

    if (matches.length === 0) {
      matchesListContainer.innerHTML = `
        <div class="empty-opponents-box">
          <div class="empty-icon">🎾</div>
          <h3>No Recorded Intramural Matches</h3>
          <p>You have not played or booked any matches yet. Visit the Court Booking grid to reserve a slot!</p>
        </div>
      `;
      return;
    }

    matches.forEach(m => {
      const card = document.createElement('div');
      card.className = 'match-card';

      // Status badge style
      let statusBadgeClass = 'badge-booked';
      let statusIcon = '⏳';
      if (m.status === 'Confirmed') {
        statusBadgeClass = 'badge-open';
        statusIcon = '✅';
      } else if (m.status === 'Flagged') {
        statusBadgeClass = 'badge-locked';
        statusIcon = '🚩';
      } else if (m.status === 'Voided') {
        statusBadgeClass = 'badge-booked';
        statusIcon = '⚪';
      }

      // Check user's and opponent's submissions
      const userSub = m.player1.submission;
      const oppSub = m.player2.submission;

      card.innerHTML = `
        <div class="match-card-header">
          <div class="match-info-meta">
            <span style="font-weight:700; color:var(--fccu-navy);">${escapeHtml(m.sport)}</span>
            <span>&bull;</span>
            <span>${escapeHtml(m.court)}</span>
            <span>&bull;</span>
            <span>${escapeHtml(m.date)}</span>
          </div>
          <span class="badge-state ${statusBadgeClass}">
            ${statusIcon} ${m.status}
          </span>
        </div>

        <div class="match-versus-grid">
          <!-- Player 1 (Current User) -->
          <div class="player-side-box">
            <div class="avatar-circle" style="width:36px; height:36px; font-size:0.85rem;">
              ${m.player1.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style="font-weight:700; font-size:0.95rem;">
                ${escapeHtml(m.player1.name)} <span class="you-tag">You</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">
                Rating: <strong>${m.player1.elo} Elo</strong> &bull; Submission: <strong>${userSub ? escapeHtml(userSub) : 'Pending'}</strong>
              </div>
            </div>
          </div>

          <!-- VS Badge -->
          <div class="vs-badge-circle">VS</div>

          <!-- Player 2 (Opponent) -->
          <div class="player-side-box align-right">
            <div style="text-align:right;">
              <div style="font-weight:700; font-size:0.95rem;">
                ${escapeHtml(m.player2.name)}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">
                Rating: <strong>${m.player2.elo} Elo</strong> &bull; Submission: <strong>${oppSub ? escapeHtml(oppSub) : 'Pending'}</strong>
              </div>
            </div>
            <div class="avatar-circle" style="width:36px; height:36px; font-size:0.85rem; background: #0369a1;">
              ${m.player2.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
          </div>
        </div>

        <!-- Dynamic Action Area based on Status -->
        <div class="match-actions-area">
          ${m.status === 'Pending' ? `
            <div class="dual-score-box">
              <div style="font-size: 0.82rem; font-weight:700; color:var(--fccu-navy); display:flex; align-items:center; justify-content:space-between;">
                <span>Dual Score Confirmation Protocol:</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Both athletes must confirm consistent outcome</span>
              </div>

              <div class="dual-score-controls-row">
                <!-- User Submission Buttons -->
                <div class="user-score-buttons">
                  <span style="font-size:0.82rem; font-weight:600; color:var(--text-secondary);">Your Result:</span>
                  <button type="button" class="btn-score-choice btn-score-win ${userSub === 'Win' ? 'active' : ''}" data-match="${m.id}" data-action="user-win">
                    🏆 Submit Win
                  </button>
                  <button type="button" class="btn-score-choice btn-score-loss ${userSub === 'Loss' ? 'active' : ''}" data-match="${m.id}" data-action="user-loss">
                    Submit Loss
                  </button>
                </div>

                <!-- Opponent Submission Simulator Dropdown -->
                <div class="sim-opponent-box">
                  <span style="font-size:0.78rem; font-weight:700; color:#92400e;">⚡ Simulate ${escapeHtml(m.player2.name.split(' ')[0])}:</span>
                  <select class="sim-select" data-match="${m.id}">
                    <option value="" ${!oppSub ? 'selected' : ''}>-- Pending Opponent Action --</option>
                    <option value="Loss" ${oppSub === 'Loss' ? 'selected' : ''}>Submits Loss</option>
                    <option value="Win" ${oppSub === 'Win' ? 'selected' : ''}>Submits Win</option>
                  </select>
                </div>
              </div>
            </div>
          ` : ''}

          ${m.status === 'Confirmed' ? `
            <div class="elo-breakdown-card">
              <span style="font-size:1.3rem;">📐</span>
              <div>
                <strong>Elo Math Breakdown:</strong> ${escapeHtml(m.mathBreakdown || 'Dual confirmation verified. Transparent Elo change applied.')}
                <div style="font-size:0.75rem; color:#0284c7; margin-top:0.2rem;">
                  Official Result: ${escapeHtml(m.player1.submission === 'Win' ? m.player1.name + ' won' : m.player2.name + ' won')} &bull; Status: Completed
                </div>
              </div>
            </div>
          ` : ''}

          ${m.status === 'Flagged' ? `
            <div class="dispute-flagged-card">
              <span style="font-size:1.3rem;">⚠️</span>
              <div>
                <strong>Conflicting Scores Flagged:</strong> Both athletes claimed "Win". Match is frozen with <strong>Zero Elo deduction</strong> and pushed to the Admin Dispute Queue.
                <div style="font-size:0.75rem; color:#be123c; margin-top:0.2rem;">
                  Pending review by Head of Sports / Coach on Admin Dashboard.
                </div>
              </div>
            </div>
          ` : ''}

          ${m.status === 'Voided' ? `
            <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:var(--radius-md); padding:0.75rem 1rem; font-size:0.82rem; color:var(--text-muted);">
              ⚪ <strong>Match Voided:</strong> Resolved by Admin without penalty or rating deduction.
            </div>
          ` : ''}
        </div>
      `;

      // Attach event listeners for Pending matches
      if (m.status === 'Pending') {
        const btnWin = card.querySelector('[data-action="user-win"]');
        const btnLoss = card.querySelector('[data-action="user-loss"]');
        const simSelect = card.querySelector('.sim-select');

        if (btnWin) {
          btnWin.addEventListener('click', () => {
            handleScoreSubmission(m.id, 'Win', simSelect ? simSelect.value : null);
          });
        }

        if (btnLoss) {
          btnLoss.addEventListener('click', () => {
            handleScoreSubmission(m.id, 'Loss', simSelect ? simSelect.value : null);
          });
        }

        if (simSelect) {
          simSelect.addEventListener('change', (e) => {
            handleOpponentSimChange(m.id, e.target.value);
          });
        }
      }

      matchesListContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // Dual Score Confirmation Logic
  // ==========================================================================
  function handleScoreSubmission(matchId, userChoice, opponentChoice) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    match.player1.submission = userChoice;
    if (opponentChoice) {
      match.player2.submission = opponentChoice;
    }

    evaluateDualScores(match, matches);
  }

  function handleOpponentSimChange(matchId, oppChoice) {
    const matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    match.player2.submission = oppChoice || null;
    evaluateDualScores(match, matches);
  }

  function evaluateDualScores(match, matches) {
    const s1 = match.player1.submission;
    const s2 = match.player2.submission;

    // Both must have submitted to evaluate
    if (!s1 || !s2) {
      saveMatches(matches);
      renderMatches();
      showToast(`Your score (${s1 || 'Pending'}) logged. Awaiting opponent submission.`, 'info');
      return;
    }

    // CASE 1: Consistent Outcome (One Win, One Loss)
    if ((s1 === 'Win' && s2 === 'Loss') || (s1 === 'Loss' && s2 === 'Win')) {
      match.status = 'Confirmed';

      const userOutcome = s1 === 'Win' ? 1 : 0;
      const eloCalc = calculateElo(match.player1.elo, match.player2.elo, userOutcome, 32);

      // Transparent Elo math breakdown
      const winnerName = s1 === 'Win' ? match.player1.name : match.player2.name;
      const deltaUserStr = eloCalc.changeA >= 0 ? `+${eloCalc.changeA}` : `${eloCalc.changeA}`;
      const deltaOppStr = eloCalc.changeB >= 0 ? `+${eloCalc.changeB}` : `${eloCalc.changeB}`;

      match.eloChange = eloCalc.changeA;
      match.mathBreakdown = `${match.player1.name}: ${match.player1.elo} ${deltaUserStr} = ${eloCalc.newRatingA} Elo | ${match.player2.name}: ${match.player2.elo} ${deltaOppStr} = ${eloCalc.newRatingB} Elo (K=32, ${eloCalc.expectedPercentA}% win prob)`;

      // Apply rating updates to current user
      currentUser.elo = eloCalc.newRatingA;
      saveCurrentUser(currentUser);

      // Update Top Bar Elo in real-time
      const userEloPill = document.getElementById('userEloPill');
      if (userEloPill) {
        userEloPill.innerHTML = `<span class="icon">🏆</span> <strong>${currentUser.elo} Elo</strong>`;
      }

      // Update Roster for both players
      const roster = getRoster();
      const p1Roster = roster.find(r => r.rollNumber === currentUser.rollNumber);
      if (p1Roster) {
        p1Roster.elo = eloCalc.newRatingA;
        if (s1 === 'Win') p1Roster.wins += 1;
        else p1Roster.losses += 1;
      }

      const p2Roster = roster.find(r => r.name === match.player2.name);
      if (p2Roster) {
        p2Roster.elo = eloCalc.newRatingB;
        if (s2 === 'Win') p2Roster.wins += 1;
        else p2Roster.losses += 1;
      }
      saveRoster(roster);

      saveMatches(matches);
      renderMatches();
      renderLeaderboard();
      showToast(`Scores confirmed! ${winnerName} won. Elo adjusted by ${deltaUserStr} points.`, 'success');

    } 
    // CASE 2: Conflict (Both claim Win, or both claim Loss)
    else {
      match.status = 'Flagged';
      match.eloChange = 0;
      match.notes = `Score Conflict: Player 1 submitted "${s1}" and Player 2 submitted "${s2}". Zero Elo deduction. Pushed to dispute queue.`;

      // Save to Admin Dispute Queue
      let disputes = [];
      try {
        disputes = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_DISPUTES)) || [];
      } catch (e) {
        disputes = [];
      }

      if (!disputes.some(d => d.id === match.id)) {
        disputes.push({
          ...match,
          flaggedAt: new Date().toLocaleString()
        });
        localStorage.setItem(STORAGE_KEYS.ADMIN_DISPUTES, JSON.stringify(disputes));
      }

      saveMatches(matches);
      renderMatches();
      showToast('⚠️ Score Conflict! Both athletes submitted the same outcome. Match flagged for Admin review.', 'warning');
    }
  }

  // Demo buttons for resetting or adding sample matches
  if (btnResetMatches) {
    btnResetMatches.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.MATCHES);
      getMatches(); // re-seeds
      renderMatches();
      showToast('Match history reset to standard demo scenario.', 'info');
    });
  }

  if (btnAddSampleMatch) {
    btnAddSampleMatch.addEventListener('click', () => {
      const matches = getMatches();
      matches.unshift({
        id: `match-${Date.now()}`,
        sport: 'Badminton',
        court: 'Gymnasium Court 4',
        date: 'Today, 05:00 PM',
        player1: {
          name: currentUser.name,
          rollNumber: currentUser.rollNumber,
          elo: currentUser.elo,
          submission: null
        },
        player2: {
          name: 'Farhan Akram',
          rollNumber: '241088492',
          elo: 1190,
          submission: null
        },
        status: 'Pending',
        eloChange: null,
        notes: 'Casual match'
      });
      saveMatches(matches);
      renderMatches();
      showToast('New Pending match with Farhan Akram added.', 'success');
    });
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

    const roster = getRoster();

    // Filter by sport
    let filtered = roster;
    if (activeLeaderboardSport !== 'All') {
      filtered = roster.filter(s => s.sport.toLowerCase() === activeLeaderboardSport.toLowerCase());
    }

    // Sort descending by Elo Rating
    filtered.sort((a, b) => b.elo - a.elo);

    if (leaderboardPlayerCount) {
      leaderboardPlayerCount.textContent = `${filtered.length} Athletes Ranked`;
    }

    // Render Table Rows
    // STRICT PRIVACY RULE: Display ONLY Rank, Name, Roll No, Sport, Elo, and Win/Loss record.
    // Strictly hide CNIC, CGPA, and Disciplinary Holds from this public view.
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

      const totalGames = athlete.wins + athlete.losses;
      const winRate = totalGames > 0 ? Math.round((athlete.wins / totalGames) * 100) : 0;

      tr.innerHTML = `
        <td class="rank-badge-cell ${rankClass}">
          ${rankDisplay}
        </td>
        <td>
          <strong>${escapeHtml(athlete.name)}</strong>
          ${isMe ? '<span class="you-tag">You</span>' : ''}
        </td>
        <td style="color:var(--text-muted); font-size:0.82rem;">
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
            ${athlete.wins}W - ${athlete.losses}L (${winRate}%)
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

