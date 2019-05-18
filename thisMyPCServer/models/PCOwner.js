let mongoose = require('mongoose');
var PCOwner = mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    pcID: {
        type: String,
        required: true
    },
    pcKey: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 1 //
    },
    loginDate: {
        type: Date,
        default: Date.now
    }
})
let pCOwner = module.exports = mongoose.model('pcOwner', PCOwner);
// create   PC and pc Owner
module.exports.pcAndOwner = function (pcOwner, callback) {
    pCOwner.create({
        'userID': pcOwner.userID,
        'pcID': pcOwner.pcID,
        'pcKey': pcOwner.pcKey
    }, callback);
}