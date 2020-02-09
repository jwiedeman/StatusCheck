const axios = require('axios');
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = 65500
const app = express();
// set theme
colors.setTheme({
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  sent: 'green',
  recieved: 'grey',
  help: 'cyan',
  update: 'yellow',
  debug: 'blue',
  error: 'red'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

axios.defaults.maxRedirects = 0;
axios.defaults.headers.common['Upgrade-Insecure-Requests'] = 1
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML. like Gecko) Chrome/79.0.3945.130 Safari/537.36'

const url_cases = [
  'http://',
  'http://www.'
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

app.get('/statuscode', (req, res) => {
  console.log('####' , req.body)
    let form_data = req.body.url
    let queryString = req.query.url;
    let url_request = form_data || queryString
    let clean_url = parse_URL(url_request).host  // Strips everything down to only the domain name and domain extension. 
    
    url_cases.forEach(url => {
            let new_url = url + clean_url
            axios.get(new_url)
            .then((response) => parseResponse(new_url, response))
            .catch((error) => parseResponse(new_url, error.response, error));
    });
});


app.listen(PORT, function () {
    console.log('StatusCheck server listening on port : ', PORT);
});

function parse_URL(url) {
    console.log('URL PARSE  ' + url)
    const a = new URL(url)
    return {
        source: url,
        protocol: a.protocol.replace(":", ""),
        hostname: a.hostname,
        host:a.host.indexOf('www.') && a.host || a.host.replace('www.', ''),
        port: a.port,
        clean:a.protocol+a.hostname,
        query: a.search,
        params: (function () {
            var ret = {},
                seg = a.search.replace(/^\?/, "").split("&"),
                len = seg.length,
                i = 0,
                s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split("=");
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ""])[1], 
        hash: a.hash.replace("#", ""),
        path: a.pathname.replace(/^([^\/])/, "/$1"),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ""])[1],
        segments: a.pathname.replace(/^\//, "").split("/")
    };
}


