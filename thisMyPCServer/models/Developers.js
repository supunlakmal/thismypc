let mongoose = require('mongoose');
var developers = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    linkedInLink: {
        type: String
    },
    status: {
        type: Number,
        required: true,
        default: 1 //
    },
    date: {
        type: Date,
        default: Date.now
    }
})
let Developers = module.exports = mongoose.model('developers', developers);
// create   User and pc public access
module.exports.createDeveloper = function (developer, callback) {
    Developers.create({
        'email': developer.email,
        'fullName': developer.fullName
    }, callback);
}
//  get  pc  using pc key
module.exports.getDeveloperUsingEmail = function (email, callback) {
    Developers.findOne().where("email", email).exec(callback);
}
//  get  users
module.exports.getUsers = function (limit, callback) {
    Developers.find(callback).limit(limit);
}