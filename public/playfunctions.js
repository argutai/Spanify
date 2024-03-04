const wordsElement = document.getElementById('words');
const usersWordsElement = document.getElementById('userswords');
import { configureApi } from './api-config.js';
import { access_token } from './access_token.js';
import { generateColoredText, highlightDifferences } from './utils.js'

const { options, pauseOptions, playOptions, seekOptions } = configureApi(access_token);

export function fetchData(options) {

    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body || null
      };
  
      fetch(options.url, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          if (error instanceof SyntaxError) {
            console.error('SyntaxError: The string did not match the expected pattern');
          }
          reject(error); // Reject the promise with the error
        });
    });
  }



let pauseTimeout = null; // Variable to store the timeout ID

export function playLine(index, lyrics) {
  const currentLine = lyrics.lines[index];
  const nextIndex = (index + 1) % lyrics.lines.length;
  const nextLine = lyrics.lines[nextIndex];
  const currentStartTime = currentLine.startTimeMs;
  const nextStartTime = nextLine.startTimeMs;
  window.words = currentLine.words;

  // Clear any existing timeout
  if (pauseTimeout !== null) {
    clearTimeout(pauseTimeout);
    pauseTimeout = null;
  }

  // const questionMarksString = '?'.repeat(currentLine.words.length);
  wordsElement.textContent = '';
  usersWordsElement.innerHTML = '';
  
  // Seek to the start time of the line
  seekToStartTime(currentStartTime);

  // Schedule the pause action after the specified period
  pauseTimeout = setTimeout(() => {
    fetchData(pauseOptions);
    pauseTimeout = null; // Reset the timeout ID after execution
  }, nextStartTime - currentStartTime);

  fetchData(playOptions);
}

export function seekToStartTime(startTime) {
  seekOptions.url = 'https://api.spotify.com/v1/me/player/seek?position_ms=' + startTime,
  fetchData(seekOptions);
}


// AJAX send string to server to Translate
function sendToTranslate(words) {
  const xhr = new XMLHttpRequest();
  const url = '/translate'; 
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const responseText = xhr.responseText;
        console.log('Response from server:', responseText);
      } else {
        console.error('Error:', xhr.status);
      }
    }
  };
  xhr.send(JSON.stringify({ stringData: words }));
}


export function updateAnswer(words) {
  submitButton.addEventListener('click', function() {
    const userInput = translationInput.value;
    const differences = highlightDifferences(words, userInput)
    console.log('Differences:', differences);
  
    // Generate the colored text and append it to the display element
    wordsElement.textContent = window.words;
    usersWordsElement.innerHTML = generateColoredText(userInput, differences);

    translationInput.value = '';
  });
}
