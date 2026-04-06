const mongoose = require('mongoose');

const registrationHistorySchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const RegistrationHistory = mongoose.model('RegistrationHistory', registrationHistorySchema);

module.exports = RegistrationHistory;
