/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Dashboard & Matchmaking Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user session exists, else return to login
  let currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // State
  let activeSport = currentUser.selectedSport || 'Badminton';
  let isRangeExpanded = false; // false = ±150 Elo, true = ±250 Elo
  let activeOpponentForChat = null;

  // DOM Elements - Top Bar
  const userDisplayName = document.getElementById('userDisplayName');
  const userRollNumber = document.getElementById('userRollNumber');
  const userAvatarCircle = document.getElementById('userAvatarCircle');
  const userEloVal = document.getElementById('userEloVal');
  const userHoursVal = document.getElementById('userHoursVal');
  const btnLogout = document.getElementById('btnLogout');
  const systemNotificationArea = document.getElementById('systemNotificationArea');

  // DOM Elements - Availability Panel
  const sportSelect = document.getElementById('sportSelect');
  const playNowToggle = document.getElementById('playNowToggle');
  const playNowCard = document.getElementById('playNowCard');
  const playNowStatusText = document.getElementById('playNowStatusText');
  const slotsContainer = document.getElementById('slotsContainer');
  const btnSelectAllSlots = document.getElementById('btnSelectAllSlots');
  const btnClearAllSlots = document.getElementById('btnClearAllSlots');
  const syncStatusIndicator = document.getElementById('syncStatusIndicator');

  // DOM Elements - Matchmaking Section
  const btnFindOpponent = document.getElementById('btnFindOpponent');
  const btnExpandRange = document.getElementById('btnExpandRange');
  const bracketBadge = document.getElementById('bracketBadge');
  const bracketRangeValues = document.getElementById('bracketRangeValues');
  const opponentCountBadge = document.getElementById('opponentCountBadge');
  const opponentsGrid = document.getElementById('opponentsGrid');

  // DOM Elements - Chat Modal
  const chatModal = document.getElementById('chatModal');
  const btnCloseChat = document.getElementById('btnCloseChat');
  const chatOpponentName = document.getElementById('chatOpponentName');
  const chatOpponentDetails = document.getElementById('chatOpponentDetails');
  const chatAvatar = document.getElementById('chatAvatar');
  const chatSummarySport = document.getElementById('chatSummarySport');
  const chatSummaryElo = document.getElementById('chatSummaryElo');
  const chatMessagesList = document.getElementById('chatMessagesList');
  const chatInput = document.getElementById('chatInput');
  const btnSendChat = document.getElementById('btnSendChat');
  const quickChipsContainer = document.getElementById('quickChipsContainer');

  // DOM Elements - Toasts
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================================================
  // Helper: Toast Notification
  // ==========================================================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚡';
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
    }, 3500);
  }

  // ==========================================================================
  // Render System Notification Banner (e.g. Ayesha Siddiqui Override Notice)
  // ==========================================================================
  function renderSystemNotifications() {
    if (!systemNotificationArea) return;
    
    // Check if user has an override notice (e.g., Ayesha Siddiqui Roll 281140303)
    if (currentUser.hasOverrideNotice || currentUser.rollNumber === '281140303') {
      const noticeMsg = currentUser.overrideMessage || 
        'Schedule Notice: Your 6:00 PM reservation on Badminton Court 2 was overridden by Sports Administration for Varsity/Female-Only practice. Your 1 weekly booking hour has been refunded.';
      
      systemNotificationArea.innerHTML = `
        <div class="system-notice-banner" role="alert">
          <span class="banner-icon">📢</span>
          <div>
            <strong>Schedule Notice:</strong> Your 6:00 PM reservation on Badminton Court 2 was overridden by Sports Administration for Varsity/Female-Only practice. Your 1 weekly booking hour has been refunded.
          </div>
        </div>
      `;
    } else {
      systemNotificationArea.innerHTML = '';
    }
  }

  // ==========================================================================
  // Render Top Bar Info
  // ==========================================================================
  function renderTopBar() {
    if (userDisplayName) userDisplayName.textContent = currentUser.name;
    if (userRollNumber) userRollNumber.textContent = `Roll No: ${currentUser.rollNumber}`;
    
    if (userAvatarCircle) {
      const parts = currentUser.name.trim().split(' ');
      const initials = parts.length > 1 
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
        : parts[0].slice(0, 2).toUpperCase();
      userAvatarCircle.textContent = initials;
    }

    if (userEloVal) {
      userEloVal.textContent = currentUser.elo;
    }

    if (userHoursVal) {
      userHoursVal.textContent = `${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} hrs left`;
    }
  }

  // Logout handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.location.href = 'index.html';
    });
  }

  // ==========================================================================
  // Availability Panel
  // ==========================================================================
  function initAvailabilityPanel() {
    if (sportSelect) {
      sportSelect.value = activeSport;
      sportSelect.addEventListener('change', (e) => {
        activeSport = e.target.value;
        currentUser.selectedSport = activeSport;
        saveCurrentUser(currentUser);
        isRangeExpanded = false;
        renderOpponents();
        showToast(`Sport switched to ${activeSport}. Matchmaking refreshed.`, 'info');
      });
    }

    if (playNowToggle && playNowCard) {
      playNowToggle.checked = !!currentUser.playNowActive;
      updatePlayNowVisuals(currentUser.playNowActive);

      playNowToggle.addEventListener('change', (e) => {
        const isLive = e.target.checked;
        currentUser.playNowActive = isLive;
        saveCurrentUser(currentUser);
        updatePlayNowVisuals(isLive);
        
        if (isLive) {
          showToast('🟢 "Play Now" Beacon Active: You are now visible to players on campus at the Sports Complex!', 'success');
        } else {
          showToast('⚪ "Play Now" Deactivated: Matchmaking set to scheduled mode.', 'info');
        }
      });
    }

    renderWeeklySlots();

    if (btnSelectAllSlots) {
      btnSelectAllSlots.addEventListener('click', () => {
        currentUser.freeSlots = [...DEFAULT_WEEKLY_SLOTS];
        saveCurrentUser(currentUser);
        renderWeeklySlots();
        flashSyncTag('All weekly time slots selected');
      });
    }

    if (btnClearAllSlots) {
      btnClearAllSlots.addEventListener('click', () => {
        currentUser.freeSlots = [];
        saveCurrentUser(currentUser);
        renderWeeklySlots();
        flashSyncTag('Weekly schedule cleared');
      });
    }
  }

  function updatePlayNowVisuals(isActive) {
    if (isActive) {
      playNowCard.classList.add('active');
      playNowStatusText.textContent = 'Available Now at Sports Complex';
      playNowStatusText.style.color = '#047857';
      playNowStatusText.style.fontWeight = '700';
    } else {
      playNowCard.classList.remove('active');
      playNowStatusText.textContent = 'Offline / Scheduled Intramural Matches Only';
      playNowStatusText.style.color = '#64748b';
      playNowStatusText.style.fontWeight = '500';
    }
  }

  function renderWeeklySlots() {
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';

    const savedSlots = currentUser.freeSlots || [];

    DEFAULT_WEEKLY_SLOTS.forEach((slotText, idx) => {
      const isChecked = savedSlots.includes(slotText);
      const slotItem = document.createElement('label');
      slotItem.className = `slot-item ${isChecked ? 'checked' : ''}`;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isChecked;
      checkbox.id = `slot_${idx}`;

      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!currentUser.freeSlots) currentUser.freeSlots = [];
          if (!currentUser.freeSlots.includes(slotText)) {
            currentUser.freeSlots.push(slotText);
          }
          slotItem.classList.add('checked');
        } else {
          currentUser.freeSlots = (currentUser.freeSlots || []).filter(s => s !== slotText);
          slotItem.classList.remove('checked');
        }
        saveCurrentUser(currentUser);
        flashSyncTag('Free slots synced');
      });

      const labelText = document.createElement('span');
      labelText.textContent = slotText;

      slotItem.appendChild(checkbox);
      slotItem.appendChild(labelText);
      slotsContainer.appendChild(slotItem);
    });
  }

  function flashSyncTag(msg = 'Schedule synced') {
    if (!syncStatusIndicator) return;
    syncStatusIndicator.innerHTML = `<span>✓</span> ${msg}`;
    syncStatusIndicator.style.opacity = '1';
    setTimeout(() => {
      syncStatusIndicator.style.opacity = '0.7';
    }, 2000);
  }

  // ==========================================================================
  // Matchmaking Engine: Filtering within ±150 or ±250 Elo
  // ==========================================================================
  function renderOpponents() {
    if (!opponentsGrid) return;
    opponentsGrid.innerHTML = '';

    const userElo = currentUser.elo || 1000;
    const deltaAllowed = isRangeExpanded ? 250 : 150;
    const minElo = userElo - deltaAllowed;
    const maxElo = userElo + deltaAllowed;

    if (bracketBadge) {
      if (isRangeExpanded) {
        bracketBadge.className = 'bracket-badge expanded';
        bracketBadge.textContent = 'Expanded Bracket (±250 Elo)';
      } else {
        bracketBadge.className = 'bracket-badge';
        bracketBadge.textContent = 'Standard Bracket (±150 Elo)';
      }
    }

    if (bracketRangeValues) {
      bracketRangeValues.textContent = `Elo ${minElo} - ${maxElo} | Sport: ${activeSport}`;
    }

    if (btnExpandRange) {
      if (isRangeExpanded) {
        btnExpandRange.classList.add('expanded-active');
        btnExpandRange.innerHTML = `<span>🔍</span> Reset to ±150 Elo`;
      } else {
        btnExpandRange.classList.remove('expanded-active');
        btnExpandRange.innerHTML = `<span>⚡</span> Expand Range (±250 Elo)`;
      }
    }

    // Get fresh athletes from persistent student DB
    const allStudents = getStudents();
    const candidateOpponents = allStudents.filter(s => {
      // Exclude current student
      if (s.rollNumber === currentUser.rollNumber) return false;
      // Exclude athletes with active disciplinary hold
      if (s.disciplinaryHold === true) return false;
      // Sport match
      const sportMatches = s.sport.toLowerCase() === activeSport.toLowerCase();
      // Elo delta
      const eloDifference = Math.abs(s.elo - userElo);
      return sportMatches && (eloDifference <= deltaAllowed);
    });

    if (opponentCountBadge) {
      opponentCountBadge.textContent = `${candidateOpponents.length} Player${candidateOpponents.length === 1 ? '' : 's'} Available`;
    }

    if (candidateOpponents.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'empty-opponents-box';
      emptyBox.innerHTML = `
        <div class="empty-icon">🏸</div>
        <h3>No FCCU Athletes Found in ±${deltaAllowed} Elo Range</h3>
        <p>No active students currently match the <strong>${activeSport}</strong> criteria within ${minElo} - ${maxElo} Elo. Expand your skill bracket to find more campus opponents.</p>
        ${!isRangeExpanded ? `
          <button type="button" class="btn-expand-range" style="margin: 0.75rem auto 0;" id="btnEmptyExpand">
            <span>⚡</span> Expand Range (±250 Elo)
          </button>
        ` : ''}
      `;
      opponentsGrid.appendChild(emptyBox);

      const btnEmptyExpand = document.getElementById('btnEmptyExpand');
      if (btnEmptyExpand) {
        btnEmptyExpand.addEventListener('click', () => {
          isRangeExpanded = true;
          renderOpponents();
          showToast('Search radius expanded to ±250 Elo.', 'info');
        });
      }
      return;
    }

    // STRICT PRIVACY RULE: Display ONLY Name, Sport, Elo Rank, and Recent Win/Loss Record.
    // Strictly protect CNIC, CGPA, and Disciplinary Holds from public cards.
    candidateOpponents.forEach(opp => {
      const card = document.createElement('div');
      card.className = 'opponent-card';

      const diff = opp.elo - userElo;
      let diffText = 'Even Match';
      let diffClass = 'balanced';
      if (diff > 0) {
        diffText = `+${diff} Elo`;
      } else if (diff < 0) {
        diffText = `${diff} Elo`;
      }
      if (Math.abs(diff) > 150) {
        diffClass = 'extended';
      }

      const oppInitials = opp.name.split(' ').map(n => n[0]).join('').slice(0, 2);
      const recordText = `${opp.wins || 0}W - ${opp.losses || 0}L`;

      card.innerHTML = `
        <div>
          <div class="card-top-row">
            <div class="opponent-avatar-row">
              <div class="opponent-avatar">${oppInitials}</div>
              <div class="opponent-name-block">
                <h3>${escapeHtml(opp.name)}</h3>
                <span class="opponent-sport-badge">${escapeHtml(opp.sport)}</span>
              </div>
            </div>
            <span class="elo-delta-badge ${diffClass}">${diffText}</span>
          </div>

          <!-- Public Athletic Stats ONLY: Elo Rank and Win/Loss Record -->
          <div class="card-stats-grid">
            <div class="stat-cell">
              <span class="label">Elo Rating</span>
              <span class="value elo-highlight">⭐ ${opp.elo}</span>
            </div>
            <div class="stat-cell">
              <span class="label">Intramural Record</span>
              <span class="value record-highlight">📊 ${recordText}</span>
            </div>
          </div>
        </div>

        <div class="card-actions-row">
          <button type="button" class="btn-invite-chat" data-id="${opp.id}">
            <span>💬</span> Send Invite &amp; Chat
          </button>
          <a href="booking.html?opponent=${encodeURIComponent(opp.name)}&sport=${encodeURIComponent(opp.sport)}" class="btn-book-court">
            <span>📅</span> Book Court
          </a>
        </div>
      `;

      card.querySelector('.btn-invite-chat').addEventListener('click', () => {
        openChatModal(opp);
      });

      opponentsGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // Pre-Match Chat Modal Logic
  // ==========================================================================
  function openChatModal(opponent) {
    activeOpponentForChat = opponent;
    if (!chatModal) return;

    if (chatOpponentName) chatOpponentName.textContent = opponent.name;
    if (chatOpponentDetails) chatOpponentDetails.textContent = `FCCU Intramural Player • ${opponent.sport}`;
    if (chatAvatar) {
      chatAvatar.textContent = opponent.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    }
    if (chatSummarySport) chatSummarySport.textContent = opponent.sport;
    if (chatSummaryElo) chatSummaryElo.textContent = `Elo: ${opponent.elo}`;

    loadChatMessages(opponent.id);
    renderQuickChips(opponent);

    chatModal.classList.remove('hidden');
    if (chatInput) chatInput.focus();
  }

  function closeChatModal() {
    if (!chatModal) return;
    chatModal.classList.add('hidden');
    activeOpponentForChat = null;
  }

  function getChatStorageKey(oppId) {
    return `${STORAGE_KEYS.CHAT_HISTORY}_${currentUser.rollNumber}_${oppId}`;
  }

  function loadChatMessages(oppId) {
    if (!chatMessagesList) return;
    chatMessagesList.innerHTML = '';

    const key = getChatStorageKey(oppId);
    let messages = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) messages = JSON.parse(stored);
    } catch (e) {
      messages = [];
    }

    if (messages.length === 0) {
      messages = [
        {
          type: 'system',
          text: `Match handshake initiated with ${activeOpponentForChat.name} (${activeOpponentForChat.sport}).`,
          time: 'Just now'
        },
        {
          type: 'outgoing',
          text: `Hi ${activeOpponentForChat.name}! Are you open for an intramural match at the FCCU Sports Complex this week?`,
          time: formatTime(new Date())
        }
      ];
      localStorage.setItem(key, JSON.stringify(messages));
    }

    messages.forEach(msg => appendChatMessageToDOM(msg));
    scrollChatToBottom();
  }

  function appendChatMessageToDOM(msg) {
    if (!chatMessagesList) return;
    const msgEl = document.createElement('div');
    if (msg.type === 'system') {
      msgEl.className = 'chat-msg msg-system';
      msgEl.textContent = msg.text;
    } else if (msg.type === 'outgoing') {
      msgEl.className = 'chat-msg msg-outgoing';
      msgEl.innerHTML = `
        <div>${escapeHtml(msg.text)}</div>
        <span class="msg-time">${msg.time}</span>
      `;
    } else {
      msgEl.className = 'chat-msg msg-incoming';
      msgEl.innerHTML = `
        <div>${escapeHtml(msg.text)}</div>
        <span class="msg-time">${msg.time}</span>
      `;
    }
    chatMessagesList.appendChild(msgEl);
  }

  function sendUserChatMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || !activeOpponentForChat) return;

    const key = getChatStorageKey(activeOpponentForChat.id);
    let messages = [];
    try {
      messages = JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      messages = [];
    }

    const newMsg = {
      type: 'outgoing',
      text: trimmed,
      time: formatTime(new Date())
    };

    messages.push(newMsg);
    localStorage.setItem(key, JSON.stringify(messages));
    appendChatMessageToDOM(newMsg);
    scrollChatToBottom();
    if (chatInput) chatInput.value = '';

    showToast(`Invite message delivered to ${activeOpponentForChat.name}!`, 'success');

    // Friendly opponent automatic response
    setTimeout(() => {
      if (activeOpponentForChat && chatModal && !chatModal.classList.contains('hidden')) {
        const autoReply = {
          type: 'incoming',
          text: `Sounds great! Go ahead and reserve an open court slot on the Court Booking grid.`,
          time: formatTime(new Date())
        };
        messages.push(autoReply);
        localStorage.setItem(key, JSON.stringify(messages));
        appendChatMessageToDOM(autoReply);
        scrollChatToBottom();
      }
    }, 1100);
  }

  function renderQuickChips(opponent) {
    if (!quickChipsContainer) return;
    quickChipsContainer.innerHTML = '';

    const chips = [
      `Free today at 5:00 PM?`,
      `Let's book Court 1!`,
      `Are you at the Sports Complex now?`,
      `Best of 3 sets match?`
    ];

    chips.forEach(chipText => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-chip';
      chip.textContent = chipText;
      chip.addEventListener('click', () => {
        sendUserChatMessage(chipText);
      });
      quickChipsContainer.appendChild(chip);
    });
  }

  function scrollChatToBottom() {
    if (chatMessagesList) {
      chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
    }
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Event Listeners
  if (btnCloseChat) btnCloseChat.addEventListener('click', closeChatModal);
  if (chatModal) {
    chatModal.addEventListener('click', (e) => {
      if (e.target === chatModal) closeChatModal();
    });
  }
  if (btnSendChat) {
    btnSendChat.addEventListener('click', () => {
      if (chatInput) sendUserChatMessage(chatInput.value);
    });
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendUserChatMessage(chatInput.value);
      }
    });
  }
  if (btnFindOpponent) {
    btnFindOpponent.addEventListener('click', () => {
      renderOpponents();
      showToast(`Refreshed ${activeSport} opponents within active Elo range.`, 'info');
    });
  }
  if (btnExpandRange) {
    btnExpandRange.addEventListener('click', () => {
      isRangeExpanded = !isRangeExpanded;
      renderOpponents();
      if (isRangeExpanded) {
        showToast('Skill bracket expanded to ±250 Elo points.', 'warning');
      } else {
        showToast('Skill bracket returned to ±150 Elo points.', 'info');
      }
    });
  }

  // Initialize UI
  renderTopBar();
  renderSystemNotifications();
  initAvailabilityPanel();
  renderOpponents();
});
