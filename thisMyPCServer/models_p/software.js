const mongoose = require('mongoose');
const softwareSchema = mongoose.Schema({
  version: {
    type: String,
    required: true,
  },
  versionKey: {
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
const Software = module.exports = mongoose.model('software', softwareSchema);
// create   software
module.exports.createSoftwareVersion = function(software, callback) {
  Software.create({
    'version': software.version,
    'versionKey': software.versionKey,
    'status': software.status,
  }, callback);
};
//  get  software using id
module.exports.getSoftware = function(key, callback) {
  Software.findOne().where('versionKey', key).exec(callback);
};
//  get active   software using id
module.exports.getActiveSoftware = function(key) {

  return new Promise((resolve,reject)=>{
  Software.findOne().where({
    'versionKey': key,
    'status': 1,
  }).exec(function (err, software) {

    resolve(software);
    
        });
    
    
    }).then(result=>{return result;});




};
//  get  all software
module.exports.getSoftwares = function(data, callback) {
  Software.find(callback).limit(data.limit);
};
