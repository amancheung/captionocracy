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

const passport = require('passport');
const passportFB = require('./fbauth');

//use sounds router

//Message for debugging - start server
console.log("Server has started");
//Create app with express
const app = express();

app.use(passport.initialize());
app.use(passport.session());

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
  console.log(`Req Method: ${req.method} Req Path: ${req.path} Req Query: ${Object.values(req.query)} Req Body: ${JSON.stringify(req.body)}`);
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
	//res.locals.user = req.session.passport.user;
  //res.locals.authenticated = ! req.user.anonymous;
  console.log("Session ID #"+res.locals.session.id);
  next();
});

//Class for every user content upload action
class Upload {
	//Record type of action - Image upload or Caption upload its Date
	constructor(type, date, content, link){
		this.type = type;
		this.date = date;
		this.content = content;
		this.link = link;
	}
}

//Routes for image feed
//Ref for mongoose sorting: https://medium.com/@jeanjacquesbagui/in-mongoose-sort-by-date-node-js-4dfcba254110
app.get('/', (req, res)=> {
	//Debug
	if (req.session.passport){
		console.log("USER: "+req.session.passport.user.displayName);
	} else {
		console.log("NOT LOGGED IN");
	}
	Image.find({}).sort('-score').exec(function(err, imgs, count){
    if (err) {
      res.status(500).send("Internal Error");
    } else {
			let filterTerm = '';
			let filteredResultCount = 0;
			//If filter is entered - display filtered results
			if (req.query.filter && req.query.filter!==''){
				console.log(`Filter ${req.query.filter} is entered`); //Debug log
				//Function to filter results by tag
				imgs = imgs.filter(function(art) {
					for (const t of art.tags) {
		        if (t===req.query.filter.toLowerCase()) {
		          return true;
		        }
      		}
      		return false;
				});
				filterTerm = req.query.filter;
				filteredResultCount = imgs.length;
			} else {
				console.log("No filter"); //Debug log
			}
			console.log("IMAGE: "+imgs);
      res.render("home.hbs", {imgList: imgs, term: filterTerm, count: filteredResultCount});
    }
  });
});

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
//Ref for mongoose sorting: https://medium.com/@jeanjacquesbagui/in-mongoose-sort-by-date-node-js-4dfcba254110
app.get(/\/img\/[a-z]+/, (req, res)=> {
	const imgSLUG = req.path.split("/")[2];
	console.log("SLUG IS: "+imgSLUG);
	Image.findOne(({slug: imgSLUG}), function(err, img, count){
		if (err) {
			console.log("LOAD CAPTION PAGE ERROR");
			res.redirect('/');
		} else {
			Caption.find({artID: img._id}).sort("-score").exec(function(err, captions, count){
				if (err) {
					console.log("LOAD CAPTIONS ERROR");
					res.redirect('/');
				} else {
					console.log("LOAD CAPTIONS SUCCESS");
					res.render('caption', {image: img, captions: captions})
				}
			});
		}
	});
  //res.render('caption', {imgLink: 'sample_1.jpg', captionList: imgCaptions});
});

app.post(/\/img\/[a-z]+/, (req, res) => {
	const imgSLUG = req.path.split("/")[2];
	if (req.body.cap_id) {
		//console.log("Vote!");
		Caption.findOneAndUpdate({_id: req.body.cap_id}, {$inc: {score :1}}, function(err, caption, count){
			if (err) {
				console.log(err);
			} else {
				/*
				const captionUpdate = img.captions.id(req.body.cap_id);
				captionUpdate.score += 1;
				console.log("Updated Caption: "+captionUpdate);
				img.captions.id(req.body.cap_id).remove();
				img.captions.push(captionUpdate);
				img.save(function(err, saveUpdateImg, count){
					if (err) {
						console.log("Save caption update error");
					} else {
						console.log("Caption score updated");
					}
				});
				*/
			}
		});
	} else {
		console.log("No Vote!");

		Image.findOne({slug: imgSLUG}, function(err, img, count) {
			/*
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
			*/
			const newCaption = new Caption({
				artID: img._id,
				caption: req.body.caption,
				captionCreator: "123456",
				score: 0,
			});
			if (err) {
				console.log("SAVE CAPTION ERROR -1");
				res.redirect(req.path);
			} else {
				newCaption.save(function(err, savedCaption, count){
					if (err) {
						console.log("SAVE CAPTION ERROR -2");
					} else {
						console.log("NEW CAPTION SAVED");
						res.redirect(req.path);
					}
				});
			}
		});
	}
});

//Routes for add image
app.get('/addImg', (req, res) => {
  res.render('addImg');
});

app.post('/addImg', (req, res) => {
	new Image({
		name: req.body.name,
		imgURL: req.body.url,
		creator_ID: req.session.passport.user.displayName,
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
			//Also record this action to user's db entry
			const newImgUpload = new Upload("Image upload", new Date(), img.name, "/img/"+img.slug);
			User.findOneAndUpdate({userID: req.session.passport.user.id}, {$push: {history: newImgUpload}}, function(err, usr, count){
				if (err){
					console.log("SAVE RECORD TO USER ERROR");
				}
			});
			res.redirect('/');
		}
	});
  //res.redirect('/');
});

app.get('/login', (req, res) => {
	res.render('login');
});

//Logout implementation ref: https://github.com/jaredhanson/passport-facebook/issues/202
app.get('/logout', (req, res) => {
	//res.render('logout');
		req.session.destroy((err) => {
		if(err) return next(err)

		req.logout();
		//res.sendStatus(200);
		res.redirect('/')
	})
});

//Pasport setup
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/fbauth', passportFB.authenticate('facebook'));

app.get('/fbauth/callback', passportFB.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect home.
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



app.listen(process.env.PORT || 3000);
