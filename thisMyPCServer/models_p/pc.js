const mongoose = require('mongoose');
const pcSchema = mongoose.Schema({
  pcKey: { // Personal Computer Unique Key
    type: String,
    required: true,
  },
  userID: { // User ID
    type: String,
    required: true,
  },
  status: { 
    type: Number,
    required: true,
    default: 1, //
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  publicAccessKey: { //Personal computer Public Access Key
    type: String,
    default: Date.now,
    unique: true,
  },
  publicAccessStatus: {
    type: Number,
    required: true,
    default: 0, //
  },
  pcName: { // Person Computer name
    type: String,
  },
  platform: { // Computer OS
    type: String,
  },
  pcOnline: { // Computer offline online
    type: Number,
    required: true,
    default: 0, //
  },
  pcSocketID: { // Computer  socket ID
    type: String,
  },
  authApp: { // Auth key from App side
    type: String,
  },
});
const PC = module.exports = mongoose.model('pc', pcSchema);
// create   pc
module.exports.createNewPC = function(pc, callback) {
  PC.create({
    'pcKey': pc.pcKey,
    'userID': pc.userID,
    'pcName': pc.pcName,
    'platform': pc.platform,
    'publicAccessKey': pc.publicAccessKey,
    'pcOnline': pc.pcOnline,
    'pcSocketID': pc.pcSocketID,
  }, callback);
};
//  get  pc using _id
module.exports.getPCUsingID = function(key, callback) {
  PC.findOne().where('_id', key).exec(callback);
};
//  get all pc
module.exports.getAllPC = function(limit, callback) {
  PC.find(callback).limit(limit);
};
//  get  pc using pcKey
module.exports.getPC = function(key, callback) {
  PC.findOne().where('pcKey', key).exec(callback);
}; //  get  pc using socket ID
module.exports.getPCSocketID = function(pcSocketID, callback) {
  PC.findOne().where('pcSocketID', pcSocketID).exec(callback);
};
//  get  pc using pcKey and user ID
module.exports.getPCByUserIDAndPCKey = function(key, userID, callback) {
  PC.findOne().where({
    'pcKey': key,
    'userID': userID,
  }).exec(callback);
};
//  get all  pc using  user id
module.exports.getPCByUserID = function(userID) {


  return new Promise((resolve,reject)=>{
  PC.find().where({
    'userID': userID,
    'status': 1,
  }).exec(function (err, pc) {

    resolve(pc);
    
        });
    
    
    }).then(result=>{return result;});



};
//  get all online  pc using  user id
module.exports.getPCByUserIDOnline = function(userID) {


  return new Promise((resolve,reject)=>{

  PC.find().select('_id pcName platform email').where({
    'userID': userID,
    'status': 1,
    'pcOnline': 1,
  }).exec(function (err, pc) {

resolve(pc);

    });


}).then(result=>{return result;});

}; //  get   pc using  pc id
module.exports.getPCByPCID = function(pcID, callback) {
  PC.findOne().where({
    'pcID': pcID,
    'status': 1,
  }).exec(callback);
};
//  generate public access key
module.exports.newPublicAccessKey = function(pcID, pc) {
  return new Promise((resolve,reject)=>{

  const query = {
    _id: pcID,
  };
  const update = {
    publicAccessKey: pc.key,
  };
  PC.findOneAndUpdate(query, update, option, function (err , pc) {

    resolve(pc);
    
  });
}).then(result=>{return result;});




};
//  update public access key access
module.exports.updatePublicAccessStatus = function(pcID, pc, option) {
return new Promise((resolve,reject)=>{

  const query = {
    _id: pcID,
  };
  const update = {
    publicAccessStatus: pc.publicAccessStatus,
    publicAccessKey: pc.publicAccessKey,
  };
  PC.findOneAndUpdate(query, update, option, function (err , pc) {

    resolve(pc);
    
  });
}).then(result=>{return result;});






};
//  update PC  online status
module.exports.updatePcOnlineStatus = function(pcID, pc, option, callback) {
  const query = {
    _id: pcID,
  };
  const update = {
    pcOnline: pc.pcOnline,
    pcSocketID: pc.pcSocketID,
  };
  PC.findOneAndUpdate(query, update, option, callback);
};
//  update PC  socket ID
module.exports.updatePcSocketID = function(pcID, pc, option, callback) {
  const query = {
    _id: pcID,
  };
  const update = {
    pcSocketID: pc.pcSocketID,
  };
  PC.findOneAndUpdate(query, update, option, callback);
};
// user app update auth from pc key
module.exports.updateUserAuthApp = function(pcKey, pc, option, callback) {
  const query = {
    pcKey: pcKey,
    userID: pc.id,
  };
  const update = {
    authApp: pc.auth,
  };
  /*    var update = {
            authApp: user.auth, ioSocketID: user.ioSocketID,
        }*/
  //  console.log(update,query);
  PC.findOneAndUpdate(query, update, option, callback);
};
// auth  App
module.exports.authApp = function(id, auth, pcKey) {
  return  new Promise((resolve, reject) => {

  PC.findOne().where({
    'userID': id,
    'authApp': auth,
    'pcKey': pcKey,
  }).exec(function(err,result){
    resolve(result);
  });
}).then(result=>{return result});

};
//  get  pc using public access key
module.exports.getPCPublicKey = function(key, callback) {
  PC.findOne().where('publicAccessKey', key).exec(callback);
};
// all active   user
module.exports.countPC = function(callback) {
  PC.findOne().where({
    'status': 1,
  }).count(callback);
};
