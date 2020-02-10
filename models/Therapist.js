const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: String,
  group: String,
  rating: Array
}, { timestamps: true });


const Therapist = mongoose.model('Therapist', therapistSchema);

module.exports = Therapist;
