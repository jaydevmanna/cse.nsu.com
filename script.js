const validUsername = 'MISS MISTI';
const validPassword = '07122007';
const loginPage = document.getElementById('loginPage');
const surpriseScreen = document.getElementById('surpriseScreen');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const continueButton = document.getElementById('continueButton');
const musicToggle = document.getElementById('musicToggle');
const logoutButton = document.getElementById('logoutButton');
const photoUpload = document.getElementById('photoUpload');
const galleryGrid = document.getElementById('galleryGrid');
const notesInput = document.getElementById('notesInput');
const saveNote = document.getElementById('saveNote');
const countdownTimer = document.getElementById('countdownTimer');
let audioContext;
let oscillator;
let isPlaying = false;
let continueDelay;

function showSection(section) {
  loginPage.classList.remove('active');
  surpriseScreen.classList.remove('active');
  dashboardPage.classList.remove('active');
  section.classList.add('active');
}

function startSession() {
  localStorage.setItem('mistihSession', 'active');
}

function endSession() {
  localStorage.removeItem('mistihSession');
}

function loadSession() {
  return localStorage.getItem('mistihSession') === 'active';
}

function setContinueDelay() {
  continueButton.textContent = 'Continue (wait)';
  continueButton.disabled = true;
  let countdown = 9;
  const timer = setInterval(() => {
    continueButton.textContent = `Continue (${countdown}s)`;
    countdown -= 1;
    if (countdown < 0) {
      clearInterval(timer);
      continueButton.textContent = 'Continue';
      continueButton.disabled = false;
    }
  }, 1000);
}

function enableSurprise() {
  showSection(surpriseScreen);
  setContinueDelay();
}

const birthdayMonth = 11; // December (zero-based index)
const birthdayDay = 7;
const birthYear = 2007;

function computeCountdown() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const target = new Date(currentYear, birthdayMonth, birthdayDay, 0, 0, 0);
  if (today > target) {
    target.setFullYear(currentYear + 1);
  }
  const diff = target - today;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  countdownTimer.textContent = `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function restoreNotes() {
  const savedNote = localStorage.getItem('mistiNote');
  if (savedNote) notesInput.value = savedNote;
}

function handleLogin(event) {
  event.preventDefault();
  const usernameValue = document.getElementById('username').value.trim();
  const passwordValue = document.getElementById('password').value.trim();
  if (usernameValue === validUsername && passwordValue === validPassword) {
    loginError.textContent = '';
    startSession();
    enableSurprise();
  } else {
    loginError.textContent = 'Invalid Username or Password';
  }
}

function toggleMusic() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (isPlaying) {
    oscillator.stop();
    oscillator = null;
    musicToggle.textContent = 'Music: Off';
    isPlaying = false;
    return;
  }
  oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0.06, audioContext.currentTime);
  oscillator.start();
  const now = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(330, now);
  oscillator.frequency.linearRampToValueAtTime(523.25, now + 2);
  oscillator.frequency.linearRampToValueAtTime(392, now + 4);
  oscillator.frequency.linearRampToValueAtTime(659.25, now + 6);
  oscillator.frequency.linearRampToValueAtTime(440, now + 7.5);
  oscillator.stop(now + 12);
  isPlaying = true;
  musicToggle.textContent = 'Music: On';
  oscillator.onended = () => {
    isPlaying = false;
    musicToggle.textContent = 'Music: Off';
  };
}

function handleContinue() {
  showSection(dashboardPage);
  computeCountdown();
  setInterval(computeCountdown, 1000);
  restoreNotes();
}

function handleLogout() {
  endSession();
  showSection(loginPage);
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${reader.result}" alt="Uploaded photo" />`;
    galleryGrid.appendChild(item);
  };
  reader.readAsDataURL(file);
}

function saveNoteToStorage() {
  localStorage.setItem('mistiNote', notesInput.value);
  saveNote.textContent = 'Saved ✔';
  setTimeout(() => { saveNote.textContent = 'Save Note'; }, 1800);
}

loginForm.addEventListener('submit', handleLogin);
continueButton.addEventListener('click', handleContinue);
musicToggle.addEventListener('click', toggleMusic);
logoutButton.addEventListener('click', handleLogout);
photoUpload.addEventListener('change', handlePhotoUpload);
saveNote.addEventListener('click', saveNoteToStorage);

if (loadSession()) {
  enableSurprise();
} else {
  showSection(loginPage);
}
