// Show modal
document.getElementById('showForm').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'flex';
});

// Add song and close modal
document.getElementById('addSong').addEventListener('click', () => {
  const title = document.getElementById('songTitle').value;
  const bpm = document.getElementById('bpm').value;
  const timeSig = document.getElementById('timeSignature').value;
  const subdivision = document.getElementById('subdivision').value;

  if (title.trim() === "") {
    alert("Please enter a song title.");
    return;
  }

  const songDiv = document.createElement('div');
  songDiv.innerHTML = `<strong>${title}</strong> - ${bpm} BPM - ${timeSig} - ${subdivision}`;
  songDiv.style.padding = "10px";
  songDiv.style.borderBottom = "1px solid #ccc";
  document.getElementById('setList').appendChild(songDiv);

  // Reset form and close
  document.getElementById('songForm').reset();
  document.getElementById('modalOverlay').style.display = 'none';
});

// Cancel button just closes modal
document.getElementById('cancel').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
});



// Volume Control
const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('vol');

volumeIcon.addEventListener('click', () => {
  // Toggle visibility
  if (volumeSlider.style.display === 'none' || volumeSlider.style.display === '') {
    volumeSlider.style.display = 'inline-block';
  } else {
    volumeSlider.style.display = 'none';
  }
});

// Icon change depending on the volume level
volumeSlider.addEventListener('input', () => {
  const vol = parseInt(volumeSlider.value);
  if (vol === 0) volumeIcon.textContent = '🔇';
  else if (vol <= 50) volumeIcon.textContent = '🔈';
  else volumeIcon.textContent = '🔊';
});



// testing code remove if not working play/pause
let songs = [];
let currentInterval = null;
let isPlaying = false;
const selector = document.getElementById('songSelector');
const playButton = document.getElementById('togglePlay');
const beatBoxes = document.getElementById('beatBoxes');
const clickAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEA...'); // Replace with real short click sound

// Add song to selector and list
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

  // ✅ NEW: Add to dropdown
  const option = document.createElement('option');
  option.textContent = `${title}`;
  option.value = songs.length - 1;
  document.getElementById('songSelector').appendChild(option);

  const songDiv = document.createElement('div');
  songDiv.innerHTML = `<strong>${title}</strong> - ${bpm} BPM - ${timeSig} - ${subdivision}`;
  songDiv.style.padding = "10px";
  songDiv.style.borderBottom = "1px solid #ccc";
  document.getElementById('setList').appendChild(songDiv);

  document.getElementById('songForm').reset();
  document.getElementById('modalOverlay').style.display = 'none';
});

// Play/Pause logic
playButton.addEventListener('click', () => {
  if (!isPlaying) {
    const selectedIndex = selector.value;
    if (selectedIndex === "" || isNaN(selectedIndex)) {
      alert("Select a song first!");
      return;
    }

    const song = songs[selectedIndex];
    startMetronome(song);
    playButton.textContent = '⏸️ Pause';
  } else {
    stopMetronome();
    playButton.textContent = '▶️ Play';
  }
  isPlaying = !isPlaying;
});

// Start metronome
function startMetronome(song) {
  const beatsPerMeasure = parseInt(song.timeSig.split('/')[0]);
  const subDiv = getSubdivisionFactor(song.subdivision);
  const totalBeats = beatsPerMeasure * subDiv;
  const interval = 60000 / (song.bpm * subDiv); // ms per tick

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

// Create beat boxes
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

// Highlight current beat
function updateVisualBeat(beatIndex, beatsPerMeasure) {
  const children = beatBoxes.children;
  for (let i = 0; i < children.length; i++) {
    children[i].style.opacity = i === beatIndex ? '1' : '0.3';
  }
}

