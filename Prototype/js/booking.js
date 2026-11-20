/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Court Booking Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Render shared header
  renderSharedNavbar('booking');

  let currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const invitedOpponent = urlParams.get('opponent');
  const paramSport = urlParams.get('sport');

  let activeSport = paramSport || currentUser.selectedSport || 'Badminton';

  // DOM Elements
  const bookingNotificationArea = document.getElementById('bookingNotificationArea');
  const sportTabsContainer = document.getElementById('sportTabsContainer');
  const slotsTableBody = document.getElementById('slotsTableBody');
  const tableHeaderRow = document.getElementById('tableHeaderRow');
  const quotaPill = document.getElementById('quotaPill');
  const facilityNotice = document.getElementById('facilityNotice');
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
  // Render Schedule Override Notice (Ayesha Siddiqui)
  // ==========================================================================
  function renderBookingNotifications() {
    if (!bookingNotificationArea) return;
    if (currentUser.hasOverrideNotice || currentUser.rollNumber === '281140303') {
      bookingNotificationArea.innerHTML = `
        <div class="system-notice-banner" role="alert">
          <span class="banner-icon">📢</span>
          <div>
            <strong>Schedule Notice:</strong> Your 6:00 PM reservation on Badminton Court 2 was overridden by Sports Administration for Varsity/Female-Only practice. Your 1 weekly booking hour has been refunded.
          </div>
        </div>
      `;
    } else {
      bookingNotificationArea.innerHTML = '';
    }
  }

  // ==========================================================================
  // Quota Status UI
  // ==========================================================================
  function updateQuotaUI() {
    if (!quotaPill) return;

    const policy = getBookingPolicy();
    const totalCap = policy.weeklyHourLimit || currentUser.weeklyHoursTotal || 3;
    currentUser.weeklyHoursTotal = totalCap;

    if (currentUser.weeklyHoursRemaining > 0) {
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
                 s.timeSlot === timeSlot
          );

          if (!slot) {
            td.innerHTML = `<div class="slot-booking-card">N/A</div>`;
            tr.appendChild(td);
            return;
          }

          const card = document.createElement('div');
          const isMyBooking = slot.state === 'Booked' && slot.bookedBy && slot.bookedBy.rollNumber === currentUser.rollNumber;

          // State 1: Open
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

            card.querySelector('.btn-card-reserve').addEventListener('click', () => {
              handleReserveSlot(slot);
            });

          // State 2: Booked
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
                  <strong>${escapeHtml(bookedName)}</strong>
                  ${opponentInfo ? `<br><span style="color:#b45309; font-size:0.73rem;">${escapeHtml(opponentInfo)}</span>` : ''}
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

          // State 3: Locked
          } else if (slot.state === 'Locked') {
            card.className = 'slot-booking-card state-locked';
            const reason = slot.lockReason || 'Administrative Block';
            card.innerHTML = `
              <div>
                <div class="slot-top-badge-row">
                  <span class="badge-state badge-locked">🔒 Locked</span>
                </div>
                <div class="slot-card-text" style="color: #991b1b;">
                  <strong>${escapeHtml(reason)}</strong>
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
  // Booking Logic: Enforces Weekly Booking Cap (Student 4 Hamza Tariq check)
  // ==========================================================================
  function handleReserveSlot(slot) {
    const policy = getBookingPolicy();
    const cap = policy.weeklyHourLimit || 3;

    // Strict Enforcement of Weekly Booking Limit
    if (currentUser.weeklyHoursRemaining <= 0) {
      alert(`Weekly Booking Limit Reached: You have used all ${cap}/${cap} allowed booking hours for this week.`);
      showToast(`Weekly Booking Limit Reached (${cap}/${cap} hours used).`, 'error');
      return;
    }

    const opponentTag = invitedOpponent ? ` playing with invited opponent ${invitedOpponent}` : '';
    const confirmMsg = `Confirm 60-Minute Court Reservation?\n\n• Sport: ${slot.sport}\n• Court: ${slot.courtName}\n• Time: ${slot.timeSlot}${opponentTag}\n• Cost: 1 hour from your weekly quota.\n\nProceed?`;
    
    if (!confirm(confirmMsg)) return;

    const allSlots = getCourtSlots();
    const target = allSlots.find(s => s.id === slot.id);
    if (!target || target.state !== 'Open') {
      alert('This slot is no longer available. Please select another open court.');
      renderBookingGrid();
      return;
    }

    // Mark as Booked
    target.state = 'Booked';
    target.bookedBy = {
      name: currentUser.name,
      rollNumber: currentUser.rollNumber,
      isCurrentUser: true,
      opponent: invitedOpponent || 'Casual Practice',
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    saveCourtSlots(allSlots);

    // Deduct 1 hour from student quota
    currentUser.weeklyHoursRemaining = Math.max(0, currentUser.weeklyHoursRemaining - 1);
    currentUser.weeklyHoursUsed = (currentUser.weeklyHoursUsed || 0) + 1;
    saveCurrentUser(currentUser);

    updateQuotaUI();
    renderBookingGrid();
    showToast(`Court reserved successfully! 1 hour deducted (${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} hrs left).`, 'success');
  }

  // ==========================================================================
  // Cancellation Logic: Reverts to "Open" & Restores 1 Hour (Student 1 Bilal Ahmed)
  // ==========================================================================
  function handleCancelBooking(slot) {
    const confirmCancel = confirm(`Cancel your booking for ${slot.courtName} (${slot.timeSlot})?\n\nThis will revert the slot to Open and restore 1 hour back to your weekly quota.`);
    if (!confirmCancel) return;

    const allSlots = getCourtSlots();
    const target = allSlots.find(s => s.id === slot.id);
    if (target) {
      target.state = 'Open';
      target.bookedBy = null;
      saveCourtSlots(allSlots);
    }

    // Restore 1 hour (capped at weekly total)
    const maxTotal = currentUser.weeklyHoursTotal || 3;
    currentUser.weeklyHoursRemaining = Math.min(maxTotal, currentUser.weeklyHoursRemaining + 1);
    currentUser.weeklyHoursUsed = Math.max(0, (currentUser.weeklyHoursUsed || 1) - 1);
    saveCurrentUser(currentUser);

    updateQuotaUI();
    renderBookingGrid();
    showToast(`Booking cancelled. Slot reverted to Open and 1 hour restored (${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} hrs left).`, 'info');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Initial Load
  renderBookingNotifications();
  initSportTabs();
  updateQuotaUI();
  renderBookingGrid();

  if (invitedOpponent) {
    showToast(`Matchmaking active: Select an open court slot to play vs ${invitedOpponent}!`, 'info');
  }
});
