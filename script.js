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
