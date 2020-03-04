const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  group: Object,
  therapist_rating: Array
}, { timestamps: true });


const Therapist = mongoose.model('Therapist', therapistSchema);

module.exports = Therapist;
