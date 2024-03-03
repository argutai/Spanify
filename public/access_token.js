var url = window.location.href;
var params = new URLSearchParams(url.split('?')[1]);
export const access_token = params.get('access_token');
