//Lap Yan Cheung (lyc286)
//Skeleton app
//Lap Yan Cheung (lyc286)

const express = require('express');
const mongoose = require('mongoose');
require('./db');

const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); //session ID
// retrieve data from db
const Image = mongoose.model('Image');
const User = mongoose.model('User');
const Caption = mongoose.model('Caption');


//use sounds router

//Message for debugging - start server
console.log("Server has started");
//Create app with express
const app = express();

const sessionOptions = {
	secret: 'imgSesh',
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
  console.log(`Req Method: ${req.method} Req Path: ${req.path} Req Query: ${Object.values(req.query)}Req Body: ${JSON.stringify(req.body)}`);
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
	/*
  imgLinks = ['img/sample_1.jpg', 'img/sample_2.jpg', 'img/sample_3.jpg', 'img/sample_4.jpg'];
  res.render('home', {imgList: imgLinks});
	*/
	//Image.find()
	Image.find({}, function(err, imgs, count){
    if (err) {
      res.status(500).send("Internal Error");
    } else {
      //console.log(`# of articles: ${imgs.length}`);
			console.log("IMAGE: "+imgs);
      res.render("home.hbs", {imgList: imgs});
    }
  });
});

//Dummy counter

//Recieves data when user clicks a button in home screen
app.post('/', (req, res)=> {
	Image.findOneAndUpdate({_id: req.body.img_id}, {$inc:{score:1}}, function(err, img, count){
		if (err) {
			const errMsg = "UPVOTE UPDATE ERROR";
			console.log(errMsg);
		} else {
			console.log(img.name +" score INCREMENTED");
		}
	});
	res.redirect('/');
});

//Use regex to access the caption page for images
app.get(/\/img\/[a-z]+/, (req, res)=> {
	const imgSLUG = req.path.split("/")[2];
	Image.findOne({slug: imgSLUG}, function(err, img, count){
		if (err) {
			console.log("LOAD CAPTION PAGE ERROR");
			res.redirect('/');
		} else {
			console.log("IMAGE_CAPTION: "+img);
			res.render('caption', {image: img});
		}
	});
  //res.render('caption', {imgLink: 'sample_1.jpg', captionList: imgCaptions});
});

app.post(/\/img\/[a-z]+/, (req, res) => {
	const imgSLUG = req.path.split("/")[2];
  const newCaption = new Caption({
		caption: req.body.caption,
		captionCreator: "123456",
		score: 0,
	});

	Image.findOne({slug: imgSLUG}, function(err, img, count) {
		//if (newCaption.caption!=='') {
		img.captions.push(newCaption);
		//	res.render('caption', {image: img, message: "Can't submit an empty caption"});
		//};
		img.save(function(err, savedImg, count) {
			if (err) {
				console.log("Save error");
				res.render('caption', {image: img, message: "Save error"});
			} else {
				//console.log("CAPTIONS-2: "+img.captions);
				console.log("Saved: "+savedImg);
				res.redirect(req.path);
			}
		});
	});
	/*
	Image.findOneAndUpdate({slug: imgSLUG}, {$push:{captions: newCaption}}, function(err, img, count){
		let msg = "";
		if (err) {
			msg = "Caption Input Error"
			console.log(msg);
			res.render('caption', {images: img, message: msg});
		} else {
			//img.captions.push(newCaption);
			console.log("Caption saved: "+newCaption.caption);
			res.redirect(req.path);
		}
	});
	*/
});

//Routes for add image
app.get('/addImg', (req, res) => {
  res.render('addImg');
});

app.post('/addImg', (req, res) => {
	new Image({
		name: req.body.name,
		imgURL: req.body.url,
		creator_ID: "sampleTestingID123",
		created_Date: new Date(),
		score: 0,
		tags: req.body.tags.toLowerCase().split(" "),
		captions: []
	}).save(function(err, img, count) {
		if (err){
			const errMsg = "SAVE ARTICLE ERROR";
			console.log(err);
			res.render('addImg');
		} else {
			console.log("Img saved: "+ req.body.name);
			res.redirect('/');
		}
	});
  //res.redirect('/');
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
