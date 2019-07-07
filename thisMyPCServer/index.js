'use strict';
const app = require('express')();
const bodyParser = require('body-parser');
// MongoDb config variables
const db = require('./config/db');
// config  variables
const config = require('./config/config');
const fileUpload = require('express-fileupload');
// md5 encrypt
const md5 = require('js-md5');
const mongoose = require('mongoose');
// validate inputs
const validator = require('validator');
/**
 * components
 */
// logger
const logger = require('./components/logger');
// MongoDB server connection
mongoose.connect(`mongodb://${db.user}:${db.password}@${db.host}/${db.dbName}`, {
  useNewUrlParser: true,
});
const http = require('http').Server(app);
const io = require('socket.io')(http);
/**
 * REST api call  convert to  json object before send
 *
 * @param {object} type
 * @param {object} msg
 * @param {object} data
 * @return {object}
 */
function respond(type, msg, data) {
  const res = {};
  res.data = data;
  res.message = msg;
  res.status = type;
  return res;
}
/**
 * Mongo DB modules
 */
// user module
const User = require('./models/user');
// software module
const Software = require('./models/software');
// pc  module
const PC = require('./models/pc');
// pc and user  module
const UserAndPC = require('./models/userAndPC');
// pc and PC Owner  module
const PcOwner = require('./models/PCOwner');
app.use(bodyParser.json());
app.use(fileUpload());
// REST API output header
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept ,token ,uid');
  next();
});
// server port ex-5000
http.listen(process.env.PORT || config.port);
logger.log(`Sever start on Port ${config.port}`);
/**
 * get user socketID
 *
 * @param {object} pcData
 * @param {object} user
 * @param {callback} callback
 */
function getUserSocketID(pcData, user, callback) {
  PC.getPC(pcData.pcKey, function(err, pc) {
    if (pc) {
      if (pc.publicAccessStatus === 1) {
        UserAndPC.getUserAndPCUsingKey(pc.publicAccessKey, function(err, userAndPc) {
          if (userAndPc) {
            User.getUser(userAndPc.userID, function(err, userData) {
              // data that need to return from function
              callback(userData.ioSocketID);
            });
          } else {
            callback(user.ioSocketID);
          }
        });
      } else {
        callback(user.ioSocketID);
      }
    }
  });
}
/**
 * Get owner pc  socket id  or public key socket id
 *
 * @param {object} user  user information
 * @param {string} pcKeyPublic computer public access key
 * @param {callback} callback
 */
