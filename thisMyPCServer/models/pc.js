let mongoose = require('mongoose');
var pcSchema = mongoose.Schema({
    pcKey: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 1 //
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    publicAccessKey: {
        type: String,
        default: Date.now,
        unique: true
    },
    publicAccessStatus: {
        type: Number,
        required: true,
        default: 0 //
    },
    pcName: {
        type: String
    },
    platform: {
        type: String
    },
    pcOnline: {
        type: Number,
        required: true,
        default: 0 //
    },
    pcSocketID: {
        type: String
    },
    authApp: {
        type: String
    }
})
let PC = module.exports = mongoose.model('pc', pcSchema);
// create   pc
module.exports.createNewPC = function (pc, callback) {
    PC.create({
        'pcKey': pc.pcKey,
        'userID': pc.userID,
        'pcName': pc.pcName,
        'platform': pc.platform,
        'publicAccessKey': pc.publicAccessKey,
        'pcOnline': pc.pcOnline,
        'pcSocketID': pc.pcSocketID
    }, callback);
}
//  get  pc using _id
module.exports.getPCUsingID = function (key, callback) {
    PC.findOne().where("_id", key).exec(callback);
}
//  get all pc
module.exports.getAllPC = function (limit, callback) {
    PC.find(callback).limit(limit);
}
//  get  pc using pcKey
module.exports.getPC = function (key, callback) {
    PC.findOne().where("pcKey", key).exec(callback);
} //  get  pc using socket ID
module.exports.getPCSocketID = function (pcSocketID, callback) {
    PC.findOne().where("pcSocketID", pcSocketID).exec(callback);
}
//  get  pc using pcKey and user ID
module.exports.getPCByUserIDAndPCKey = function (key, userID, callback) {
    PC.findOne().where({
        "pcKey": key,
        'userID': userID
    }).exec(callback);
}
//  get all  pc using  user id
module.exports.getPCByUserID = function (userID, callback) {
    PC.find().where({
        "userID": userID,
        'status': 1
    }).exec(callback);
}
//  get all online  pc using  user id
module.exports.getPCByUserIDOnline = function (userID, callback) {
    PC.find().select('_id pcName platform email').where({
        "userID": userID,
        'status': 1,
        'pcOnline': 1
    }).exec(callback);
} //  get   pc using  pc id
module.exports.getPCByPCID = function (pcID, callback) {
    PC.findOne().where({
        "pcID": pcID,
        'status': 1
    }).exec(callback);
}
//  generate public access key
module.exports.newPublicAccessKey = function (pcID, pc, callback) {
    var query = {
        _id: pcID
    };
    var update = {
        publicAccessKey: pc.key
    }
    PC.findOneAndUpdate(query, update, option, callback);
}
//  update public access key access
module.exports.updatePublicAccessStatus = function (pcID, pc, option, callback) {
    var query = {
        _id: pcID
    };
    var update = {
        publicAccessStatus: pc.publicAccessStatus,
        publicAccessKey: pc.publicAccessKey
    }
    PC.findOneAndUpdate(query, update, option, callback);
}
//  update PC  online status
module.exports.updatePcOnlineStatus = function (pcID, pc, option, callback) {
    var query = {
        _id: pcID
    };
    var update = {
        pcOnline: pc.pcOnline,
        pcSocketID: pc.pcSocketID
    }
    PC.findOneAndUpdate(query, update, option, callback);
}
//  update PC  socket ID
module.exports.updatePcSocketID = function (pcID, pc, option, callback) {
    var query = {
        _id: pcID
    };
    var update = {
        pcSocketID: pc.pcSocketID
    }
    PC.findOneAndUpdate(query, update, option, callback);
}
// user app update auth from pc key
module.exports.updateUserAuthApp = function (pcKey, pc, option, callback) {
    var query = {
        pcKey: pcKey,
        userID: pc.id
    };
    var update = {
        authApp: pc.auth
    }
    /*    var update = {
            authApp: user.auth, ioSocketID: user.ioSocketID,
        }*/
    //  console.log(update,query);
    PC.findOneAndUpdate(query, update, option, callback);
}
// auth  App
module.exports.authApp = function (id, auth, pcKey, callback) {
    PC.findOne().where({
        "userID": id,
        "authApp": auth,
        'pcKey': pcKey
    }).exec(callback);
}
//  get  pc using public access key
module.exports.getPCPublicKey = function (key, callback) {
    PC.findOne().where("publicAccessKey", key).exec(callback);
}
// all active   user
module.exports.countPC = function (callback) {
    PC.findOne().where({
        'status': 1
    }).count(callback);
}