import { fetchData, playLine, updateAnswer, showLine } from './playfunctions.js';
import { configureApi } from './api-config.js';
import { access_token } from './access_token.js';
import { generateColoredText, highlightDifferences } from './utils.js';
import { listeningCorrectionElement, listeningUserAttemptElement, prevButton, replayButton, nextButton, userAttemptInput, submitButton, listeningButton, readingButton } from './elements.js';
const { options, pauseOptions, playOptions, seekOptions, lyricsOptions } = configureApi(access_token);

(async () => {
  // Track info and Id
  const item = await fetchData(options);
  const trackId = item.item.id;
  
  // Album cover
  const albumCoverUrl = item.item.album.images[0].url;
  const imgElement = document.createElement("img");
  imgElement.src = albumCoverUrl;
  const imageContainer = document.getElementById("imageContainer");
  imageContainer.appendChild(imgElement);
  
  // Title
  const songTitle = item.item.name;
  document.getElementById("TrackId").innerText = songTitle;

  // Lyrics
  const lyricsOptions = {
    url: 'http://localhost:8000/?trackid=' + trackId 
  };
  const lyrics = await fetchData(lyricsOptions)
  let currentIndex = 0;
  
  // Default exercise
  let exercise = 'listening';
  window.exercise = exercise
  
  function replayLine() {
    playLine(currentIndex, lyrics);
    showLine()
  }

  function previousLine() {
    const prevIndex = (currentIndex - 1 + lyrics.lines.length) % lyrics.lines.length;
    playLine(prevIndex, lyrics);
    currentIndex = prevIndex;
    showLine()
  }

  function nextLine() {
    const nextIndex = (currentIndex + 1) % lyrics.lines.length;
    playLine(nextIndex, lyrics);
    currentIndex = nextIndex;
    showLine()
  }

  // Event listeners for buttons
  replayButton.addEventListener('click', replayLine);
  prevButton.addEventListener('click', previousLine);
  nextButton.addEventListener('click', nextLine);

  // Initial display
  playLine(currentIndex, lyrics);
  showLine()

  updateAnswer()
  
})()

var input = document.getElementById('userAttemptInput');

listeningButton.addEventListener('click', () => {
  if (window.exercise !== 'listening') {
    window.exercise = 'listening';
    input.placeholder = 'Type what you hear';
    listeningButton.classList.add('selected');
    readingButton.classList.remove('selected');
    showLine()
  }
});

readingButton.addEventListener('click', () => {
  if (window.exercise !== 'reading') {
    window.exercise = 'reading';
    input.placeholder = 'Type your translation';
    readingButton.classList.add('selected');
    listeningButton.classList.remove('selected');
    showLine()
  }
});
