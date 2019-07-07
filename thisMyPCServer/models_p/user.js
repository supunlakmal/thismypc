const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  name: { // User name
    type: String,
    required: true,
  },
  nameLast: { // TODO Remove nameLast from next release
    type: String,
  },
  email: { // User Email
    type: String,
    required: true,
  },
  password: { // User Password
    type: String,
    required: true,
  },
  created_date: { // User Account Created Date
    type: Date,
    default: Date.now,
  },
  last_login: { // User last Login to System
    type: Date,
    default: Date.now,
  },
  auth: { // User Auth key
    type: String,
  },
  ioSocketID: { // TODO need to  remove  from next release
    type: String,
  },
  authApp: {
    type: String,
  },
  status: { // User Status 1,0
    type: Number,
    required: true,
    default: 1, //
  },
  userNowAccessPCID: {// User currently accessing PC ID
    type: String,
  },
  userCurrentSocketId: { // User current SocketID
    type: String,
  },
});
const User = module.exports = mongoose.model('Users', userSchema);
//  get  users
module.exports.getUsers = function (limit, callback) {
  User.find(callback).limit(limit);
};
//  get  user using id
module.exports.getUser = function (id) {

  return  new Promise((resolve, reject) => {
  User.findOne().where('_id', id).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});





}; //  get  user using id for  public  use
module.exports.getUserPublic = function (id) {

  return  new Promise((resolve, reject) => {
  User.findOne().select('_id name nameLast email').where('_id', id).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});



};
// search  user
module.exports.searchEmailUser =  function (email) {
  return  new Promise((resolve, reject) => {
  User.findOne().where('email', email).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});

};
// login  user
module.exports.loginUser =  function (email, password) {
  
  return  new Promise((resolve, reject) => {
    User.findOne().where({
      'email': email,
      'password': password,
      'status': 1,
    }).exec(function(err,result){
      resolve(result);
    });
  }).then(result=>{return result});
  
};
// confirm user  password
module.exports.passwordConfirm = function (id, password, callback) {
  
  return  new Promise((resolve, reject) => {
  User.findOne().where({
    '_id': id,
    'password': password,
    'status': 1,
  }).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});
};
// auth  user
module.exports.authUser = function (id, auth) {

  return  new Promise((resolve, reject) => {
  User.findOne().where({
    '_id': id,
    'auth': auth,
  }).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});
};
// auth  App
module.exports.authApp = function (id, auth) {

  return  new Promise((resolve, reject) => {
  User.findOne().where({
    '_id': id,
    'authApp': auth,
  }).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});
};
// create   user
module.exports.createUser = function (user) {
  return  new Promise((resolve, reject) => {
  User.create({
    'name': user.name,
    'email': user.email,
    'password': user.password,
    'ioSocketID': user.ioSocketID,
  }, function(err,user){
    resolve(user);
  });

}).then(user=>{return user});
  
};
//  update  user  info
module.exports.updateUserInfo = function (id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    name: user.name,
    nameLast: user.nameLast,
  };
  User.findOneAndUpdate(query, update, option, callback);
}; //  update  user  userCurrentSocketId
module.exports.updateUserCurrentSocketId = function (id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    userCurrentSocketId: user.userCurrentSocketId,
  };
  User.findOneAndUpdate(query, update, option, callback);
};
//  get  user using SocketId
module.exports.getUserSocketId = function (userCurrentSocketId) {
  return  new Promise((resolve, reject) => {

  User.findOne().where('userCurrentSocketId', userCurrentSocketId).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});


};
//  update  user  password
module.exports.updateUserPassword = function (id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    password: user.password,
  };
  User.findOneAndUpdate(query, update, option, callback);
};
// user update auth
module.exports.updateUserAuth = function (id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    auth: user.auth,
  };
  User.findOneAndUpdate(query, update, option, callback);
};
/* // user app update auth
module.exports.updateUserAuthApp = function (id, user, option, callback) {
  var query = {_id: id};
  var update = {
    authApp: user.auth
  }
  /!*    var update = {
    authApp: user.auth, ioSocketID: user.ioSocketID,
  }*!/
  User.findOneAndUpdate(query, update, option, callback);
}*/
// // user update  status
module.exports.updateUserStatus = function (id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    status: user.status,
  };
  User.findOneAndUpdate(query, update, option, callback);
}; // // user update  current pc id
module.exports.updateUserNowAccessPCID = function (id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    userNowAccessPCID: user.pcID,
  };
  User.findOneAndUpdate(query, update, option, callback);
};
// user  info  (My account)
// auth  user
module.exports.userInfo = function (id, auth) {
  return  new Promise((resolve, reject) => {
  User.findOne().select({
    name: 1,
    email: 1,
    status: 1,
    nameLast: 1,
  }).where({
    '_id': id,
    'auth': auth,
  }).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});
};
// all active   user
module.exports.countUsers = function (callback) {
  User.findOne().where({
    'status': 1,
  }).count(callback);
};