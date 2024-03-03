// Get access token from URL
var url = window.location.href;
var params = new URLSearchParams(url.split('?')[1]);
var access_token = params.get('access_token');

function fetchData(options) {

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

// Usage:
const options = {
  url: 'https://api.spotify.com/v1/me/player/currently-playing',
  headers: {
    'Authorization': 'Bearer ' + access_token
  }
};
const pauseOptions = {
  url: 'https://api.spotify.com/v1/me/player/pause',
  headers: {
    'Authorization': 'Bearer ' + access_token
  },
  method: 'PUT'
};
const playOptions = {
  url: 'https://api.spotify.com/v1/me/player/play',
  headers: {
    'Authorization': 'Bearer ' + access_token
  },
  method: 'PUT'
};

(async () => {
  const item = await fetchData(options);
  const trackId = item.item.id;
  
  // Album cover
  const albumCoverUrl = item.item.album.images[0].url;
  const imgElement = document.createElement("img");
  imgElement.src = albumCoverUrl;
  const imageContainer = document.getElementById("imageContainer");
  imageContainer.appendChild(imgElement);
  
  // Title
  const name = item.item.name;
  document.getElementById("TrackId").innerText = name;

  const lyricsOptions = {
    url: 'http://127.0.0.1:8000/?trackid=' + trackId 
  };
  const lyrics = await fetchData(lyricsOptions)

  let currentIndex = 0;
  const wordsElement = document.getElementById('words');
  const translatedWordsElement = document.getElementById('translatedWords');
  const prevButton = document.getElementById('prevButton');
  const replayButton = document.getElementById('replayButton');
  const nextButton = document.getElementById('nextButton');

  function displayWords(index) {
    const currentLine = lyrics.lines[index];
    const nextIndex = (index + 1) % lyrics.lines.length;
    const nextLine = lyrics.lines[nextIndex];
    
    const currentStartTime = currentLine.startTimeMs;
    const nextStartTime = nextLine.startTimeMs;

    // Display the words
    window.words = currentLine.words;

    // Use AJAX to send the string to the server
    const xhr = new XMLHttpRequest();
    const url = '/translate'; // Replace with your server endpoint
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // Response received successfully
          const responseText = xhr.responseText;
          console.log('Response from server:', responseText);
          // Do something with the response here
        } else {
          // Handle error
          console.error('Error:', xhr.status);
        }
      }
    };
    xhr.send(JSON.stringify({ stringData: window.words }));

    // const questionMarksString = '?'.repeat(currentLine.words.length);
    const questionMarksString = '';
    wordsElement.textContent = questionMarksString;
    const displayElement = document.getElementById('userswords');
    displayElement.innerHTML = '';
    
    // Seek to the start time of the line
    seekToStartTime(currentStartTime);
    period = nextStartTime - currentStartTime
    setTimeout(() => {
      fetchData(pauseOptions)
    }, period);
    fetchData(playOptions);
  }


  function seekToStartTime(startTime) {
    const seekOptions = {
      url: 'https://api.spotify.com/v1/me/player/seek?position_ms=' + startTime,
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      method: 'PUT'
    };

    // Make a request to seek to the specified start time
    fetchData(seekOptions);
  }

  function displayNextWords() {
    const nextIndex = (currentIndex + 1) % lyrics.lines.length;
    displayWords(nextIndex);
    currentIndex = nextIndex;
  }

  function displayPrevWords() {
    const prevIndex = (currentIndex - 1 + lyrics.lines.length) % lyrics.lines.length;
    displayWords(prevIndex);
    currentIndex = prevIndex;
  }

  function replayWords() {
    displayWords(currentIndex);
  }

  // Event listeners for buttons
  prevButton.addEventListener('click', displayPrevWords);
  replayButton.addEventListener('click', replayWords);
  nextButton.addEventListener('click', displayNextWords);

  // Initial display
  displayWords(currentIndex);

  // Submit button
  submitButton.addEventListener('click', function() {
    const userInput = translationInput.value;
    const differences = highlightDifferences(window.words, userInput)
    // Do something with the user input, such as logging it to the console
    console.log('Differences:', differences);

  // Get the element where you want to display the colored text
    const displayElement = document.getElementById('userswords');

    // Generate the colored text and append it to the display element
    displayElement.innerHTML = generateColoredText(userInput, differences);
    wordsElement.textContent = window.words;
    // You can also clear the input box after submission if needed
    translationInput.value = '';
  });

})()

// Get the input and submit button elements
const translationInput = document.getElementById('translationInput');
const submitButton = document.getElementById('submitButton');


// Function to generate HTML with colored text
function generateColoredText(string, positions) {
  let result = '';

  // Loop through each character in the string
  for (let i = 0; i < string.length; i++) {
      // Check if the current character position should be highlighted
      if (positions.includes(i)) {
          // If the position is in the array, use red color
          result += `<span style="color: red;">${string[i]}</span>`;
      } else {
          // Otherwise, use green color
          result += `<span style="color: green;">${string[i]}</span>`;
      }
  }

  return result;
}

function highlightDifferences(modelString, newString) {
  const differences = [];
  let modelIndex = 0;
  let newIndex = 0;

  while (modelIndex < modelString.length || newIndex < newString.length) {
      if (modelString[modelIndex] !== newString[newIndex]) {
      differences.push(newIndex);

      // If characters are different, check if the current index in newString should match the next index in modelString
      if (modelString[modelIndex + 1] === newString[newIndex]) {
          modelIndex++;
      } else if (modelString[modelIndex] === newString[newIndex + 1]) {
          newIndex++;
      }
      }

      // Move to the next character in both strings
      modelIndex++;
      newIndex++;
  }
  return differences;
}



