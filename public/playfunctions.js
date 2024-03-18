import { listeningCorrectionElement, readingPromptElement, listeningUserAttemptElement } from './elements.js';
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
  
  // Seek to the start time of the line
  seekToStartTime(currentStartTime);

  // Schedule the pause action after the specified period
  pauseTimeout = setTimeout(() => {
    fetchData(pauseOptions);
    pauseTimeout = null; // Reset the timeout ID after execution
  }, nextStartTime - currentStartTime);

  fetchData(playOptions);
}

export function showLine() {
  // const questionMarksString = '_'.repeat(currentLine.words.length);
  if (window.exercise === 'listening') {
    listeningCorrectionElement.textContent = '';
    listeningUserAttemptElement.innerHTML = '';
    readingPromptElement.textContent = '';
  } else if (window.exercise === 'reading') {
    readingPromptElement.textContent = window.words;
    listeningCorrectionElement.textContent = '';
    listeningUserAttemptElement.innerHTML = '';
  } else {
    throw new Error('Execise not set')
  }
}


export function seekToStartTime(startTime) {
  seekOptions.url = 'https://api.spotify.com/v1/me/player/seek?position_ms=' + startTime,
  fetchData(seekOptions);
}


// AJAX send string to server to Translate
function sendToTranslate(words, callback) {
  const xhr = new XMLHttpRequest();
  const url = '/translate'; 
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const responseText = xhr.responseText;
        if (callback) {
          callback(responseText); // Call the callback function with the responseText
        }
      } else {
        console.error('Error:', xhr.status);
      }
    }
  };
  xhr.send(JSON.stringify({ stringData: words }));
}

export function multifuctionButton() {
  if (window.exercise === 'listening') {
    console.log("multifuctional button: " + window.exercise)
    const userInput = userAttemptInput.value;
    const differences = highlightDifferences(window.words, userInput)
    console.log('Differences:', differences);
  
    listeningCorrectionElement.textContent = window.words;
    listeningUserAttemptElement.innerHTML = generateColoredText(userInput, differences);

    userAttemptInput.value = '';
  } else if (window.exercise === 'reading') {
    console.log("multifuctional button: " + window.exercise)
    const userInput = userAttemptInput.value;

    sendToTranslate(window.words, function(response) {
      listeningCorrectionElement.textContent = response;
    });

    listeningUserAttemptElement.innerHTML = userInput;

    userAttemptInput.value = '';
  }
}

export function updateAnswer() {
  userAttemptInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      multifuctionButton();
    }
  });
}
