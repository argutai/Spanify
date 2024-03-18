export function configureApi(access_token) {
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

    const seekOptions = {
        url: 'https://api.spotify.com/v1/me/player/seek?position_ms=0',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        method: 'PUT'
      };

      const lyricsOptions = {
        url: 'http://localhost:8000'
      };
    return { options, pauseOptions, playOptions, seekOptions, lyricsOptions };
}