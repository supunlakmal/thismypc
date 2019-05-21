const mongoose = require('mongoose');
// db.users.update({},{ $set: {"created_date": '' ,'last_login':'' ,'socketID':''} },false,true)
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nameLast: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
    default: Date.now,
  },
  auth: {
    type: String,
  },
  ioSocketID: {
    type: String,
  },
  authApp: {
    type: String,
  },
  status: {
    type: Number,
    required: true,
    default: 1, //
  },
  userNowAccessPCID: {
    type: String,
  },
  userCurrentSocketId: {
    type: String,
  },
});
const User = module.exports = mongoose.model('Users', userSchema);
//  get  users
module.exports.getUsers = function(limit, callback) {
  User.find(callback).limit(limit);
};
//  get  user using id
module.exports.getUser = function(id, callback) {
  User.findOne().where('_id', id).exec(callback);
}; //  get  user using id for  public  use
module.exports.getUserPublic = function(id, callback) {
  User.findOne().select('_id name nameLast email').where('_id', id).exec(callback);
};
// search  user
module.exports.searchEmailUser = function(email, callback) {
  User.findOne().where('email', email).exec(callback);
};
// login  user
module.exports.loginUser = function(email, password, callback) {
  User.findOne().where({
    'email': email,
    'password': password,
    'status': 1,
  }).exec(callback);
};
// confirm user  password
module.exports.passwordConfirm = function(id, password, callback) {
  User.findOne().where({
    '_id': id,
    'password': password,
    'status': 1,
  }).exec(callback);
};
// auth  user
module.exports.authUser = function(id, auth, callback) {
  User.findOne().where({
    '_id': id,
    'auth': auth,
  }).exec(callback);
};
// auth  App
module.exports.authApp = function(id, auth, callback) {
  User.findOne().where({
    '_id': id,
    'authApp': auth,
  }).exec(callback);
};
// create   user
module.exports.createUser = function(user, callback) {
  User.create({
    'name': user.name,
    'email': user.email,
    'password': user.password,
    'ioSocketID': user.ioSocketID,
  }, callback);
};
//  update  user  info
module.exports.updateUserInfo = function(id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    name: user.name,
    nameLast: user.nameLast,
  };
  User.findOneAndUpdate(query, update, option, callback);
}; //  update  user  userCurrentSocketId
module.exports.updateUserCurrentSocketId = function(id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    userCurrentSocketId: user.userCurrentSocketId,
  };
  User.findOneAndUpdate(query, update, option, callback);
};
//  get  user using SocketId
module.exports.getUserSocketId = function(userCurrentSocketId, callback) {
  User.findOne().where('userCurrentSocketId', userCurrentSocketId).exec(callback);
};
//  update  user  password
module.exports.updateUserPassword = function(id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    password: user.password,
  };
  User.findOneAndUpdate(query, update, option, callback);
};
// user update auth
module.exports.updateUserAuth = function(id, user, option, callback) {
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
module.exports.updateUserStatus = function(id, user, option, callback) {
  const query = {
    _id: id,
  };
  const update = {
    status: user.status,
  };
  User.findOneAndUpdate(query, update, option, callback);
}; // // user update  current pc id
module.exports.updateUserNowAccessPCID = function(id, user, option, callback) {
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
module.exports.userInfo = function(id, auth, callback) {
  User.findOne().select({
    name: 1,
    email: 1,
    status: 1,
    nameLast: 1,
  }).where({
    '_id': id,
    'auth': auth,
  }).exec(callback);
};
// all active   user
module.exports.countUsers = function(callback) {
  User.findOne().where({
    'status': 1,
  }).count(callback);
};
