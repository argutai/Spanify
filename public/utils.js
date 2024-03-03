export function fetchzData(options) {

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