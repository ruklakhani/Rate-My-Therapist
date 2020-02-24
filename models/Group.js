const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String
}, { timestamps: true });


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
