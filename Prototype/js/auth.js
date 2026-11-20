/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Login & Authentication Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('fccuEmail');
  const rollInput = document.getElementById('rollNumber');
  const nameInput = document.getElementById('studentName');
  const holdCheckbox = document.getElementById('disciplinaryHold');
  const alertContainer = document.getElementById('loginAlert');

  // Quick-fill buttons for evaluator ease
  const btnDemoValid = document.getElementById('btnDemoValid');
  const btnDemoHold = document.getElementById('btnDemoHold');
  const btnDemoInvalidEmail = document.getElementById('btnDemoInvalidEmail');

  // Check if already logged in
  const existingUser = getCurrentUser();
  if (existingUser && !existingUser.disciplinaryHold) {
    // Optionally pre-populate inputs if returning
    if (emailInput && !emailInput.value) emailInput.value = existingUser.email || '';
    if (rollInput && !rollInput.value) rollInput.value = existingUser.rollNumber || '';
    if (nameInput && !nameInput.value) nameInput.value = existingUser.name || '';
  }

  // Helper to show styled alert
  function showAlert(message, type = 'error') {
    if (!alertContainer) return;
    alertContainer.className = `alert-box alert-${type}`;
    
    let icon = '⚠️';
    if (type === 'error') icon = '⛔';
    if (type === 'warning') icon = '⚠️';
    if (type === 'success') icon = '✅';

    alertContainer.innerHTML = `
      <span style="font-size: 1.2rem; flex-shrink: 0;">${icon}</span>
      <div>${message}</div>
    `;
    alertContainer.classList.remove('hidden');
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearAlert() {
    if (!alertContainer) return;
    alertContainer.className = 'alert-box hidden';
    alertContainer.innerHTML = '';
  }

  // Demo Fill 1: Valid FCCU Student
  if (btnDemoValid) {
    btnDemoValid.addEventListener('click', () => {
      clearAlert();
      nameInput.value = 'Muhammad Bilal';
      emailInput.value = '251084912@fccollege.edu.pk';
      rollInput.value = '251084912';
      holdCheckbox.checked = false;
      showAlert('Filled with valid FCCU student credentials. Click "Log In to Sportsly" to proceed.', 'success');
    });
  }

  // Demo Fill 2: Disciplinary Hold Simulation
  if (btnDemoHold) {
    btnDemoHold.addEventListener('click', () => {
      clearAlert();
      nameInput.value = 'Zubair Qasim';
      emailInput.value = '241099231@fccollege.edu.pk';
      rollInput.value = '241099231';
      holdCheckbox.checked = true;
      showAlert('Disciplinary Hold simulation enabled. Submit form to observe the policy block.', 'warning');
    });
  }

  // Demo Fill 3: Invalid Non-FCCU Email
  if (btnDemoInvalidEmail) {
    btnDemoInvalidEmail.addEventListener('click', () => {
      clearAlert();
      nameInput.value = 'Guest Player';
      emailInput.value = 'guest.player@gmail.com';
      rollInput.value = '251084912';
      holdCheckbox.checked = false;
      showAlert('Filled with external non-FCCU email (@gmail.com). Submit form to test domain validation.', 'warning');
    });
  }

  // Form submission handling
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAlert();

      const rawEmail = (emailInput.value || '').trim().toLowerCase();
      const rawRoll = (rollInput.value || '').trim();
      const rawName = (nameInput.value || '').trim();
      const isHold = holdCheckbox.checked;

      // 1. Mandatory Fields
      if (!rawEmail || !rawRoll) {
        showAlert('Please provide both your official FCCU Email address and 9-digit Roll Number.', 'error');
        return;
      }

      // 2. Validate Email Domain: Must end with @fccollege.edu.pk
      const requiredDomain = '@fccollege.edu.pk';
      if (!rawEmail.endsWith(requiredDomain)) {
        showAlert(
          `<strong>Domain Verification Failed:</strong> Only official Forman Christian College University email addresses ending in <code>${requiredDomain}</code> are authorized to access Sportsly. Provided: <em>${rawEmail}</em>`,
          'error'
        );
        emailInput.focus();
        return;
      }

      // 3. Validate Roll Number: Must be exactly 9 numeric digits
      const rollRegex = /^\d{9}$/;
      if (!rollRegex.test(rawRoll)) {
        showAlert(
          '<strong>Invalid Roll Number:</strong> FCCU student roll numbers must be exactly 9 numeric digits (e.g., <code>251084912</code>). Please check your student card.',
          'error'
        );
        rollInput.focus();
        return;
      }

      // 4. Validate Disciplinary Hold: Block login if checked
      if (isHold) {
        showAlert(
          '<strong>Access Denied - Disciplinary Hold:</strong> Your account is currently suspended from intramural matchmaking and sports reservations due to an active disciplinary hold recorded by the FCCU Directorate of Student Affairs & Sports Complex. Please visit Room 102, Sports Complex for clearance.',
          'error'
        );
        return;
      }

      // 5. Successful validation -> Initialize profile with 1000 Elo rating & 2/3 weekly booking hours
      const displayName = rawName || `Student ${rawRoll.slice(-4)}`;
      
      const userProfile = {
        name: displayName,
        email: rawEmail,
        rollNumber: rawRoll,
        elo: 1000, // Initialized at 1000 Elo rating as required
        weeklyHoursRemaining: 2,
        weeklyHoursTotal: 3, // Displayed as 2/3 hrs left
        selectedSport: 'Badminton',
        playNowActive: false,
        disciplinaryHold: false,
        freeSlots: [
          'Mon 4:00 PM - 5:00 PM',
          'Wed 4:00 PM - 5:00 PM',
          'Fri 3:00 PM - 5:00 PM'
        ],
        createdAt: new Date().toISOString()
      };

      saveCurrentUser(userProfile);

      showAlert('Login verified! Redirecting to FCCU Sportsly Dashboard...', 'success');

      // Brief animation pause before redirect
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }
});

