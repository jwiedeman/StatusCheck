const axios = require('axios');

axios.defaults.maxRedirects = 0;
axios.defaults.headers.common['Upgrade-Insecure-Requests'] = 1
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML. like Gecko) Chrome/79.0.3945.130 Safari/537.36'

const urls = [
  'http://google.com',
  'http://www.google.com',
  'https://google.com',
  'https://www.google.com/',
];

function getFinalUrlFromResponse(response, requestedUrl) {
  if (!response) return null;
  const headerLocation = response.headers && response.headers.location;
  return !headerLocation ? requestedUrl : new URL(headerLocation, requestedUrl).href;
}

function parseResponse(requestedUrl, response, error = null) {
  if (!response) return;
  const finalLocation = getFinalUrlFromResponse(response, requestedUrl);
  const acceptableStatuses = { 200 : true };
  const requestPart = acceptableStatuses[response.status]
  ? ` * ${requestedUrl} (\x1b[32m${response.status}\x1b[0m)`
  : ` * ${requestedUrl} (\x1b[31m${response.status}\x1b[0m)`

  if (requestedUrl !== finalLocation) {
    console.log(` * ${requestPart} -> \x1b[31m${finalLocation}\x1b[0m`);
  } else {
    console.log(` * ${requestPart} -> \x1b[32mOK\x1b[0m`);
  }
}

urls.forEach((_url) => {
  axios.get(_url)
    .then((response) => parseResponse(_url, response))
    .catch((error) => parseResponse(_url, error.response, error));
});
