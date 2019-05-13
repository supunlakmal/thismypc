let mongoose = require('mongoose');
//db.createCollection('Admin')
let adminSchema = mongoose.Schema({
    userID: {
        type: String, required: true
    }, status: {
        type: Number, required: true, default: 1 //
    }
})
let Admin = module.exports = mongoose.model('Admin', adminSchema);
// creat  user
module.exports.createAdmin = function (admin, callback) {
    Admin.create({'userID': admin.id}, callback);
}
// search  user
module.exports.searchAdmin = function (id, callback) {
    Admin.findOne().where({"userID": id, "status": 1}).exec(callback);
}
// auth  admin
module.exports.authAdmin = function (id, callback) {
    Admin.findOne().where({"userID": id}).exec(callback);
}