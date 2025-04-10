let songs = [];
let currentInterval = null;
let isPlaying = false;

const selector = document.getElementById('songSelector');
const playButton = document.getElementById('togglePlay');
const beatBoxes = document.getElementById('beatBoxes');
const clickAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEA...'); // Add full base64

// Load songs from localStorage
window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('proClickSongs');
  if (stored) {
    songs = JSON.parse(stored);
    songs.forEach((song, index) => {
      addSongToUI(song, index);
    });
  }
});

// Show modal
document.getElementById('showForm').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'flex';
});

// Add song + update localStorage
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
  localStorage.setItem('proClickSongs', JSON.stringify(songs));

  addSongToUI(song, songs.length - 1);

  document.getElementById('songForm').reset();
  document.getElementById('modalOverlay').style.display = 'none';
});

// Cancel modal
document.getElementById('cancel').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
});

// Volume Control
const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('vol');

volumeIcon.addEventListener('click', () => {
  volumeSlider.style.display = volumeSlider.style.display === 'none' ? 'inline-block' : 'none';
});

volumeSlider.addEventListener('input', () => {
  const vol = parseInt(volumeSlider.value);
  clickAudio.volume = vol / 100;
  volumeIcon.textContent = vol === 0 ? '🔇' : vol <= 50 ? '🔈' : '🔊';
});

// Play/Pause toggle
playButton.addEventListener('click', () => {
  const selectedIndex = selector.value;
  if (selectedIndex === "" || isNaN(selectedIndex)) {
    alert("Select a song first!");
    return;
  }

  if (!isPlaying) {
    const song = songs[selectedIndex];
    startMetronome(song);
    playButton.textContent = '⏸️ Pause';
  } else {
    stopMetronome();
    playButton.textContent = '▶️ Play';
  }
  isPlaying = !isPlaying;
});

// --- Helper Functions ---
function addSongToUI(song, index) {
  // Dropdown
  const option = document.createElement('option');
  option.textContent = song.title;
  option.value = index;
  selector.appendChild(option);

  // Visual list
  const songDiv = document.createElement('div');
  songDiv.innerHTML = `<strong>${song.title}</strong> - ${song.bpm} BPM - ${song.timeSig} - ${song.subdivision}`;
  songDiv.style.padding = "10px";
  songDiv.style.borderBottom = "1px solid #ccc";
  document.getElementById('setList').appendChild(songDiv);
}

function startMetronome(song) {
  const beatsPerMeasure = parseInt(song.timeSig.split('/')[0]);
  const subDiv = getSubdivisionFactor(song.subdivision);
  const totalBeats = beatsPerMeasure * subDiv;
  const interval = 60000 / (song.bpm * subDiv);

  let beatCount = 0;
  drawBeatBoxes(totalBeats, beatsPerMeasure);

  currentInterval = setInterval(() => {
    clickAudio.currentTime = 0;
    clickAudio.play();
    updateVisualBeat(beatCount, beatsPerMeasure);
    beatCount = (beatCount + 1) % totalBeats;
  }, interval);
}

function stopMetronome() {
  clearInterval(currentInterval);
  beatBoxes.innerHTML = '';
}

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


// import/export
// Export songs to a .json file
document.getElementById('exportSongs').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(songs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pro-click-songs.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Import songs from a .json file
document.getElementById('importSongs').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  try {
    const importedSongs = JSON.parse(text);
    if (!Array.isArray(importedSongs)) throw new Error('Invalid format');

    songs = importedSongs;
    localStorage.setItem('proClickSongs', JSON.stringify(songs));

    // Clear and repopulate UI
    selector.innerHTML = '<option value="">Select a song</option>';
    document.getElementById('setList').innerHTML = '';
    songs.forEach((song, index) => addSongToUI(song, index));
    alert("Songs imported successfully!");
  } catch (err) {
    alert("Invalid file. Make sure it’s a valid Pro Click Track export.");
  }
});

