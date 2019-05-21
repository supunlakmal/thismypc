const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const userAndApp = mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  appID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: 1, //
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const UserAndApp = module.exports = mongoose.model('userAndApp', userAndApp);
// create   User and app
module.exports.createNewUserAndApp = function(userApp, callback) {
  UserAndApp.create({
    'userID': userApp.id,
    'appID': userApp.appID,
  }, callback);
}; // delete   User and app
module.exports.deleteUserAndApp = function(userApp, callback) {
  UserAndApp.remove({
    'userID': userApp.id,
    'appID': userApp.appID,
  }, callback);
};
// create   User and pc public access
module.exports.userApps = function(userApp, callback) {
  UserAndApp.aggregate([{
    '$match': {
      'userID': new ObjectId(userApp.id),
    },
  }, {
    '$lookup': {
      'from': 'apps',
      'localField': 'appID',
      'foreignField': '_id',
      'as': 'apps',
    },
  }], callback);
};
//  get  app using userID and  app  ID
module.exports.getUserAndApp = function(data, callback) {
  UserAndApp.findOne().where({
    'userID': data.id,
    'appID': data.appID,
  }).exec(callback);
};