function getPCSocketID(user, pcKeyPublic, callback) {
  if (pcKeyPublic === '') {
    PC.getPCUsingID(user.userNowAccessPCID, function(err, userPC) {
      callback(userPC.pcSocketID);
    });
  } else {
    PC.getPCPublicKey(pcKeyPublic, function(err, pc) {
      if (pc.publicAccessStatus === 1) {
        callback(pc.pcSocketID);
      } else {
        PC.getPCUsingID(user.userNowAccessPCID, function(err, userPC) {
          callback(userPC.pcSocketID);
        });
      }
    });
  }
}
const isValidFoldersName = (function() {
  const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
  const rg2 = /^\./; // cannot start with dot (.)
  const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return function isValidFoldersName(fname) {
    return rg1.test(fname) && !rg2.test(fname) && !rg3.test(fname);
  };
})();
/**
 * User authentications
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/auth', function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  User.authUser(id, auth, function(err, user) {
    if (user) {
      res.status(200);
      res.json(respond(true, 'good call', null));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
/**
 * Get all user computer names and IDs
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/myInfo/myPc', function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  User.authUser(id, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  PC.getPCByUserID(id, function(err, pc) {
    if (pc) {
      res.status(200);
      res.json(respond(true, 'good call', pc));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
/**
 * Get user all online computers list
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/myInfo/myPc/online', function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  User.authUser(id, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  PC.getPCByUserIDOnline(id, function(err, pc) {
    if (pc) {
      res.status(200);
      res.json(respond(true, 'good call', pc));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
/**
 * Update user public key that allow to access other your computer.
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/myInfo/myPc/publicKey/update', function(req, res) {
  const auth = req.headers.token;
  const pcID = req.body.pcID;
  const userID = req.body.id;
  let publicAccessKey = pcID + Date.now();
  publicAccessKey = md5(publicAccessKey);
  User.authUser(userID, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  const out = {};
  out.publicAccessKey = publicAccessKey;
  PC.newPublicAccessKey(pcID, out, {}, function(err, pc) {
    res.status(200);
    res.json(respond(true, 'Update Done', out));
  });
});
/**
 * Update allow pubic access status
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/myInfo/myPc/update', function(req, res) {
  const auth = req.headers.token;
  const pcID = req.body.pcID;
  const userID = req.body.id;
  const publicAccessStatus = req.body.status;
  let publicAccessKey = pcID + Date.now();
  if (publicAccessStatus === 1) {
    publicAccessKey = md5(publicAccessKey);
  } else {
    publicAccessKey = md5(publicAccessKey);
  }
  User.authUser(userID, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  const out = {};
  out.publicAccessKey = publicAccessKey;
  out.publicAccessStatus = publicAccessStatus;
  PC.updatePublicAccessStatus(pcID, out, {}, function(err, pc) {
    res.status(200);
    res.json(respond(true, 'Update Done', out));
  });
});
/**
 * Get user information
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/myInfo', function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  User.authUser(id, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  User.userInfo(id, auth, function(err, user) {
    if (user) {
      res.status(200);
      res.json(respond(true, 'good call', user));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
/**
 * Get user infromation from desktop app side
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/app/myInfo', function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  const pcKey = req.body.pcKey;
  PC.authApp(id, auth, pcKey, function(err, pc) {
    User.getUserPublic(id, function(err, user) {
      if (!user) {
        res.status(401);
        return res.json(respond(false, 'Invalid User', null));
      } else {
        res.status(200);
        res.json(respond(true, 'good call', user));
      }
    });
  });
});

/**
 * update user information
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/account/myInfo/update', function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  User.authUser(id, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  if (req.body.name === '' || req.body.nameLast === '') {
    res.status(401);
    return res.json(respond(false, 'username/password/name required', null));
  }
  const out = {};
  out.name = req.body.name;
  out.nameLast = req.body.nameLast;
  User.updateUserInfo(id, out, {}, function(err, user) {});
  res.status(200);
  res.json(respond(true, 'Update Done', null));
});
/**
 * Update user password
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/account/password/update', function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  const newPassword = md5(req.body.newPassword);
  const password = md5(req.body.password);
  User.authUser(id, auth, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  if (req.body.password === '' || req.body.newPassword === '' || req.body.confirmNewPassword === '') {
    res.status(401);
    return res.json(respond(false, 'Password/New Password/Confirm Password required', null));
  }
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    res.status(401);
    return res.json(respond(false, 'New Password and  Confirm Password not equal', null));
  }
  User.passwordConfirm(id, password, function(err, user) {
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
  });
  const out = {};
  out.password = newPassword;
  User.updateUserPassword(id, out, {}, function(err, user) {});
  res.status(200);
  res.json(respond(true, 'Update Done', null));
});
/**
 * New user registration
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/register', function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  const userData = req.body;
  // create  room id
  userData.ioSocketID = md5(req.body.email + Date.now());
  if (req.body.email === '' || req.body.password === '' || req.body.name === '') {
    res.status(401);
    return res.json(respond(false, 'username/password/name required', null));
  }
  // todo this  must  fixed bug
  /*  if (!validator.isLength(req.body.password, 7 ,15)) {
          res.status(401);
          return res.json(respond(false,req.body.password.length, null));
      }*/
  // TODO  need to   validate   for name  with spaces
  /* if (!validator.isAlpha(req.body.name)) {
        res.status(401);
        return res.json(respond(false, 'Name  must only  characters  ', null));
    }*/
  if (!validator.isEmail(email)) {
    res.status(401);
    return res.json(respond(false, 'Invalid Email', null));
  }
  User.searchEmailUser(email, function(err, user) {
    if (!user) {
      User.createUser(userData, function(err, user) {
        if (err) {
          throw err;
        }
        User.loginUser(email, password, function(err, user) {
          const date = new Date();
          const out = {};
          out.auth = md5(user._id + date);
          out.id = user._id;
          out.ioSocketID = user.ioSocketID;
          out.name = user.name;
          User.updateUserAuth(user._id, out, {}, function(err, user) {});
          // Todo this will no need in future
          out.ioSocketID = 'room1';
          res.status(200);
          res.json(respond(true, 'Hello!', out));
        });
      });
    } else {
      res.status(401);
      res.json(respond(false, 'User  Already exit', null));
    }
  });
});
/**
 * User logging
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/login', function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  if (req.body.email === '' || req.body.password === '') {
    res.status(401);
    return res.json(respond(false, 'username/password required', null));
  }
  User.loginUser(email, password, function(err, user) {
    if (user) {
      const date = new Date();
      const out = {};
      out.auth = md5(user._id + date);
      out.id = user._id;
      out.ioSocketID = user.ioSocketID;
      out.name = user.name;
      User.updateUserAuth(user._id, out, {}, function(err, user) {});
      // Todo this will no need in future
      out.ioSocketID = 'room1';
      res.status(200);
      res.json(respond(true, 'Hello!', out));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
/**
 * User logout from web
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/logout', function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  User.authUser(id, auth, function(err, user) {
    if (user) {
      const date = new Date();
      const out = {};
      out.auth = md5(user._id + date) + '_logout';
      out.id = user._id;
      out.name = user.name;
      User.updateUserAuth(user._id, out, {}, function(err, user) {});
      res.status(200);
      res.json(respond(true, 'logout!', null));
    } else {
      res.status(401);
      res.json(respond(true, 'Invalid User', null));
    }
  });
});
/**
 * User logout from app
 * TODO need to fix issues
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/app/logout', function(req, res) {
  const id = req.body.id;
  const auth = req.body.auth;
  User.authApp(id, auth, function(err, user) {
    if (user) {
      const date = new Date();
      const out = {};
      out.auth = md5(user._id + date) + '_logout';
      out.id = user._id;
      out.name = user.name;
      User.updateUserAuthApp(user._id, out, {}, function(err, user) {});
      res.status(200);
      res.json(respond(true, 'logout!', null));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
io.on('connection', function(socket) {
  // TODO this user  login from app need to add few   function to  it
  socket.on('loginPage', function() {});
  // some  user  or  app get disconnected  from serve
  socket.on('disconnect', function() {
    PC.getPCSocketID(socket.id, function(err, pc) {
      if (pc) {
        const pcInfo = {};
        pcInfo.pcOnline = 0;
        pcInfo.pcSocketID = socket.id;
        PC.updatePcOnlineStatus(pc._id, pcInfo, {}, function(err, user) {});
      } else {
        User.getUserSocketId(socket.id, function(err, user) {
          if (user) {
            PC.getPCUsingID(user.userNowAccessPCID, function(err, pc) {
              const sendUserInfoToApp = {};
              sendUserInfoToApp.status = false;
              io.sockets.to(pc.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
            });
          }
        });
      }
    });
  });
  /**
   *
   * @param {object} user  user information
   * @param {*} pcKey  Computer key
   * @return {object} new auth key
   */
  function updateAppUserAuth(user, pcKey) {
    const date = new Date();
    const out = {};
    out.auth = md5(user._id + date + pcKey);
    out.id = user._id;
    PC.updateUserAuthApp(pcKey, out, {}, function(err, user) {});
    return out;
  }
  app.post('/login/app', function(req, res) {
    const email = req.body.email;
    const key = req.body.appKey;
    const password = md5(req.body.password);
    const pcKey = md5(req.body.pcKey);
    const pcName = req.body.pcName;
    const platform = req.body.platform;
    req.body.password = password;
    if (req.body.email === '' || req.body.password === '') {
      res.status(401);
      return res.json(respond(false, 'username/password required', null));
    }
    Software.getActiveSoftware(key, function(err, software) {
      if (software) {
        User.loginUser(email, password, function(err, user) {
          if (user) {
            //  set  if  user  got  new pc  key  or  update  if  got  old one
            PC.getPCByUserIDAndPCKey(pcKey, user._id, function(err, pc) {
              if (pc) {
                const pcInfo = {};
                pcInfo.pcOnline = 1;
                pcInfo.pcSocketID = socket.id;
                PC.updatePcOnlineStatus(pc._id, pcInfo, {}, function(err, user) {});
                const pcOwner = {};
                pcOwner.pcID = pc._id;
                pcOwner.pcKey = pcKey;
                pcOwner.userID = user._id;
                PcOwner.pcAndOwner(pcOwner, function(err, pcOwner) {
                  const out = updateAppUserAuth(user, pcKey);
                  out.ioSocketID = 'room1';
                  res.status(200);
                  res.json(respond(true, 'Hello!', out));
                });
              } else {
                const pc = {};
                pc.pcKey = pcKey;
                pc.pcName = pcName;
                pc.pcOnline = 1;
                pc.pcSocketID = socket.id;
                pc.platform = platform;
                pc.publicAccessKey = md5(pcKey + Date.now());
                pc.userID = user._id;
                PC.createNewPC(pc, function(err, pc) {
                  const pcOwner = {};
                  pcOwner.pcID = pc._id;
                  pcOwner.pcKey = pcKey;
                  pcOwner.userID = user._id;
                  PcOwner.pcAndOwner(pcOwner, function(err, pcOwner) {
                    const out = updateAppUserAuth(user, pcKey);
                    out.ioSocketID = 'room1';
                    res.status(200);
                    res.json(respond(true, 'Hello!', out));
                  });
                });
              }
            });
            socket.join(user.ioSocketID);
          } else {
            res.status(401);
            res.json(respond(false, 'Invalid User', null));
          }
        });
      } else {
        res.status(401);
        res.json(respond(false, 'This  software version  no  longer  work', null));
      }
    });
  });
  // join user from  web
  socket.on('joinFromWeb', function(data) {
    const id = data.data.id;
    const auth = data.data.auth;
    User.authUser(id, auth, function(err, user) {
      if (user) {
        socket.join(user.ioSocketID);
        // update user Currentsockett ID
        const userData = {};
        userData.userCurrentSocketId = socket.id;
        User.updateUserCurrentSocketId(user._id, userData, {}, function(user) {});
        // pulling data from app
        io.sockets.in(user.ioSocketID).emit('getAppData', {
          data: 'start',
        });
      }
    });
  });
  // join user from  app
  socket.on('joinFromApp', function(data) {
    const auth = data.data.auth;
    const id = data.data.id;
    const pcKey = md5(data.data.pcKey);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            socket.join(user.ioSocketID);
            PC.getPC(pcKey, function(err, pcData) {
              const pcInfo = {};
              pcInfo.pcSocketID = socket.id;
              PC.updatePcSocketID(pcData._id, pcInfo, {}, function(err, pc) {});
            });
          }
        });
      }
    });
  });
  socket.on('pcAccessRequest', function(input) {
    const auth = input.auth;
    const id = input.userID;
    const pcID = input.pcID;
    User.authUser(id, auth, function(err, user) {
      if (user) {
        const userInfo = {};
        userInfo.pcID = pcID;
        User.updateUserNowAccessPCID(id, userInfo, {}, function(err, user) {});
        PC.getPCUsingID(pcID, function(err, pc) {
          const sendUserInfoToApp = {};
          sendUserInfoToApp.email = user.email;
          sendUserInfoToApp.name = user.name;
          sendUserInfoToApp.nameLast = user.nameLast;
          sendUserInfoToApp.status = true;
          sendUserInfoToApp.userID = user._id;
          io.sockets.to(pc.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
        });
      }
    });
  });
  // from  pc
  socket.on('hDDList', function(input) {
    const id = input.id;
    const auth = input.auth;
    const pcKey = md5(input.pcKey);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            // to  web
            getUserSocketID(pc, user, function(socketID) {
              io.sockets.in(socketID).emit('hDDList', input.data);
            });
          }
        });
      }
    });
  });
  socket.on('pcInfoRequest', function(input) {
    const auth = input.auth;
    const id = input.userID;
    const pcID = input.pcID;
    User.authUser(id, auth, function(err, user) {
      if (user) {
        const userInfo = {};
        userInfo.pcID = pcID;
        User.updateUserNowAccessPCID(id, userInfo, {}, function(err, user) {});
        PC.getPCUsingID(pcID, function(err, pc) {
          const sendUserInfoToApp = {};
          sendUserInfoToApp.email = user.email;
          sendUserInfoToApp.name = user.name;
          sendUserInfoToApp.nameLast = user.nameLast;
          sendUserInfoToApp.status = true;
          sendUserInfoToApp.userID = user._id;
          io.sockets.to(pc.pcSocketID).emit('pcInfoRequest', sendUserInfoToApp);
        });
      }
    });
  });
  // pc info send to web
  socket.on('pcInfo', function(input) {
    const auth = input.auth;
    const id = input.id;
    const pcKey = md5(input.pcKey);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            // to  web
            getUserSocketID(pc, user, function(socketID) {
              io.sockets.in(socketID).emit('pcInfo', input.pcInfo);
            });
          }
        });
      }
    });
  });
  // from  web
  socket.on('openFolder', function(input) {
    const auth = input.auth;
    const id = input.id;
    const pcKeyPublic = input.pcKeyPublic;
    User.authUser(id, auth, function(err, user) {
      if (user) {
        getPCSocketID(user, pcKeyPublic, function(socket) {
          io.sockets.to(socket).emit('openFolderRequest', input);
        });
      }
    });
  });
  // from  pc
  socket.on('sendOpenFolderRequest', function(input) {
    const auth = input.auth;
    const id = input.id;
    const pcKey = md5(input.pcKey);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            // to  web
            getUserSocketID(pc, user, function(socketID) {
              io.sockets.in(socketID).emit('openFolderRequestToWeb', input.data);
            });
          }
        });
      }
    });
  });

  // get  access for  public pc key
  /**
   * User
   */
  app.post('/public/pc/access', function(req, res) {
    const auth = req.headers.token;
    const id = req.body.id;
    const pcKeyPublic = req.body.pcKeyPublic;
    User.authUser(id, auth, function(err, user) {
      if (!user) {
        res.status(401);
        return res.json(respond(false, 'Invalid User', null));
      }
      const sendUserInfoToApp = {};
      sendUserInfoToApp.email = user.email;
      sendUserInfoToApp.name = user.name;
      sendUserInfoToApp.nameLast = user.nameLast;
      sendUserInfoToApp.userID = user._id;
      PC.getPCPublicKey(pcKeyPublic, function(err, pcInfo) {
        if (pcInfo) {
          if (pcInfo.publicAccessStatus === 1) {
            const pc = {};
            pc.pcKeyPublic = pcKeyPublic;
            pc.userID = id;
            UserAndPC.createNewUserAndPC(pc, function(err, output) {});
            io.sockets.to(pcInfo.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
          }
        }
      });
    });
  });

  // validate folder name
  app.post('/validateFolderName', function(req, res) {
    const auth = req.headers.token;
    const createFolderName = req.body.createFolderName;
    const id = req.body.id;
    const path = req.body.path;
    const pcKeyPublic = req.body.pcKeyPublic;
    User.authUser(id, auth, function(err, user) {
      if (user) {
        res.status(200);
        if (!isValidFoldersName(createFolderName)) {
          res.json(respond(isValidFoldersName(createFolderName), 'Invalid Folder name', null));
        } else {
          res.json(respond(true, '', null));
          const output = {};
          output.path = path;
          output.createFolderName = createFolderName;
          getPCSocketID(user, pcKeyPublic, function(socket) {
            io.sockets.to(socket).emit('validateFolderName', output);
          });
        }
      }
    });
  });
  // from  pc  send  information after create  folder
  socket.on('folderCreateCallback', function(input) {
    const auth = input.auth;
    const id = input.id;
    const pcKey = md5(input.pcKey);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            getUserSocketID(pc, user, function(socketID) {
              io.sockets.in(socketID).emit('folderCreateCallbackToWeb', input.data);
            });
          }
        });
      }
    });
  });
});
