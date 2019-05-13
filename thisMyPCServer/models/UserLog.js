let mongoose = require('mongoose');
var pcLog = mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    pcID: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    logDate: {
        type: Date,
        default: Date.now
    }
})
let PCLog = module.exports = mongoose.model('pcAndlog', userAndPC);
// create  PC Log
module.exports.createPCLog = function (pc, callback) {
    pcLog.create({
        'userID': pc.userID,
        'pcID': pc.pcID,
        'message': pc.message
    }, callback);
}
//  get  pc log  using pc ID
module.exports.getPCLog = function (pcID, callback) {
    UserAndPC.find().where("pcID", pcID).exec(callback);
}