const mongoose = require("mongoose");

const PasswordEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  username: {
    type: String,
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PasswordEntry", PasswordEntrySchema);
