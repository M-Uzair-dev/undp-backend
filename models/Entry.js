const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  cnic: {
    type: String,
    required: true
  },
  uc: {
    type: String,
    required: true
  },
  tehsil: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  villageName : {
    type: String,
    required: true
  },
  dateOfCommissioning: {
    type: String,
    required: true
  },
  installationDate: {
    type: String,
    required: true
  },
  woodSaved: {
    type: Number,
    default : "0",
  },
  treesSaved: {
    type: Number,
    default : "0",
  },
  areaSaved: {
    type: Number,
    default : "0",
  },
  co2Saved: {
    type: Number,
    default : "0",
  },
  carbonCredits: {
    type: Number,
    default : "0",
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Entry', entrySchema); 