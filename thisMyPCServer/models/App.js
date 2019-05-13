let mongoose = require('mongoose');
var appSchema = mongoose.Schema({
    appName: {
        type: String, required: true
    }, appInfo: {
        type: String, required: true
    }, appImageUrl: {
        type: String, required: true
    }, appInstallCount: {
        type: Number, default: 0
    }, userID: {
        type: String, required: true
    }, version: {
        type: String, required: true
    }, status: {
        type: Number, required: true, default: 1 //
    }, released_date: {
        type: Date, default: Date.now
    }, lastUpdate_date: {
        type: Date, default: Date.now
    }, appIconUrl: {
        type: String, required: true
    }
})
let App = module.exports = mongoose.model('app', appSchema);
// create   software
module.exports.createApp = function (app, callback) {
    App.create({
        'appName': app.appName,
        'appInfo': app.appInfo,
        'appImageUrl': app.appImageUrl,
        'userID': app.userID,
        'version': app.version,
    }, callback);
}

//  get  all apps
module.exports.getAppsReturn = function (limit) {
    App.find().limit(limit);
}//  get  all apps
module.exports.getApps = function (limit, callback) {
    App.find(callback).limit(limit);
}
//  delete  app
module.exports.deleteApp = function (id, callback) {
    App.remove({_id: id}, callback);
}
//  update app  image
module.exports.appImageUpdate = function (id, imageUrl, option, callback) {
    var query = {_id: id};
    var update = {
        appImageUrl: imageUrl
    }
    App.findOneAndUpdate(query, update, option, callback);
}
//  update app  data
module.exports.appUpdateData = function (id, data, option, callback) {
    var query = {_id: id};
    var update = {
        appName: data.appName, appInfo: data.appInfo, version: data.version,
    }
    App.findOneAndUpdate(query, update, option, callback);
}


//  increment install count
module.exports.incrementInstallCount = function (callback) {
    App.update({ $inc: { appInstallCount: 1} }).exec(callback);
}



