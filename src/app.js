//Lap Yan Cheung (lyc286)
//Skeleton app
//Lap Yan Cheung (lyc286)

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
const session = require('express-session'); //session ID
// retrieve data from db
const mongoose = require('mongoose');

//use sounds router

//Message for debugging - start server
console.log("Server has started");
//Create app with express
const app = express();

const sessionOptions = {
	secret: 'soundsesh',
	saveUninitialized: false,
	resave: false
};
app.use(session(sessionOptions));

const publicPath = path.join(__dirname, "public");
//set view engine and hbs
app.set("view engine", "hbs");
//use serve static middleware
app.use(express.static(publicPath));
//middleware to log out requests
//middleware to access req.query
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));
const logger = (req, res, next) => {
  console.log(`Req Method: ${req.method}
Req Path: ${req.path}
Req Query: ${Object.values(req.query)}
Req Body: ${JSON.stringify(req.body)}`);
  next();
};

app.use(logger);
//middleware to send error message if an invalid page is requested
app.use((req, res, next) => {
  if(req.get('Host')) {
    next();
  } else {
    res.status(400).send('invalid request');
  }
});

//middleware to access res.local
app.use(function(req, res, next){
  res.locals.session = req.session;
  //res.locals.authenticated = ! req.user.anonymous;
  console.log("Session ID #"+res.locals.session.id);
  next();
});

//Routes for image feed
app.get('/', (req, res)=> {
  imgLinks = ['img/sample_1.jpg', 'img/sample_2.jpg', 'img/sample_3.jpg', 'img/sample_4.jpg'];
  res.render('home', {imgList: imgLinks});
});

app.get('/sampleImageCaptionPage', (req, res)=> {
  imgCaptions = ['shook', 'Midterms SZN', 'What is life?', '10+ years of experience?'];
  res.render('caption', {imgLink: 'img/sample_1.jpg', captionList: imgCaptions});
});

app.post('/sampleImageCaptionPage', (req, res) => {
  res.redirect('/');
});

//Routes for add image
app.get('/addImg', (req, res) => {
  res.render('addImg');
});

app.post('/addImg', (req, res) => {
  res.redirect('/');
});

//Route for profile
app.get('/profile', (req, res) => {
  const sampleUser = {
    name: "Johnny Walker",
    imgUploads: [{name: "Shocked man", link: "sampleImageCaptionPage"}],
    imgVotes: [{name: "Shocked man", link: "sampleImageCaptionPage"}, {name: "Attractive man", link: "#"}],
    captionVotes: [{name: "Shocked man", link: "sampleImageCaptionPage", caption: "10+ years of experience?"}]
  };
  res.render('profile', {sampleUser: sampleUser});
})





app.listen(3000);
