import { fetchData, playLine, updateAnswer } from './playfunctions.js';
import { configureApi } from './api-config.js';
import { access_token } from './access_token.js';
import { generateColoredText, highlightDifferences } from './utils.js';
import { wordsElement, usersWordsElement, prevButton, replayButton, nextButton, translationInput, submitButton } from './elements.js';
const { options, pauseOptions, playOptions, seekOptions, lyricsOptions } = configureApi(access_token);
let currentIndex = 0;


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
    url: 'http://127.0.0.1:8000/?trackid=' + trackId 
  };
  const lyrics = await fetchData(lyricsOptions)
  
  function replayLine() {
    playLine(currentIndex, lyrics);
  }

  function previousLine() {
    const prevIndex = (currentIndex - 1 + lyrics.lines.length) % lyrics.lines.length;
    playLine(prevIndex, lyrics);
    currentIndex = prevIndex;
  }

  function nextLine() {
    const nextIndex = (currentIndex + 1) % lyrics.lines.length;
    playLine(nextIndex, lyrics);
    currentIndex = nextIndex;
  }

  // Event listeners for buttons
  replayButton.addEventListener('click', replayLine);
  prevButton.addEventListener('click', previousLine);
  nextButton.addEventListener('click', nextLine);

  // Initial display
  playLine(currentIndex, lyrics);

  updateAnswer(window.words)

})()

