const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  group: String,
  rating: Array
}, { timestamps: true });


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
