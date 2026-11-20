/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Court Booking Engine (Chunk 2)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Render shared header
  renderSharedNavbar('booking');

  let currentUser = getCurrentUser() || {
    name: 'Muhammad Bilal',
    rollNumber: '251084912',
    elo: 1000,
    weeklyHoursRemaining: 2,
    weeklyHoursTotal: 3,
    selectedSport: 'Badminton',
    noShowCount: 0,
    bookingBanActive: false
  };

  // URL Query Parameters (e.g. from Dashboard "Book Court" button)
  const urlParams = new URLSearchParams(window.location.search);
  const invitedOpponent = urlParams.get('opponent');
  const paramSport = urlParams.get('sport');

  let activeSport = paramSport || currentUser.selectedSport || 'Badminton';

  // DOM Elements
  const sportTabsContainer = document.getElementById('sportTabsContainer');
  const slotsTableBody = document.getElementById('slotsTableBody');
  const tableHeaderRow = document.getElementById('tableHeaderRow');
  const quotaPill = document.getElementById('quotaPill');
  const facilityNotice = document.getElementById('facilityNotice');
  const btnGhostSim = document.getElementById('btnGhostSim');
  const btnGhostReset = document.getElementById('btnGhostReset');
  const noShowStatusNotice = document.getElementById('noShowStatusNotice');
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
  // Quota & No-Show Status UI
  // ==========================================================================
  function updateQuotaUI() {
    if (!quotaPill) return;

    if (currentUser.bookingBanActive) {
      quotaPill.className = 'quota-pill limit-reached';
      quotaPill.innerHTML = `<span>⛔</span> <strong>Booking Privileges Suspended (Ghost Booking Ban)</strong>`;
    } else if (currentUser.weeklyHoursRemaining > 0) {
      quotaPill.className = 'quota-pill available';
      quotaPill.innerHTML = `<span>⏱️</span> <strong>${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} Weekly Hours Remaining</strong>`;
    } else {
      quotaPill.className = 'quota-pill limit-reached';
      quotaPill.innerHTML = `<span>⚠️</span> <strong>0/${currentUser.weeklyHoursTotal} hrs left &bull; Weekly limit reached</strong>`;
    }

    // Top Bar Pill
    const userHoursPill = document.getElementById('userHoursPill');
    if (userHoursPill) {
      userHoursPill.innerHTML = `<span class="icon">⏱️</span> <strong>${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} hrs left</strong>`;
    }

    // Update No-Show status notice
    if (noShowStatusNotice) {
      const count = currentUser.noShowCount || 0;
      if (currentUser.bookingBanActive) {
        noShowStatusNotice.innerHTML = `
          <div class="alert-box alert-error" style="margin: 0; padding: 0.65rem 1rem;">
            <span>⛔</span>
            <div><strong>Active Penalty:</strong> 2nd offense recorded. Court reservation privileges are temporarily suspended under FCCU Intramural Sports regulations.</div>
          </div>
        `;
      } else if (count === 1) {
        noShowStatusNotice.innerHTML = `
          <div class="alert-box alert-warning" style="margin: 0; padding: 0.65rem 1rem;">
            <span>⚠️</span>
            <div><strong>Official Warning (1st Offense):</strong> A ghost booking / no-show was logged for your account. A 2nd offense triggers a mandatory 7-day court ban.</div>
          </div>
        `;
      } else {
        noShowStatusNotice.innerHTML = '';
      }
    }
  }

  // ==========================================================================
  // Sport Filter Tabs
  // ==========================================================================
  function initSportTabs() {
    if (!sportTabsContainer) return;
    sportTabsContainer.innerHTML = '';

    const sports = [
      { name: 'Badminton', icon: '🏸', facility: 'Gymnasium Courts 1 - 4' },
      { name: 'Table Tennis', icon: '🏓', facility: 'Student Center Tables 1 - 4' },
      { name: 'Lawn Tennis', icon: '🎾', facility: 'Outer Hard Courts 1 & 2' }
    ];

    sports.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-sport-tab ${s.name.toLowerCase() === activeSport.toLowerCase() ? 'active' : ''}`;
      btn.innerHTML = `<span>${s.icon}</span> ${s.name}`;

      btn.addEventListener('click', () => {
        activeSport = s.name;
        currentUser.selectedSport = activeSport;
        saveCurrentUser(currentUser);
        initSportTabs();
        renderBookingGrid();
        showToast(`Viewing 60-minute grid for ${activeSport}.`, 'info');
      });

      sportTabsContainer.appendChild(btn);
    });

    if (facilityNotice) {
      const currentObj = sports.find(s => s.name.toLowerCase() === activeSport.toLowerCase());
      facilityNotice.textContent = currentObj ? currentObj.facility : 'FCCU Sports Complex';
    }
  }

  // ==========================================================================
  // Render Interactive 60-Minute Court Booking Grid
  // ==========================================================================
  function renderBookingGrid() {
    const courts = COURT_DEFINITIONS[activeSport] || [];
    const allSlots = getCourtSlots();

    // 1. Render Table Headers
    if (tableHeaderRow) {
      tableHeaderRow.innerHTML = `<th class="time-col-header">Time Interval</th>`;
      courts.forEach(courtName => {
        const th = document.createElement('th');
        th.textContent = courtName;
        tableHeaderRow.appendChild(th);
      });
    }

    // 2. Render Table Rows for each 60-minute interval
    if (slotsTableBody) {
      slotsTableBody.innerHTML = '';

      TIME_SLOTS_60_MIN.forEach((timeSlot, tIdx) => {
        const tr = document.createElement('tr');

        // Column 1: Time Interval Label
        const timeTd = document.createElement('td');
        timeTd.innerHTML = `
          <div class="slot-time-cell">
            ${timeSlot}
            <span>60 Minutes</span>
          </div>
        `;
        tr.appendChild(timeTd);

        // Columns for each Court
        courts.forEach((courtName, cIdx) => {
          const td = document.createElement('td');
          const slot = allSlots.find(
            s => s.sport.toLowerCase() === activeSport.toLowerCase() &&
                 s.courtIndex === cIdx &&
                 s.timeIndex === tIdx
          );

          if (!slot) {
            td.innerHTML = `<div class="slot-booking-card">N/A</div>`;
            tr.appendChild(td);
            return;
          }

          // State-based rendering matching UML: "Open", "Booked", "Locked"
          const card = document.createElement('div');
          const isMyBooking = slot.state === 'Booked' && slot.bookedBy && slot.bookedBy.rollNumber === currentUser.rollNumber;

          if (slot.state === 'Open') {
            card.className = 'slot-booking-card state-open';
            card.innerHTML = `
              <div>
                <div class="slot-top-badge-row">
                  <span class="badge-state badge-open">● Open</span>
                </div>
                <div class="slot-card-text">
                  Available for immediate reservation
                </div>
              </div>
              <button type="button" class="btn-card-action btn-card-reserve">
                <span>⚡</span> Reserve (1 Hr)
              </button>
            `;

            // Booking click handler
            card.querySelector('.btn-card-reserve').addEventListener('click', () => {
              handleReserveSlot(slot);
            });

          } else if (slot.state === 'Booked') {
            card.className = `slot-booking-card state-booked ${isMyBooking ? 'mine' : ''}`;
            const bookedName = slot.bookedBy ? slot.bookedBy.name : 'FCCU Student';
            const opponentInfo = slot.bookedBy && slot.bookedBy.opponent ? `vs ${slot.bookedBy.opponent}` : '';

            card.innerHTML = `
              <div>
                <div class="slot-top-badge-row">
                  <span class="badge-state badge-booked">● Booked</span>
                  ${isMyBooking ? '<span class="you-tag" style="margin:0;">My Court</span>' : ''}
                </div>
                <div class="slot-card-text">
                  <strong>${bookedName}</strong>
                  ${opponentInfo ? `<br><span style="color:#b45309; font-size:0.73rem;">${opponentInfo}</span>` : ''}
                </div>
              </div>
              ${isMyBooking ? `
                <button type="button" class="btn-card-action btn-card-cancel">
                  <span>✕</span> Cancel My Booking
                </button>
              ` : `
                <div style="font-size: 0.72rem; color: #92400e; margin-top: 0.4rem; font-weight:600;">
                  Reserved &bull; In Use
                </div>
              `}
            `;

            if (isMyBooking) {
              card.querySelector('.btn-card-cancel').addEventListener('click', () => {
                handleCancelBooking(slot);
              });
            }

          } else if (slot.state === 'Locked') {
            card.className = 'slot-booking-card state-locked';
            const reason = slot.lockReason || 'Administrative Block';
            card.innerHTML = `
              <div>
                <div class="slot-top-badge-row">
                  <span class="badge-state badge-locked">🔒 Locked</span>
                </div>
                <div class="slot-card-text" style="color: #991b1b;">
                  <strong>${reason}</strong>
                </div>
              </div>
              <div style="font-size: 0.72rem; color: #b91c1c; margin-top: 0.4rem; font-weight:600;">
                Restricted by Sports Directorate
              </div>
            `;
          }

          td.appendChild(card);
          tr.appendChild(td);
        });

        slotsTableBody.appendChild(tr);
      });
    }
  }

  // ==========================================================================
  // Booking Logic: First-come-first-serve, 1-hour deduction, limits
  // ==========================================================================
  function handleReserveSlot(slot) {
    // 1. Check for Active Booking Ban
    if (currentUser.bookingBanActive) {
      alert('Action Blocked: Your court booking privileges have been suspended due to repeated ghost bookings / no-shows. Contact Sports Complex Admin.');
      showToast('Booking blocked: Account suspended.', 'error');
      return;
    }

    // 2. Check Weekly Booking Allowance (Max 3 hrs/week)
    if (currentUser.weeklyHoursRemaining <= 0) {
      alert('Weekly booking hour limit reached. (Maximum 3 hours allocated per student per week).');
      showToast('Weekly booking hour limit reached.', 'error');
      return;
    }

    // 3. Confirm Reservation
    const opponentTag = invitedOpponent ? ` playing with invited opponent ${invitedOpponent}` : '';
    const confirmMsg = `Confirm 60-Minute Court Reservation?\n\n• Sport: ${slot.sport}\n• Court: ${slot.courtName}\n• Time: ${slot.timeSlot}${opponentTag}\n• Cost: 1 hour from your weekly allowance.\n\nProceed?`;
    
    if (!confirm(confirmMsg)) return;

    // 4. Update Slot State to "Booked"
    const allSlots = getCourtSlots();
    const target = allSlots.find(s => s.id === slot.id);
    if (!target || target.state !== 'Open') {
      alert('This slot was just claimed by another student. Please pick another open slot.');
      renderBookingGrid();
      return;
    }

    target.state = 'Booked';
    target.bookedBy = {
      name: currentUser.name,
      rollNumber: currentUser.rollNumber,
      isCurrentUser: true,
      opponent: invitedOpponent || 'Open Opponent',
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    saveCourtSlots(allSlots);

    // 5. Deduct 1 hour from weekly allowance
    currentUser.weeklyHoursRemaining = Math.max(0, currentUser.weeklyHoursRemaining - 1);
    saveCurrentUser(currentUser);

    // 6. Create a Pending Match record if invited opponent was specified
    if (invitedOpponent) {
      const matches = getMatches();
      matches.unshift({
        id: `match-${Date.now()}`,
        sport: slot.sport,
        court: slot.courtName,
        date: `Today, ${slot.timeSlot.split(' - ')[0]}`,
        player1: {
          name: currentUser.name,
          rollNumber: currentUser.rollNumber,
          elo: currentUser.elo,
          submission: null
        },
        player2: {
          name: invitedOpponent,
          rollNumber: '251019283',
          elo: 1020,
          submission: null
        },
        status: 'Pending',
        eloChange: null,
        notes: 'Casual intramural court booking'
      });
      saveMatches(matches);
    }

    updateQuotaUI();
    renderBookingGrid();
    showToast(`Court reserved successfully! 1 hour deducted (${currentUser.weeklyHoursRemaining}/3 hrs left).`, 'success');
  }

  // ==========================================================================
  // Cancellation Logic: Revert to "Open" & Restore 1 Hour
  // ==========================================================================
  function handleCancelBooking(slot) {
    const confirmCancel = confirm(`Cancel your booking for ${slot.courtName} at ${slot.timeSlot}?\n\nThis will restore 1 hour back to your weekly allowance.`);
    if (!confirmCancel) return;

    const allSlots = getCourtSlots();
    const target = allSlots.find(s => s.id === slot.id);
    if (target) {
      target.state = 'Open';
      target.bookedBy = null;
      saveCourtSlots(allSlots);
    }

    // Restore 1 hour (capped at weekly total 3)
    currentUser.weeklyHoursRemaining = Math.min(currentUser.weeklyHoursTotal || 3, currentUser.weeklyHoursRemaining + 1);
    saveCurrentUser(currentUser);

    updateQuotaUI();
    renderBookingGrid();
    showToast(`Booking cancelled. 1 hour restored (${currentUser.weeklyHoursRemaining}/3 hrs left).`, 'info');
  }

  // ==========================================================================
  // No-Show Simulation (Ghost Booking Warning & 2nd Offense Ban)
  // ==========================================================================
  if (btnGhostSim) {
    btnGhostSim.addEventListener('click', () => {
      currentUser.noShowCount = (currentUser.noShowCount || 0) + 1;

      if (currentUser.noShowCount === 1) {
        alert(
          '⚠️ 1st Offense Notice (Simulated):\n\nA ghost booking / no-show was detected at the FCCU Sports Complex.\n\nUnder University Sports Policy, your account has received an official 1st warning. A 2nd offense will result in an immediate temporary booking ban.'
        );
        showToast('1st No-Show warning logged to student profile.', 'warning');
      } else {
        currentUser.bookingBanActive = true;
        alert(
          '⛔ 2nd Offense Penalized (Simulated):\n\nRepeated ghost booking detected! Your court reservation privileges have now been temporarily FROZEN.\n\nYou cannot reserve further court slots until cleared by the Sports Directorate.'
        );
        showToast('2nd No-Show offense: Court booking privileges suspended!', 'error');
      }

      saveCurrentUser(currentUser);
      updateQuotaUI();
      renderBookingGrid();
    });
  }

  if (btnGhostReset) {
    btnGhostReset.addEventListener('click', () => {
      currentUser.noShowCount = 0;
      currentUser.bookingBanActive = false;
      saveCurrentUser(currentUser);
      updateQuotaUI();
      renderBookingGrid();
      showToast('No-show violations reset to clean standing.', 'success');
    });
  }

  // Initial Load
  initSportTabs();
  updateQuotaUI();
  renderBookingGrid();

  // If redirected from matchmaking with opponent
  if (invitedOpponent) {
    showToast(`Matchmaking link active: Pick an open court slot to play against ${invitedOpponent}!`, 'info');
  }
});

