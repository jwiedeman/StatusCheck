console.clear()
const axios = require('axios');
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')
const cheerio = require('cheerio')
const PORT = 65500
const app = express();
const log = console.log;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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





const entitySchema = new mongoose.Schema({
  name: String,
  domainName : String,
  pages:[
    {
      pageUrl:String,
      crawled:Boolean
    }
  ]
});

entitySchema.methods.speak = function () {
  const greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}


const Entity = mongoose.model('Kitten', entitySchema);



app.get('/getcontext', (req, res) => {
  log('GET REQUEST - Context Requested'.bgBlack.red)
  Entity.find(function (err, dbcontent) {
    if (err) return console.error(err);
    res.send(dbcontent)
  })     
});


app.post('/deleteentity',function(req,res){
  log('GET REQUEST - deleteentity Requested'.bgBlack.red)
  Entity.deleteOne({ _id: req.body._id }).then(console.log('delete',req.body));
  res.send()
});

app.post('/crawltarget', async (req,res) => {
  let dbQuery = await Entity.find({_id: req.body._id}).exec();
  let entityPages = dbQuery[0].pages 
  let workList = [dbQuery[0].name] // initial entry point 
  
  /*
  workList.forEach(async element => {
    await fetchData(element).then(async (res) => { 
      const html = res.data;
      const $ = cheerio.load(html);
      const targetPageLinks = $("a[href*='http']")
      
      await targetPageLinks.each(function(i,link){
       _link = domainName($(link).attr('href'))
       _origin =  domainName(dbQuery[0].name)
       _link==_origin  ? workList.push($(link).attr('href')) : null
      })
    })
  })*/


    while(workList.length > 0) {
       let res = await fetchData(workList[0]).then(async (res) => { 
         log('REMOVING',workList.shift())
        const html = res.data;
        const $ = cheerio.load(html);
        const targetPageLinks = $("a[href*='http']")
        
        await targetPageLinks.each(function(i,link){
         _link = domainName($(link).attr('href'))
         _origin =  domainName(dbQuery[0].name)
         _link==_origin  ? workList.push($(link).attr('href')) : null
         _link==_origin  ? log(_link , _origin , $(link).attr('href') ) : null
        })
        
      }) 
       
    }
  


  /*
    fetchData(workList[0]).then(async (res) => { 
      const html = res.data;
      const $ = cheerio.load(html);
      const targetPageLinks = $("a[href*='http']")
      
      await targetPageLinks.each(function(i,link){
       _link = domainName($(link).attr('href'))
       _origin =  domainName(dbQuery[0].name)
       console.log(_link , _origin)
       _link==_origin  ? workList.push($(link).attr('href')) : null
      })

      let cleanSet = new Set(dbQuery[0].pages)
      dbQuery[0].pages = [...cleanSet]
      dbQuery[0].save()
    })


  }*/
  
res.send()
});


app.post('/statuscode', (req, res) => {
  console.log('Axios Requested : ' + req.body.url)
    let form_data = req.body.url
    let clean_url = parse_URL(form_data).host  // Strips everything down to only the domain name and TLD
    url_cases.forEach((url,index) => {
            let new_url = url + clean_url
            axios.get(new_url)
            .then((response) =>{
                var parseResult = parseResponse(new_url, response)
                Entity.findOne({name:parseResult}, function(err, entity){
                  if(err) console.log(err);
                  if ( entity){
                      console.log("This has already been saved");
                  } else {
                      var entity = new Entity({ name: parseResult });
                      entity.save(function(err, entity) {
                          if(err) console.log(err);
                          console.log("New entity created" , entity );
                      
                      });
                  }
                });
                res.send(parseResult)
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

function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }

  return a;
}

async function fetchData(url){
  log(("Requesting data... " + url).white)
  let response = await axios(url).catch((err) => log(err.bgRed));
  if(response.status !== 200){
      log("Error occurred while fetching data".bgRed);
      return;
  }
  return response;
}

function domainName(domain) {
  const a = new URL(domain)
  a.href = domain;
  const { hostname } = a;
  const hostSplit = hostname.split('.');
  hostSplit.pop();
  if (hostSplit.length > 1) {
    hostSplit.shift();
  }
  return hostSplit.join();
}


