let bpm = 100;
let beatsPerMeasure = 4;
let subdivision = 1;
let isPlaying = false;
let currentInterval;
let beatIndex = 0;
let subBeatIndex = 0;

const bpmInput = document.getElementById('bpm');
const beatsPerMeasureInput = document.getElementById('beats-per-measure');
const subdivisionSelect = document.getElementById('subdivision');
const startStopButton = document.getElementById('start-stop-button');
const tapTempoButton = document.getElementById('tap-tempo-button');
const visualizer = document.getElementById('visualizer');

const accentClick = new Audio('data:audio/wav;base64,...'); // Replace with actual base64 audio
const regularClick = new Audio('data:audio/wav;base64,...');

let lastTapTime = 0;
let tapIntervals = [];
let beatIndicators = [];

function playClick() {
  const isAccent = beatIndex === 0 && subBeatIndex === 0;
  const isSubBeat = subdivision > 1 && subBeatIndex !== 0;

  const click = isAccent ? accentClick : regularClick;
  click.currentTime = 0;
  click.play();

  // Visuals
  if (subBeatIndex === 0 && beatIndicators[beatIndex]) {
    beatIndicators[beatIndex].style.opacity = '1';
    beatIndicators[beatIndex].style.transform = 'scale(1.4)';
    setTimeout(() => {
      beatIndicators[beatIndex].style.opacity = '0.6';
      beatIndicators[beatIndex].style.transform = 'scale(1)';
    }, 100);
  }

  // Advance beat
  subBeatIndex++;
  if (subBeatIndex >= subdivision) {
    subBeatIndex = 0;
    beatIndex++;
    if (beatIndex >= beatsPerMeasure) {
      beatIndex = 0;
    }
  }
}

function startClickTrack() {
  isPlaying = true;
  beatIndex = 0;
  subBeatIndex = 0;
  updateInterval();
}

function stopClickTrack() {
  isPlaying = false;
  clearInterval(currentInterval);
}

function updateInterval() {
  clearInterval(currentInterval);
  const interval = (60000 / bpm) / subdivision;
  currentInterval = setInterval(playClick, interval);
  drawVisuals();
}

// Event Listeners
bpmInput.addEventListener('input', () => {
  bpm = parseInt(bpmInput.value, 10);
  if (isPlaying) updateInterval();
});

beatsPerMeasureInput.addEventListener('input', () => {
  beatsPerMeasure = parseInt(beatsPerMeasureInput.value, 10);
  if (isPlaying) updateInterval();
  drawVisuals();
});

subdivisionSelect.addEventListener('change', () => {
  subdivision = parseInt(subdivisionSelect.value, 10);
  if (isPlaying) updateInterval();
});

startStopButton.addEventListener('click', () => {
  if (isPlaying) {
    stopClickTrack();
    startStopButton.textContent = 'Start';
    startStopButton.classList.remove('stop');
    startStopButton.classList.add('start');
  } else {
    startClickTrack();
    startStopButton.textContent = 'Stop';
    startStopButton.classList.remove('start');
    startStopButton.classList.add('stop');
  }
});

tapTempoButton.addEventListener('click', () => {
  const now = Date.now();
  const interval = now - lastTapTime;

  if (interval < 250) return;

  if (interval < 2000) {
    tapIntervals.push(interval);
    if (tapIntervals.length > 4) tapIntervals.shift();
    const avgInterval = tapIntervals.reduce((a, b) => a + b, 0) / tapIntervals.length;
    bpm = Math.round(60000 / avgInterval);
    bpmInput.value = bpm;
    updateInterval();
  }

  lastTapTime = now;
});

function drawVisuals() {
  visualizer.innerHTML = '';
  beatIndicators = [];

  for (let i = 0; i < beatsPerMeasure; i++) {
    const box = document.createElement('div');
    box.classList.add('beat-box');
    box.style.backgroundColor = i === 0 ? '#00ff00' : '#4444ff'; // Accent beat = green
    visualizer.appendChild(box);
    beatIndicators.push(box);
  }
}
