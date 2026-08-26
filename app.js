/* ==========================================================================
   ROMANTIC DATE REQUEST WEBSITE - APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE MANAGEMENT ---
  const state = {
    currentStep: 1,
    hasSaidYes: false,
    chosenDate: '',
    chosenTime: '19:00',
    chosenFoods: new Set(),
    noDodgeCount: 0
  };

  // --- DOM ELEMENTS ---
  const stepCards = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
  };

  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const btnNoText = document.getElementById('btn-no-text');
  const proposalActions = document.getElementById('proposal-actions');

  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const timePills = document.querySelectorAll('.time-pill');
  const btnToStep3 = document.getElementById('btn-to-step-3');

  const foodCards = document.querySelectorAll('.food-card');
  const btnToStep4 = document.getElementById('btn-to-step-4');

  const summaryDateDisplay = document.getElementById('summary-date-display');
  const summaryTimeDisplay = document.getElementById('summary-time-display');
  const summaryFoodDisplay = document.getElementById('summary-food-display');
  const quoteDateTime = document.getElementById('quote-date-time');
  const btnCelebrateAgain = document.getElementById('btn-celebrate-again');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  // Info Widget Elements
  const infoCircleBtn = document.getElementById('info-circle-btn');
  const infoPopover = document.getElementById('info-popover');
  const popoverClose = document.getElementById('popover-close');
  const infoBadgeDot = document.getElementById('info-badge-dot');
  const infoStatusVal = document.getElementById('info-status-val');
  const infoDateVal = document.getElementById('info-date-val');
  const infoTimeVal = document.getElementById('info-time-val');
  const infoFoodVal = document.getElementById('info-food-val');
  const proTipText = document.getElementById('pro-tip-text');

  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  // Set default min date to today and default date to tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  dateInput.min = today.toISOString().split('T')[0];
  dateInput.value = tomorrow.toISOString().split('T')[0];
  state.chosenDate = dateInput.value;

  // Initialize Audio Context for synthesized sound effects
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'dodge') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'fanfare') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'sine';
          noteOsc.frequency.value = freq;
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);

          const startTime = now + idx * 0.1;
          noteGain.gain.setValueAtTime(0.3, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

          noteOsc.start(startTime);
          noteOsc.stop(startTime + 0.4);
        });
      }
    } catch (e) {
      console.log('Audio error ignored');
    }
  }

  // --- RUNAWAY NO BUTTON LOGIC (Always Moves, Never Disappears!) ---
  const dodgePhrases = [
    "No 🙈",
    "Are you sure? 🥺",
    "Wrong button! 😜",
    "Nice try! 🌸",
    "You can't catch me! ✨",
    "Just say YES! 🥰",
    "Only YES works! 💕",
    "YES is over there! 👉"
  ];

  let currentTranslateX = 0;
  let currentTranslateY = 0;

  function dodgeNoButton() {
    state.noDodgeCount++;
    playSound('dodge');

    // Update button text playfully
    const textIdx = Math.min(state.noDodgeCount, dodgePhrases.length - 1);
    btnNoText.textContent = dodgePhrases[textIdx];

    // Calculate maximum safe translation bounds so button stays inside card/screen
    const container = proposalActions;
    const cardRect = stepCards[1].getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Random offset range inside card width & height
    const maxRangeX = Math.min(window.innerWidth * 0.35, 140);
    const maxRangeY = Math.min(window.innerHeight * 0.25, 120);

    // Pick new translation coordinates avoiding current position
    let newX = (Math.random() - 0.5) * 2 * maxRangeX;
    let newY = (Math.random() - 0.5) * 2 * maxRangeY;

    // Prevent tiny movement
    if (Math.abs(newX - currentTranslateX) < 40) {
      newX = newX > 0 ? newX + 50 : newX - 50;
    }
    if (Math.abs(newY - currentTranslateY) < 30) {
      newY = newY > 0 ? newY + 40 : newY - 40;
    }

    currentTranslateX = newX;
    currentTranslateY = newY;

    // Apply transform smoothly without hiding
    btnNo.style.transform = `translate(${newX}px, ${newY}px) scale(1.05)`;
    btnNo.style.opacity = '1';
    btnNo.style.visibility = 'visible';

    showToast("Hehe! You can't click No! 😜");
  }

  // Bind mouse, pointer, touch, and proximity events for seamless movement
  btnNo.addEventListener('mouseenter', dodgeNoButton);
  btnNo.addEventListener('pointerover', dodgeNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNoButton();
  }, { passive: false });
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeNoButton();
  });

  // Proximity detection: if cursor/touch gets close to No button, dodge automatically!
  document.addEventListener('mousemove', (e) => {
    if (state.currentStep !== 1) return;
    const rect = btnNo.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
    if (dist < 75) {
      dodgeNoButton();
    }
  });

  // Touchmove proximity detection for mobile phones
  document.addEventListener('touchmove', (e) => {
    if (state.currentStep !== 1 || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = btnNo.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dist = Math.hypot(touch.clientX - btnCenterX, touch.clientY - btnCenterY);
    if (dist < 80) {
      dodgeNoButton();
    }
  }, { passive: true });

  // --- STEP 1: YES CLICKED ---
  btnYes.addEventListener('click', () => {
    playSound('fanfare');
    state.hasSaidYes = true;

    // Reset runaway button position cleanly
    btnNo.style.transform = 'translate(0, 0)';

    // Trigger Flower Confetti Burst
    startFlowerConfetti();

    // Update Info Widget
    updateInfoWidget();

    showToast("YAY! You said YES! 🎉💖");

    // Transition to Step 2
    setTimeout(() => {
      goToStep(2);
    }, 1400);
  });

  // --- STEP NAVIGATION ---
  function goToStep(stepNumber) {
    state.currentStep = stepNumber;
    
    Object.keys(stepCards).forEach(key => {
      stepCards[key].classList.remove('active');
    });

    if (stepCards[stepNumber]) {
      stepCards[stepNumber].classList.add('active');
    }

    updateInfoWidget();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- STEP 2: DATE & TIME SELECTION ---
  dateInput.addEventListener('change', (e) => {
    state.chosenDate = e.target.value;
    updateInfoWidget();
  });

  timeInput.addEventListener('change', (e) => {
    state.chosenTime = e.target.value;
    updateInfoWidget();
  });

  timePills.forEach(pill => {
    pill.addEventListener('click', () => {
      playSound('pop');
      timePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const selectedTime = pill.getAttribute('data-time');
      timeInput.value = selectedTime;
      state.chosenTime = selectedTime;
      updateInfoWidget();
    });
  });

  btnToStep3.addEventListener('click', () => {
    if (!dateInput.value) {
      showToast("Please select a date first! 📅");
      return;
    }
    playSound('pop');
    state.chosenDate = dateInput.value;
    state.chosenTime = timeInput.value;
    goToStep(3);
  });

  // --- STEP 3: FOOD SELECTION TILES ---
  foodCards.forEach(card => {
    card.addEventListener('click', () => {
      playSound('pop');
      const foodName = card.getAttribute('data-food');

      if (state.chosenFoods.has(foodName)) {
        state.chosenFoods.delete(foodName);
        card.classList.remove('selected');
      } else {
        state.chosenFoods.add(foodName);
        card.classList.add('selected');
      }

      updateInfoWidget();
    });
  });

  // Transition from Step 3 directly to Step 4 Celebration Page
  btnToStep4.addEventListener('click', () => {
    if (state.chosenFoods.size === 0) {
      showToast("Please pick at least one food option! 😋");
      return;
    }

    playSound('fanfare');
    startFlowerConfetti();
    renderFinalSummary();
    goToStep(4);
    showToast("Woohoo! Date is confirmed! 🎉💖");
  });

  // --- STEP 4: FINAL SUMMARY & CELEBRATION ---
  function formatDateString(dateStr) {
    if (!dateStr) return 'TBD';
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTimeString(timeStr) {
    if (!timeStr) return '7:00 PM';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  }

  function renderFinalSummary() {
    const formattedDate = formatDateString(state.chosenDate);
    const formattedTime = formatTimeString(state.chosenTime);

    const foodEmojiMap = {
      'Pizza': 'Pizza 🍕',
      'Burger': 'Burger 🍔',
      'Sushi': 'Sushi 🍣',
      'Pasta': 'Pasta 🍝',
      'Tacos': 'Tacos 🌮',
      'Ramen': 'Ramen 🍜'
    };

    const foodArray = Array.from(state.chosenFoods).map(f => foodEmojiMap[f] || f);
    const formattedFoods = foodArray.join(', ');

    summaryDateDisplay.textContent = formattedDate;
    summaryTimeDisplay.textContent = formattedTime;
    summaryFoodDisplay.textContent = formattedFoods || 'Delicious Feast 😋';

    if (quoteDateTime) {
      quoteDateTime.textContent = `${formattedDate} at ${formattedTime}`;
    }
  }

  btnCelebrateAgain.addEventListener('click', () => {
    playSound('fanfare');
    startFlowerConfetti();
  });

  btnCopySummary.addEventListener('click', () => {
    playSound('pop');
    const formattedDate = formatDateString(state.chosenDate);
    const formattedTime = formatTimeString(state.chosenTime);
    const foodList = Array.from(state.chosenFoods).join(', ');

    const textToCopy = `💖 OUR OFFICIAL DATE PLAN! 💖\n\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n🍽️ Food: ${foodList}\n\nI am so glad you didn't say no! Can't wait for our date! 🥰✨`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Date summary copied to clipboard! 📋✨");
    }).catch(() => {
      showToast("Summary copied! 💖");
    });
  });

  // --- PRO TIP / INFO WIDGET LOGIC ---
  infoCircleBtn.addEventListener('click', () => {
    playSound('pop');
    infoPopover.classList.toggle('hidden');
  });

  popoverClose.addEventListener('click', () => {
    infoPopover.classList.add('hidden');
  });

  function updateInfoWidget() {
    if (state.hasSaidYes) {
      infoStatusVal.innerHTML = '<span class="text-pink">Agreed & Said YES! 💕</span>';
      infoBadgeDot.classList.remove('hidden');
    } else {
      infoStatusVal.textContent = 'Waiting for response...';
    }

    if (state.chosenDate) {
      infoDateVal.textContent = formatDateString(state.chosenDate);
    } else {
      infoDateVal.textContent = 'Not selected yet';
    }

    if (state.chosenTime) {
      infoTimeVal.textContent = formatTimeString(state.chosenTime);
    } else {
      infoTimeVal.textContent = 'Not selected yet';
    }

    if (state.chosenFoods.size > 0) {
      infoFoodVal.textContent = Array.from(state.chosenFoods).join(', ');
    } else {
      infoFoodVal.textContent = 'None selected yet';
    }

    if (state.currentStep === 1) {
      proTipText.textContent = "Click 'Yes' to start setting up our date!";
    } else if (state.currentStep === 2) {
      proTipText.textContent = "Choose a date & time when you are free!";
    } else if (state.currentStep === 3) {
      proTipText.textContent = "You can pick multiple food tiles!";
    } else if (state.currentStep === 4) {
      proTipText.textContent = "Your choices are locked in! Can't wait!";
    }
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2800);
  }

  // --- AMBIENT FLOATING PETALS ---
  const ambientPetalsContainer = document.getElementById('ambient-petals');
  const petalIcons = ['🌸', '🌺', '💖', '✨', '🌷'];

  function createAmbientPetal() {
    const petal = document.createElement('div');
    petal.className = 'floating-petal';
    petal.textContent = petalIcons[Math.floor(Math.random() * petalIcons.length)];
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.animationDuration = `${7 + Math.random() * 7}s`;
    petal.style.fontSize = `${1.2 + Math.random() * 1.2}rem`;

    ambientPetalsContainer.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, 15000);
  }

  setInterval(createAmbientPetal, 1000);

  // --- CANVAS FLOWER & HEART CONFETTI ENGINE ---
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 14 + 10;
      this.speedX = (Math.random() - 0.5) * 14;
      this.speedY = Math.random() * -16 - 6;
      this.gravity = 0.38;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      this.type = Math.random() > 0.4 ? 'flower' : 'heart';
      
      const colors = ['#FF69B4', '#FF1493', '#FF85A1', '#FFB703', '#FF477E', '#FFF0F5'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = 1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.007;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.type === 'heart') {
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
        ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 2, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 2, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFB703';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function startFlowerConfetti() {
    particles = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;

    for (let i = 0; i < 140; i++) {
      particles.push(new ConfettiParticle(centerX, centerY));
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();

      if (particles[i].opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

});
