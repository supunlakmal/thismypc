let mongoose = require('mongoose');
var appNotification = mongoose.Schema({
    softWareID: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        required: true
    },
    softWareID: {
        type: String,
        required: true
    },
    dismissible: {
        type: Number,
        required: true,
        default: 1 //
    },
    status: {
        type: Number,
        required: true,
        default: 1 //
    },
    addDate: {
        type: Date,
        default: Date.now
    }
})
let AppNotification = module.exports = mongoose.model('userAndPC', appNotification);
// create   notification
module.exports.pcAndOwner = function (notification, callback) {
    AppNotification.create({
        'softWareID': notification.softWareID,
        'message': notification.message,
        'messageType': notification.messageType,
        'dismissible': notification.dismissible
    }, callback);
}