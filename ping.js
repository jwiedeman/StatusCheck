const request = require('request');
const PORT = 65500
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer')
const app = express();


// hit the url with https://yourserver.com/statuscheck?url=https://www.google.com
// or send the URL as form data

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.get('/statuscode', (req, res) => {
    let protocol = ["http://","http://www."]
    let form_data = req.body.url
    let queryString = req.query.url;
    let test_case = form_data || queryString
    let newUrl = parse_URL(test_case).host
    let end_url

        protocol.forEach(a => {
            var temp_url = a + newUrl
    
            console.log('loop' , temp_url)
            request
                .get({url:temp_url,followAllRedirect:false,followRedirect : false}) // http://
                .on('response', async function (response) { 
                    // get the resolved url
                 if(response.statusCode == 200) {
                    res.send(await ssr(temp_url))
                }
                        

                });  
    });
});


app.listen(PORT, function () {
    console.log('Server is running on Port:', PORT);
});

async function ssr(temp_url)  {
    console.log('puppeteerpls')
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const res = await page.goto('http://www.google.com');
    var data = await page.evaluate(async function(){
        return window.location.href;
    });
    await browser.close();
    return parse_URL(data).clean
    }

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

