// init project
var express = require('express');
var app = express();
var mongoose = require('mongoose')
var mongodb = require('mongodb')
var cors = require('cors')
var bodyParser = require('body-parser')
var Bing = require('node-bing-api')({ accKey : '215e6fbd347242a4af449843ccb105e0'})
var searchTerm = require('./models/searchTerm')
mongoose.connect(process.env.SECRET)

app.use(bodyParser.json())
app.use(cors())

app.get("/", function (request, response) {
  response.send('Welcome To Image Search Abstraction')
});

//image search get call
app.get("/api/imagesearch/:searchVal*", (req,res,next)=>{
  var {searchVal} = req.params
  var {offset} = req.query
  
  var data = new searchTerm({
    searchVal,
    searchDate: new Date()
  })
  data.save(err =>{
    if(err){
      res.send('ERROR saving to DB')
    }
    
  })
  
  //calling the API
  var searchOffset;
  if (offset){
    if(offset==1){
      offset = 0
      searchOffset = 1
    }
    else if(offset>1) {
      searchOffset = offset+1
    }
  }
  
  Bing.images(searchVal, {
    top:10*searchOffset,
    skip: 10*offset
  }, function(error, rez, body){
    var bingData = []
    for(var i=0; i<10; i++){
      bingData.push({
        url: body.value[i].webSearchUrl,
        snippet: body.value[i].name,
        thumbnail: body.value[i].thumbnailUrl,
        context: body.value[i].hostPageDisplayUrl
        
      })
    }
    res.json(bingData)
  })
  
})

// recent search get call
app.get('/api/recentsearches', (req,res,next)=>{
  searchTerm.find({}, (err,data)=>{
    res.json(data)
  })
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
