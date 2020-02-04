var request = require('request');
const PORT = 65500
const express = require('express');
const app = express();
const cors = require('cors');
//Blow up the URL


app.use(cors());
app.get('/statuscode', (req, res) => {
    // Pull message from query string in request
    let message = req.query.message;
    // validate input
 
        res.send('connected - success');
});

app.listen(PORT, function () {
    console.log('Server is running on Port:', PORT);
});



request
    .get('http://www.google.com/')
    .on('response', function (response) {
        console.log(response.statusCode) // 200
    })



function parse_URL(url) {
    var a = document.createElement("a");
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(":", ""),
        host: a.hostname,
        port: a.port,
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