// ========== AUDIO SETUP ==========
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let accentBuffer = null;
let beatBuffer = null;

let nextNoteTime = 0.0;
let schedulerTimer;
let currentBeat = 0;
let totalBeats = 0;
let beatsPerMeasure = 4;
let subDiv = 1;
let songData;

// Preload and decode sounds
async function loadSounds() {
  const loadSound = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
  };

  [accentBuffer, beatBuffer] = await Promise.all([
    loadSound('sounds/metronome-85688.mp3'),
    loadSound('sounds/rimshot-sweet-107111.mp3')
  ]);
}
loadSounds();

// ========== SONG DATA ==========
let songs = JSON.parse(localStorage.getItem('songs')) || [];
const selector = document.getElementById('songSelector');
const setList = document.getElementById('setList');

function populateSongs() {
  selector.innerHTML = '<option value="">Select a song</option>';
  setList.innerHTML = '';
  songs.forEach((song, index) => {
    const option = document.createElement('option');
    option.textContent = song.title;
    option.value = index;
    selector.appendChild(option);

    const songDiv = document.createElement('div');
    songDiv.innerHTML = `<strong>${song.title}</strong> - ${song.bpm} BPM - ${song.timeSig} - ${song.subdivision}`;
    songDiv.style.padding = "10px";
    songDiv.style.borderBottom = "1px solid #ccc";
    setList.appendChild(songDiv);
  });
}
populateSongs();

// ========== MODAL ==========
document.getElementById('showForm').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'flex';
});

document.getElementById('cancel').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
});

document.getElementById('addSong').addEventListener('click', () => {
  const title = document.getElementById('songTitle').value;
  const bpm = parseInt(document.getElementById('bpm').value);
  const timeSig = document.getElementById('timeSignature').value;
  const subdivision = document.getElementById('subdivision').value;

  if (title.trim() === "") {
    alert("Please enter a song title.");
    return;
  }

  const song = { title, bpm, timeSig, subdivision };
  songs.push(song);
  localStorage.setItem('songs', JSON.stringify(songs));

  document.getElementById('songForm').reset();
  document.getElementById('modalOverlay').style.display = 'none';
  populateSongs();
});

// ========== PLAYBACK ==========
let isPlaying = false;
const playButton = document.getElementById('togglePlay');
const beatBoxes = document.getElementById('beatBoxes');

playButton.addEventListener('click', () => {
  if (!isPlaying) {
    const selectedIndex = selector.value;
    if (selectedIndex === "" || isNaN(selectedIndex)) {
      alert("Select a song first!");
      return;
    }

    songData = songs[selectedIndex];
    startMetronome(songData);
    playButton.textContent = '⏸️ Pause';
  } else {
    stopMetronome();
    playButton.textContent = '▶️ Play';
  }
  isPlaying = !isPlaying;
});

function startMetronome(song) {
  audioContext.resume(); // Needed for autoplay restrictions

  beatsPerMeasure = parseInt(song.timeSig.split('/')[0]);
  subDiv = getSubdivisionFactor(song.subdivision);
  totalBeats = beatsPerMeasure * subDiv;

  const bpm = song.bpm;
  const beatInterval = 60 / (bpm * subDiv);
  nextNoteTime = audioContext.currentTime + 0.1;
  currentBeat = 0;

  drawBeatBoxes(totalBeats, beatsPerMeasure);
  schedulerTimer = setInterval(() => scheduler(beatInterval), 25);
}

function stopMetronome() {
  clearInterval(schedulerTimer);
  beatBoxes.innerHTML = '';
}

function scheduler(beatInterval) {
  while (nextNoteTime < audioContext.currentTime + 0.1) {
    playClick(currentBeat, nextNoteTime);
    updateVisualBeat(currentBeat, beatsPerMeasure);

    currentBeat = (currentBeat + 1) % totalBeats;
    nextNoteTime += beatInterval;
  }
}

function playClick(beatIndex, time) {
  const isAccent = beatIndex % beatsPerMeasure === 0;
  const buffer = isAccent ? accentBuffer : beatBuffer;

  if (!buffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const gainNode = audioContext.createGain();
  const volume = parseInt(volumeSlider.value) / 100;
  gainNode.gain.value = volume;

  source.connect(gainNode).connect(audioContext.destination);
  source.start(time);
}

// ========== HELPER FUNCTIONS ==========
function getSubdivisionFactor(subdivision) {
  switch (subdivision) {
    case "Quarter Notes": return 1;
    case "Eighth Notes": return 2;
    case "Sixteenth Notes": return 4;
    default: return 1;
  }
}

function drawBeatBoxes(count, beatsPerMeasure) {
  beatBoxes.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const box = document.createElement('div');
    box.className = 'beatBox';
    box.style.display = 'inline-block';
    box.style.width = '30px';
    box.style.height = '30px';
    box.style.margin = '5px';
    box.style.border = '2px solid white';
    box.style.borderRadius = '5px';
    box.style.backgroundColor = i % beatsPerMeasure === 0 ? 'green' : 'gray';
    beatBoxes.appendChild(box);
  }
}

function updateVisualBeat(beatIndex, beatsPerMeasure) {
  const children = beatBoxes.children;
  for (let i = 0; i < children.length; i++) {
    children[i].style.opacity = i === beatIndex ? '1' : '0.3';
  }
}

// ========== VOLUME CONTROL ==========
const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('vol');

volumeIcon.addEventListener('click', () => {
  volumeSlider.style.display = (volumeSlider.style.display === 'none' || volumeSlider.style.display === '') ? 'inline-block' : 'none';
});

volumeSlider.addEventListener('input', () => {
  const vol = parseInt(volumeSlider.value);
  if (vol === 0) volumeIcon.textContent = '🔇';
  else if (vol <= 50) volumeIcon.textContent = '🔈';
  else volumeIcon.textContent = '🔊';
});

// ========== EXPORT / IMPORT ==========
document.getElementById('exportSongs').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(songs)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'songs.json';
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importSongs').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      songs = JSON.parse(event.target.result);
      localStorage.setItem('songs', JSON.stringify(songs));
      populateSongs();
    } catch (err) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
});
