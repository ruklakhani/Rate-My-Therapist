const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  url: String
}, { timestamps: true });


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
