/**
 * Sportsly: Campus Sports Matchmaking & Court Booking System
 * Forman Christian College University (FCCU) - Student Login & Verification Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('fccuEmail');
  const rollInput = document.getElementById('rollNumber');
  const alertContainer = document.getElementById('loginAlert');

  // Helper to show styled alert
  function showAlert(message, type = 'error') {
    if (!alertContainer) return;
    alertContainer.className = `alert-box alert-${type}`;
    
    let icon = '⛔';
    if (type === 'warning') icon = '⚠️';
    if (type === 'success') icon = '✅';

    alertContainer.innerHTML = `
      <span style="font-size: 1.25rem; flex-shrink: 0; line-height: 1;">${icon}</span>
      <div style="font-size: 0.88rem; line-height: 1.45;">${message}</div>
    `;
    alertContainer.classList.remove('hidden');
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearAlert() {
    if (!alertContainer) return;
    alertContainer.className = 'alert-box hidden';
    alertContainer.innerHTML = '';
  }

  // Form submission handling
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAlert();

      const rawEmail = (emailInput.value || '').trim().toLowerCase();
      const rawRoll = (rollInput.value || '').trim();

      // 1. Mandatory Fields
      if (!rawEmail || !rawRoll) {
        showAlert('Please provide both your official FCCU Email address and 9-digit Roll Number.', 'error');
        return;
      }

      // 2. Validate Email Domain: Must end with @fccollege.edu.pk
      const requiredDomain = '@fccollege.edu.pk';
      if (!rawEmail.endsWith(requiredDomain)) {
        showAlert(
          `<strong>Domain Verification Failed:</strong> Only official Forman Christian College University email addresses ending with <code>${requiredDomain}</code> are authorized to access Sportsly. Provided: <em>${rawEmail}</em>`,
          'error'
        );
        emailInput.focus();
        return;
      }

      // 3. Validate Roll Number: Must be exactly 9 numeric digits
      const rollRegex = /^\d{9}$/;
      if (!rollRegex.test(rawRoll)) {
        showAlert(
          '<strong>Invalid Roll Number:</strong> FCCU student roll numbers must be exactly 9 numeric digits (e.g., <code>281140101</code>). Please check your student card.',
          'error'
        );
        rollInput.focus();
        return;
      }

      // 4. Look up Student in localStorage STUDENT DB
      const students = getStudents();
      const existingStudent = students.find(
        s => s.email.toLowerCase() === rawEmail || s.rollNumber === rawRoll
      );

      // Check for Disciplinary Hold
      if (existingStudent && existingStudent.disciplinaryHold === true) {
        showAlert(
          'Access Denied: Your account has an active Disciplinary Hold. Please contact the FCCU Sports Complex Administration.',
          'error'
        );
        return;
      }

      let activeProfile = null;

      if (existingStudent) {
        // Pre-seeded or existing student record found
        activeProfile = { ...existingStudent };
      } else {
        // New active student registration with 1000 baseline Elo and 3/3 weekly booking hours
        activeProfile = {
          id: `std-${rawRoll}`,
          email: rawEmail,
          rollNumber: rawRoll,
          name: `Student ${rawRoll.slice(-4)}`,
          sport: 'Badminton',
          elo: 1000,
          weeklyHoursRemaining: 3,
          weeklyHoursTotal: 3,
          weeklyHoursUsed: 0,
          disciplinaryHold: false,
          cgpa: 3.00,
          cnic: '35202-XXXXXXX-X',
          contact: '0300-0000000',
          wins: 0,
          losses: 0,
          activeStatus: 'Active',
          varsityShortlisted: false,
          freeSlots: [
            'Mon 4:00 PM - 5:00 PM',
            'Wed 4:00 PM - 5:00 PM',
            'Fri 3:00 PM - 5:00 PM'
          ],
          createdAt: new Date().toISOString()
        };

        // Add to persistent STUDENT DB
        students.push(activeProfile);
        saveStudents(students);
      }

      // Save active session
      saveCurrentUser(activeProfile);

      showAlert(`Welcome, ${activeProfile.name}! Verifying credentials and loading dashboard...`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 650);
    });
  }
});
