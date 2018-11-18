//Lap Yan Cheung (lyc286)
//Dummy database

const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
// is the environment variable, NODE_ENV, set to DEV?

// schema goes here
// create sound schema w/ data validation
const UserSchema = new mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, required: true},
  history: Array
});

// schema for how each caption entry for an image will be saved and used by imageSchema
const CaptionSchema = new mongoose.Schema({
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
  captions: [CaptionSchema] // Embed captionSchema
});

//Create slug for each image
ImageSchema.plugin(URLSlugs('name created_Date'));

// register schema to db
mongoose.model("User", UserSchema);
mongoose.model("Image", ImageSchema);
mongoose.model("Caption", CaptionSchema);

mongoose.connect('mongodb://localhost/finalprj', {useNewUrlParser: true});
