//Lap Yan Cheung (lyc286)
//Dummy database

const mongoose = require('mongoose');
// is the environment variable, NODE_ENV, set to DEV?

// schema goes here
// create sound schema w/ data validation
const userSchema = new mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, required: true},
  history: Array
});
// register schema to db
mongoose.model("User", userSchema);

// schema for how each image entry will be saved in DB
const imageSchema = new mongoose.Schema({
  name: {type: String, required: true},
  creatorName: {type: String, required: true}, // Created automatically wtih each upload from account
  score: {type: Number, required: true},
  tags: {type: Array, required: true},
  captions: [captionSchema] // Embed captionSchema
});

mongoose.model("Image", imageSchema);

// schema for how each caption entry for an image will be saved and used by imageSchema
const captionSchema = new mongoose.Schema({
  caption: {type: String, required: true},
  captionCreator: {type: String, required: true}, // Created automatically when a caption is posted
  score: {type: Number, required: true},
});

mongoose.model("Caption", captionSchema);

mongoose.connect('mongodb://localhost/finalprj', {useNewUrlParser: true});
