/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Dashboard & Matchmaking Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user session exists, else initialize default demo user
  let currentUser = getCurrentUser();
  if (!currentUser) {
    currentUser = {
      name: 'Muhammad Bilal',
      email: '251084912@fccollege.edu.pk',
      rollNumber: '251084912',
      elo: 1000,
      weeklyHoursRemaining: 2,
      weeklyHoursTotal: 3,
      selectedSport: 'Badminton',
      playNowActive: false,
      disciplinaryHold: false,
      freeSlots: [
        'Mon 4:00 PM - 5:00 PM',
        'Wed 4:00 PM - 5:00 PM',
        'Fri 3:00 PM - 5:00 PM'
      ]
    };
    saveCurrentUser(currentUser);
  }

  // State
  let activeSport = currentUser.selectedSport || 'Badminton';
  let isRangeExpanded = false; // false = ±150 Elo, true = ±250 Elo
  let activeOpponentForChat = null;

  // DOM Elements - Top Bar
  const userDisplayName = document.getElementById('userDisplayName');
  const userRollNumber = document.getElementById('userRollNumber');
  const userAvatarCircle = document.getElementById('userAvatarCircle');
  const userEloPill = document.getElementById('userEloPill');
  const userHoursPill = document.getElementById('userHoursPill');
  const btnLogout = document.getElementById('btnLogout');

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
  // Render Top Bar Info
  // ==========================================================================
  function renderTopBar() {
    if (userDisplayName) userDisplayName.textContent = currentUser.name;
    if (userRollNumber) userRollNumber.textContent = `Roll No: ${currentUser.rollNumber}`;
    
    // Avatar initials
    if (userAvatarCircle) {
      const parts = currentUser.name.trim().split(' ');
      const initials = parts.length > 1 
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
        : parts[0].slice(0, 2).toUpperCase();
      userAvatarCircle.textContent = initials;
    }

    // Current Elo Rank (1000 Baseline)
    if (userEloPill) {
      userEloPill.innerHTML = `<span class="icon">🏆</span> <strong>${currentUser.elo} Elo</strong>`;
    }

    // Weekly Booking Hours remaining (2/3 hrs left)
    if (userHoursPill) {
      userHoursPill.innerHTML = `<span class="icon">⏱️</span> <strong>${currentUser.weeklyHoursRemaining}/${currentUser.weeklyHoursTotal} hrs left</strong>`;
    }
  }

  // Logout handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // ==========================================================================
  // Availability Panel: Sports, Play Now Switch, Slots
  // ==========================================================================
  function initAvailabilityPanel() {
    // 1. Sport Selector
    if (sportSelect) {
      sportSelect.value = activeSport;
      sportSelect.addEventListener('change', (e) => {
        activeSport = e.target.value;
        currentUser.selectedSport = activeSport;
        saveCurrentUser(currentUser);
        // Reset expanded range when sport changes
        isRangeExpanded = false;
        renderOpponents();
        showToast(`Sport switched to ${activeSport}. Matchmaking updated.`, 'info');
      });
    }

    // 2. Play Now Live Toggle
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

    // 3. Weekly Free Time Slots
    renderWeeklySlots();

    if (btnSelectAllSlots) {
      btnSelectAllSlots.addEventListener('click', () => {
        currentUser.freeSlots = [...DEFAULT_WEEKLY_SLOTS];
        saveCurrentUser(currentUser);
        renderWeeklySlots();
        flashSyncTag('All 10 weekly time slots selected');
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
          if (!currentUser.freeSlots.includes(slotText)) {
            currentUser.freeSlots.push(slotText);
          }
          slotItem.classList.add('checked');
        } else {
          currentUser.freeSlots = currentUser.freeSlots.filter(s => s !== slotText);
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

    // Update range indicator in the UI
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

    // Filter by same sport and Elo range
    const matches = MOCK_OPPONENTS.filter(opp => {
      const sportMatches = opp.sport.toLowerCase() === activeSport.toLowerCase();
      const eloDifference = Math.abs(opp.elo - userElo);
      return sportMatches && (eloDifference <= deltaAllowed);
    });

    // Update Opponent Count Badge
    if (opponentCountBadge) {
      opponentCountBadge.textContent = `${matches.length} Player${matches.length === 1 ? '' : 's'} Available`;
    }

    // If no opponents found
    if (matches.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'empty-opponents-box';
      emptyBox.innerHTML = `
        <div class="empty-icon">🏸</div>
        <h3>No FCCU Athletes Found in ±${deltaAllowed} Elo Range</h3>
        <p>No students currently match the <strong>${activeSport}</strong> criteria within ${minElo} - ${maxElo} Elo. Expand your skill bracket to find more campus opponents.</p>
        ${!isRangeExpanded ? `
          <button type="button" class="btn-expand-range" style="margin: 0 auto;" id="btnEmptyExpand">
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

    // Render Matching Opponent Cards
    // STRICT PRIVACY RULE: Display ONLY Name, Sport, Elo Rank, and Win/Loss record.
    // Strictly hide CNIC and CGPA.
    matches.forEach(opp => {
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

      // Initial for avatar
      const oppInitials = opp.name.split(' ').map(n => n[0]).join('').slice(0, 2);

      // Card Markup strictly complies with displaying ONLY: Name, Sport, Elo, Win/Loss Record
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

          <!-- Strict Display: Elo Rank and Recent Win/Loss Record ONLY -->
          <div class="card-stats-grid">
            <div class="stat-cell">
              <span class="label">Elo Rating</span>
              <span class="value elo-highlight">⭐ ${opp.elo}</span>
            </div>
            <div class="stat-cell">
              <span class="label">Win / Loss</span>
              <span class="value record-highlight">📊 ${escapeHtml(opp.winLoss)}</span>
            </div>
          </div>
        </div>

        <div class="card-actions-row">
          <button type="button" class="btn-invite-chat" data-id="${opp.id}">
            <span>💬</span> Send Invite & Chat
          </button>
          <a href="booking.html?opponent=${encodeURIComponent(opp.name)}&sport=${encodeURIComponent(opp.sport)}" class="btn-book-court">
            <span>📅</span> Book Court
          </a>
        </div>
      `;

      // Attach Invite & Chat button listener
      const btnChat = card.querySelector('.btn-invite-chat');
      btnChat.addEventListener('click', () => {
        openChatModal(opp);
      });

      opponentsGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // Pre-Match Chat Popup Modal Logic
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

    // Load or initialize chat thread from localStorage
    loadChatMessages(opponent.id);

    // Setup Quick Prompt Chips
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
    return `${STORAGE_KEYS.CHAT_HISTORY}_${oppId}`;
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

    // Default introductory handshake if thread is empty
    if (messages.length === 0) {
      messages = [
        {
          type: 'system',
          text: `Match handshake initiated with ${activeOpponentForChat.name} (${activeOpponentForChat.sport}).`,
          time: 'Just now'
        },
        {
          type: 'outgoing',
          text: `Hi ${activeOpponentForChat.name}! I noticed you play ${activeOpponentForChat.sport} at the FCCU Sports Complex. Would you be up for a friendly intramural match this week?`,
          time: formatTime(new Date())
        }
      ];
      localStorage.setItem(key, JSON.stringify(messages));
    }

    messages.forEach(msg => {
      appendChatMessageToDOM(msg);
    });

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

    showToast(`Invite sent to ${activeOpponentForChat.name}!`, 'success');

    // Simulate friendly opponent auto-reply after 1.2 seconds for realistic prototype interactivity
    setTimeout(() => {
      if (activeOpponentForChat && chatModal && !chatModal.classList.contains('hidden')) {
        const autoReply = {
          type: 'incoming',
          text: `Sounds awesome! Let's lock in a court. You can click 'Book Court' so we reserve a slot.`,
          time: formatTime(new Date())
        };
        messages.push(autoReply);
        localStorage.setItem(key, JSON.stringify(messages));
        appendChatMessageToDOM(autoReply);
        scrollChatToBottom();
      }
    }, 1200);
  }

  function renderQuickChips(opponent) {
    if (!quickChipsContainer) return;
    quickChipsContainer.innerHTML = '';

    const chips = [
      `Free today at 4:00 PM?`,
      `Let's book Court 2!`,
      `Are you at the Sports Complex now?`,
      `Best of 3 sets intramural match?`
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
    return str.replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Chat Event Listeners
  if (btnCloseChat) {
    btnCloseChat.addEventListener('click', closeChatModal);
  }

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

  // ==========================================================================
  // Matchmaking Button Controls
  // ==========================================================================
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

  // ==========================================================================
  // Initialization
  // ==========================================================================
  renderTopBar();
  initAvailabilityPanel();
  renderOpponents();
});

