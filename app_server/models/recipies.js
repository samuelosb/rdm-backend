const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String, // URL o campo per l'immagine
  ingredients: [{
    name: String,
    amount: Number,
    unit: String
  }],
  instructions: [{
    description: String,
    image: String // URL o campo per l'immagine
  }],
  nutritionalValues: {
    calories: Number,
    dailyValue: Number,
    servingSize: Number
  },
  allergenTags: [String],
  dietType: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);
