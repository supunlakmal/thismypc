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
  return new Promise((resolve,reject)=>{


  UserAndPC.create({
    'userID': userPC.userID,
    'pcKeyPublic': userPC.pcKeyPublic,
  }, callback);

});
};
//  get  pc  using pc key
module.exports.getUserAndPCUsingKey = function(key) {
  return new Promise((resolve,reject)=>{
  UserAndPC.findOne().where('pcKeyPublic', key).exec(function (err, result) {
    resolve(result);
        });
    }).then(result=>{return result;});
};