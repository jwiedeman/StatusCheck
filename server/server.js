console.clear()
const axios = require('axios');
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')
const PORT = 65500
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
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




axios.defaults.maxRedirects = 0;
axios.defaults.headers.common['Upgrade-Insecure-Requests'] = 1
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML. like Gecko) Chrome/79.0.3945.130 Safari/537.36'
let clean_url ={}
const url_cases = [
  'http://',
  'http://www.',
  'https://',
  'https://www.'
];



// Mongoose Server 
mongoose.connect('mongodb://localhost/test' , {useNewUrlParser : true , useUnifiedTopology : true} )
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected to mongodb')// we're connected!
});


const kittySchema = new mongoose.Schema({
  name: String
});

kittySchema.methods.speak = function () {
  const greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}


const Kitten = mongoose.model('Kitten', kittySchema);

const silence = new Kitten({ name: 'Silence' });


silence.save(function (err, fluffy) {
  if (err) return console.error(err);
  silence.speak();
});

Kitten.find(function (err, kittens) {
  if (err) return console.error(err);
  console.log(kittens);
})





app.get('/statuscode', (req, res) => {
    let form_data = req.body.url
    let query_string = req._parsedUrl.query.replace('url=',''); // does axios not parse query strings?
    let url_request = form_data || query_string // accept either form data or query string
    let clean_url = parse_URL(url_request).host  // Strips everything down to only the domain name and TLD
    url_cases.forEach((url,index) => {
            let new_url = url + clean_url
            axios.get(new_url)
            .then((response) =>{
                res.send(parseResponse(new_url, response))
            })
            .catch((error) => null);
    });
});


app.listen(PORT, function () {
    console.log('StatusCheck server listening on port : ', PORT);
});

function parse_URL(url) {
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

function getFinalUrlFromResponse(response, requestedUrl) {
  if (!response) return null;
  const headerLocation = response.headers && response.headers.location;
  return !headerLocation ? requestedUrl : new URL(headerLocation, requestedUrl).href;
}

function parseResponse(requestedUrl, response, error = null) {
  const finalLocation = getFinalUrlFromResponse(response, requestedUrl);
  const acceptableStatuses = { 200 : true };
  const requestPart = acceptableStatuses[response.status]
  if(acceptableStatuses[response.status] == true) {
    return finalLocation
  } 
}

