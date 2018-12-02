//Lap Yan Cheung (lyc286)

const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

// is the environment variable, NODE_ENV, set to DEV?
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in DEV mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);
 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 console.log(`login: ${conf.dbconf}`);
 dbconf = conf.dbconf;
} else {
 // if we're not in DEV mode (the graders are testing your work), then use
 console.log("Non-dev mode");
 dbconf = 'mongodb://localhost/finalprj';
}

const URLSlugs = require('mongoose-url-slugs');
// is the environment variable, NODE_ENV, set to DEV?

// schema goes here
// create sound schema w/ data validation

const UserSchema = new mongoose.Schema({
	userId: {type: String, required: true},
	displayName: {type: String, required: true},
  history: Array
});


/*
const UserSchema = new mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, unique: true, required: true},
  history: Array
});
*/
UserSchema.plugin(findOrCreate);
/*
UserSchema.methods.verifyPassword = function(password){
  return bcrypt.compare(password, this.local.password);
};
*/

// schema for how each caption entry for an image will be saved and used by imageSchema
const CaptionSchema = new mongoose.Schema({
	artID: {type: String, ref: 'Image', required: true},
  caption: {type: String, required: true},
  captionCreator: {type: String, ref: 'User', required: true}, // Created automatically when a caption is posted
  score: {type: Number, required: true},
});

// schema for how each image entry will be saved in DB
const ImageSchema = new mongoose.Schema({
  name: {type: String, required: true},
	imgURL: {type: String, required: true}, //Display images by fetching by url
  creator_ID: {type: String, ref: 'User', required: true}, // Created automatically wtih each upload from account
	created_Date: {type: Date, required: true}, // Created automatically
	score: {type: Number, required: true},
  tags: {type: Array, required: true},
  captions: {type: Array, required: true} // Embed captionSchema
});

//Create slug for each image
ImageSchema.plugin(URLSlugs('name created_Date'));

// register schema to db
mongoose.model("User", UserSchema);
mongoose.model("Image", ImageSchema);
mongoose.model("Caption", CaptionSchema);

mongoose.connect(dbconf, {useNewUrlParser: true});
