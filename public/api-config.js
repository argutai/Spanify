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
    
    return { options, pauseOptions, playOptions };
}