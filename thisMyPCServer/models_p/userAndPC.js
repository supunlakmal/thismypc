const mongoose = require('mongoose');
const userAndPC = mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  pcKeyPublic: { // Personal Computer public Access Key
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: 1, //
  },
  released_date: {
    type: Date,
    default: Date.now,
  },
});
const UserAndPC = module.exports = mongoose.model('userAndPC', userAndPC);
// create   User and pc public access
module.exports.createNewUserAndPC = function(userPC, callback) {
  UserAndPC.create({
    'userID': userPC.userID,
    'pcKeyPublic': userPC.pcKeyPublic,
  }, callback);
};
//  get  pc  using pc key
module.exports.getUserAndPCUsingKey = function(key, callback) {
  UserAndPC.findOne().where('pcKeyPublic', key).exec(callback);
};
