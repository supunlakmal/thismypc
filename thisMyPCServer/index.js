'use strict';
// https://javascript.info/async-await
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
/**
 * User Resources
 */
const userClass= require('./components/class/user.class');
const computerClass= require('./components/class/computer.class');
// MongoDB server connection
mongoose.connect(`mongodb://${db.user}:${db.password}@${db.host}/${db.dbName}`, {
  useNewUrlParser: true,
});
// Set mongoose.Promise to any Promise implementation
mongoose.Promise = Promise;
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
app.disable('x-powered-by');
app.use(fileUpload());
// REST API output header
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept ,authentication_key ,userID');
  next();
});
// server port ex-5000
http.listen(process.env.PORT || config.port);
logger.log(`Sever start on Port ${config.port}`);

/**
 * REST API V1
 */
/**
 * API main end point
 */
app.get('/api/', async function(req, res) {
  res.status(200).json(respond(true, 'REST API working', null));
});
/**
 *  API variation end point
 */
app.get('/api/v1/', async function(req, res) {
  res.status(200).json(respond(true, 'REST API working', null));
});

/**
* User information
*
* @param  {json} req
* req : Request
* req->
*
* @param  {json} res
* res:Respond
* res<-
*/
// TODO  authentication method
app.get('/api/v1/user/:userID', async function(req, res) {
// authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  // user ID
  const userID = req.params.userID;
  if (!await User.authUser(userID, authentication_key)) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  // user Information
  const userInformation = await User.getUser(userID);
  if (userInformation) {
  // user  class
    const userClassData = new userClass(userInformation);
    userClassData.userInformation();
    userClassData.withAuthentication();
    res.status(200).json(respond(true, 'User Information', userClassData.get()));
  } else {
    res.status(400).json(respond(fail, 'Invalid User Information', null));
  }
});
/**
* User information
*
* @param  {json} req
* req : Request
* req->
*
* @param  {json} res
* res:Respond
* res<-
*/
// TODO  authentication method
app.get('/api/v1/user/:userID/computer/:computerKey', async function(req, res) {
  // authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  // user ID
  const userID = req.params.userID;
  const computerKey = md5(req.params.computerKey);
  if (!await PC.authApp(userID, authentication_key, computerKey)) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  // user Information
  const userInformation = await User.getUser(userID);
  if (userInformation) {
    // user  class
    const userClassData = new userClass(userInformation);
    userClassData.userInformation();
    userClassData.withAuthentication();
    res.status(200).json(respond(true, 'User Information', userClassData.get()));
  } else {
    res.status(400).json(respond(fail, 'Invalid User Information', null));
  }
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
app.post('/api/v1/user/register', async function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  const userData = req.body;
  if (req.body.email === '' || req.body.password === '' || req.body.firstName === '' || req.body.lastName === '' ) {
    res.status(401);
    return res.json(respond(false, 'username/password/first name/last name required', null));
  }
  if (!validator.isAlpha(req.body.firstName) || !validator.isAlpha(req.body.lastName)) {
    res.status(401);
    return res.json(respond(false, 'First Name and Last Name need to be only string', null));
  }
  if (!validator.isEmail(email)) {
    res.status(401);
    return res.json(respond(false, 'Invalid Email', null));
  }
  // search user by user name
  const user = await User.searchEmailUser(email);
  if (!user) {
  // create  room id
    const ioSocketID = md5(req.body.email + Date.now());
    userData.ioSocketID =ioSocketID;
    userData.authentication_key = md5(ioSocketID);
    const newUser = await User.createUser(userData);
    if (newUser) {
      // user  class
      const userClassData = new userClass(newUser);
      userClassData.userInformation();
      userClassData.withAuthentication();
      res.status(200);
      res.json(respond(true, 'User login infromation', userClassData.get()));
    }
  } else {
    res.status(401);
    res.json(respond(false, 'User  Already exit', null));
  }
});
/**
 * User logging {async}
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.post('/api/v1/user/login', async function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  if (req.body.email === '' || req.body.password === '') {
    res.status(401);
    return res.json(respond(false, 'username/password required', null));
  }
  // wait till the promise resolves (*)
  const userLogin = await User.loginUser(email, password);
  if (userLogin) {
    const date = new Date();
    userLogin.authentication_key = md5(userLogin._id + date);
    const user = await User.updateUserAuth(userLogin._id, userLogin, {new: true});
    const userClassData = new userClass(user);
    userClassData.userInformation();
    userClassData.withAuthentication();
    res.status(200);
    res.json(respond(true, 'User login infromation', userClassData.get()));
  } else {
    res.status(401);
    res.json(respond(false, 'Invalid User', null));
  }
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
app.post('/api/v1/user/password/edit', async function(req, res) {
// authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  const userID = req.body.userID;
  const newPassword = md5(req.body.newPassword);
  const password = md5(req.body.password);
  if (!await User.authUser(userID, authentication_key)) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  if (req.body.password === '' || req.body.newPassword === '' || req.body.confirmNewPassword === '') {
    res.status(401);
    return res.json(respond(false, 'Password/New Password/Confirm Password required', null));
  }
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    res.status(401);
    return res.json(respond(false, 'New Password and  Confirm Password not equal', null));
  }
  const user = await User.passwordConfirm(userID, password);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  user.password = newPassword;
  await User.updateUserPassword(userID, user, {});
  res.status(200);
  res.json(respond(true, 'Update Done', null));
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
app.post('/api/v1/user/update', async function(req, res) {
// authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  const userID = req.body.userID;
  if (!await User.authUser(userID, authentication_key)) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  if (req.body.firstName === '' || req.body.lastName === '' ) {
    res.status(401);
    return res.json(respond(false, 'First name /Last name required', null));
  }
  await User.updateUserInfo(userID, req.body, {});
  res.status(200);
  res.json(respond(true, 'Update Done', null));
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
app.get('/api/v1/user/:userID/logout', async function(req, res) {
  const userID = req.params.userID;
  const authentication_key = req.headers.authentication_key;
  if (!await User.authUser(userID, authentication_key)) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  if (user) {
    const out = {};
    out.authentication_key = md5(userID + new Date()) + '_logout';
    await User.updateUserAuth(userID, out, {});
    res.status(200);
    res.json(respond(true, 'logout!', null));
  } else {
    res.status(401);
    res.json(respond(true, 'Invalid User', null));
  }
});
/**
 * User logout from computer
 *
 * @param  {json} req
 * req : Request
 * req->
 *
 * @param  {json} res
 * res:Respond
 * res<-
 */
app.get('/api/v1/user/:userID/computer/logout', async function(req, res) {
  const userID = req.params.userID;
  const authentication_key = req.headers.authentication_key;
  if (!await User.authApp(userID, authentication_key)) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  if (user) {
    const out = {};
    out.authentication_key = md5(userID + new Date()) + '_logout';
    await User.updateUserAuth(userID, out, {});
    res.status(200);
    res.json(respond(true, 'logout!', null));
  } else {
    res.status(401);
    res.json(respond(true, 'Invalid User', null));
  }
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
app.post('/api/v1/user/computer/public/status/update', async function(req, res) {
  const authentication_key = req.headers.authentication_key;
  const computerKey = req.body.computerKey;
  const userID = req.body.userID;
  const publicAccessStatus = req.body.status;
  const user = await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  let publicAccessKey = computerKey + Date.now();
  if (publicAccessStatus === 1) {
    publicAccessKey = md5(publicAccessKey);
  } else {
    publicAccessKey = md5(publicAccessKey);
  }
  const out = {};
  out.publicAccessKey = publicAccessKey;
  out.publicAccessStatus = publicAccessStatus;
  const pc= await PC.updatePublicAccessStatus(pcID, out, {new: true});
  if (pc) {
    res.status(200);
    res.json(respond(true, 'Update Done', out));
  }
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
app.post('/api/v1/user/computer/public/key/update', async function(req, res) {
  const authentication_key = req.headers.authentication_key;
  const computerKey = req.body.computerKey;
  const userID = req.body.userID;
  const user =await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  let publicAccessKey = computerKey + Date.now();
  publicAccessKey = md5(publicAccessKey);
  const out = {};
  out.publicAccessKey = publicAccessKey;
  const pc = await PC.newPublicAccessKey(pcID, out, {new: true});
  if (pc) {
    res.status(200);
    res.json(respond(true, 'Update Done', out));
  }
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
app.post('/api/v1/user/computer/online', async function(req, res) {
  const userID = req.body.userID;
  const authentication_key = req.headers.authentication_key;
  const user =await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  const pc = await PC.getPCByUserIDOnline(userID);
  if (pc) {
    res.status(200);
    res.json(respond(true, 'Computer  Information', pc));
  } else {
    res.status(401);
    res.json(respond(false, 'Invalid User', null));
  }
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
app.post('/api/v1/user/computer', async function(req, res) {
  const userID = req.body.userID;
  const authentication_key = req.headers.authentication_key;
  const user = await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  const pc =await PC.getPCByUserID(userID);
  if (pc) {
    res.status(200);
    res.json(respond(true, 'good call', pc));
  } else {
    res.status(401);
    res.json(respond(false, 'Invalid User', null));
  }
});
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
app.post('/api/v1/user/authentication', async function(req, res) {
  const userID = req.body.userID;
  const authentication_key = req.headers.authentication_key;
  const user = await User.authUser(userID, authentication_key);
  if (user) {
    res.status(200);
    res.json(respond(true, 'good call', null));
  } else {
    res.status(401);
    res.json(respond(false, 'Invalid User', null));
  }
});
io.on('connection', function(socket) {
  // TODO this user  login from app need to add few   function to  it
  socket.on('loginPage', function() {});
  // some  user  or  app get disconnected  from serve
  socket.on('disconnect', async function() {
    const pc = await PC.getPCSocketID(socket.id);
    if (pc) {
      const pcInfo = {};
      pcInfo.pcOnline = 0;
      pcInfo.pcSocketID = socket.id;
      await PC.updatePcOnlineStatus(pc._id, pcInfo, {});
    } else {
      const user =await User.getUserSocketId(socket.id);
      if (user) {
        const pc = await PC.getPCUsingID(user.userNowAccessPCID);
        if (pc) {
          const sendUserInfoToApp = {};
          sendUserInfoToApp.status = false;
          io.sockets.to(pc.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
        }
      }
    }
  });
  /**
   *
   * @param {object} user  user information
   * @param {*} pcKey  Computer key
   * @return {object} new auth key
   */
  async function updateAppUserAuth(user, pcKey) {
    const date = new Date();
    const input = {};
    input.auth = md5(user._id + date + pcKey);
    input.id = user._id;
    const updateUserAuthApp = await PC.updateUserAuthApp(pcKey, input, {new: true} );
    return updateUserAuthApp;
  }
  app.post('/api/v1/user/computer/login', async function(req, res) {
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
    const software = await Software.getActiveSoftware(key);
    if (software) {
      const user =await User.loginUser(email, password);
      if (user) {
        //  set  if  user  got  new pc  key  or  update  if  got  old one
        const pc = await PC.getPCByUserIDAndPCKey(pcKey, user._id);
        if (pc) {
          const pcInfo = {};
          pcInfo.pcOnline = 1;
          pcInfo.pcSocketID = socket.id;
          await PC.updatePcOnlineStatus(pc._id, pcInfo, {});
          const pcOwner = {};
          pcOwner.pcID = pc._id;
          pcOwner.pcKey = pcKey;
          pcOwner.userID = user._id;
          const pcOwnerData = await PcOwner.pcAndOwner(pcOwner);
          if (pcOwnerData) {
            const userInformation = await User.getUser(user._id);

            const computerClassData = await updateAppUserAuth(user, pcKey);
            const computerClassObject = new computerClass(computerClassData);
            computerClassObject.withAuthentication();
            computerClassObject.withUserInformation(userInformation);
            res.status(200);
            res.json(respond(true, 'Hello!', computerClassObject.get()));
          }
        } else {
          const pc = {};
          pc.pcKey = pcKey;
          pc.pcName = pcName;
          pc.pcOnline = 1;
          pc.pcSocketID = socket.id;
          pc.platform = platform;
          pc.publicAccessKey = md5(pcKey + Date.now());
          pc.userID = user._id;
          const pcData = await PC.createNewPC(pc);
          if (pcData) {
            const pcOwner = {};
            pcOwner.pcID = pcData._id;
            pcOwner.pcKey = pcKey;
            pcOwner.userID = user._id;
            const pcOwnerData = await PcOwner.pcAndOwner(pcOwner);
            if (pcOwnerData) {
              const out = await updateAppUserAuth(user, pcKey);
              const userClassData = new userClass(out);
              userClassData.userInformation();
              userClassData.withAuthentication();
              res.status(200);
              res.json(respond(true, 'Hello!', userClassData.get()));
            }
          }
        }
        socket.join(user.ioSocketID);
      } else {
        res.status(401);
        res.json(respond(false, 'Invalid User', null));
      }
    } else {
      res.status(401);
      res.json(respond(false, 'This  software version  no  longer  work', null));
    }
  });
  // join user from  web
  socket.on('joinFromWeb', async function(data) {
  //  logger.log(data);
    const userID = data.data.userID;
    const authentication_key = data.data.authentication_key;
    const user =await User.authUser(userID, authentication_key);
    if (user) {
      socket.join(user.ioSocketID);
      // update user Current socket ID
      const userData = {};
      userData.userCurrentSocketId = socket.id;
      await User.updateUserCurrentSocketId(user._id, userData, {});
      // pulling data from app
      io.sockets.in(user.ioSocketID).emit('getAppData', {
        data: 'start',
      });
    }
  });
  // join user from  app
  socket.on('joinFromApp', async function(data) {
    const authentication_key = data.data.authentication_key;
    const userID = data.data.userID;
    const pcKey = md5(data.data.pcKey);
    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      const user= await User.getUser(userID);
      if (user) {
        socket.join(user.ioSocketID);
        const pcData =await PC.getPC(pcKey);
        if (pcData) {
          const pcInfo = {};
          pcInfo.pcSocketID = socket.id;
          await PC.updatePcSocketID(pcData._id, pcInfo, {});
        }
      }
    }
  });
  socket.on('pcAccessRequest', async function(input) {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcID = input.pcID;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
    // logger.log(user);
      const userInfo = {};
      userInfo.pcID = pcID;
      await User.updateUserNowAccessPCID(userID, userInfo, {});
      const pc= await PC.getPCUsingID(pcID);
      if (pc) {
      //  logger.log(pc);
        const sendUserInfoToApp = {};
        sendUserInfoToApp.email = user.email;
        sendUserInfoToApp.name = user.name;
        sendUserInfoToApp.nameLast = user.nameLast;
        sendUserInfoToApp.status = true;
        sendUserInfoToApp.userID = user._id;
        io.sockets.to(pc.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
      }
    }
  });
  /**
 * get user socketID
 *
 * @param {object} pcData
 * @param {object} user
 * @param {callback} callback
 */
  async function getUserSocketID(pcData, user) {
    const pc = await PC.getPC(pcData.pcKey);
    if (pc) {
      if (pc.publicAccessStatus === 1) {
        const userAndPc = await UserAndPC.getUserAndPCUsingKey(pc.publicAccessKey);
        if (userAndPc) {
          const userData = await User.getUser(userAndPc.userID);
          // data that need to return from function
          return userData.ioSocketID;
        } else {
          return user.ioSocketID;
        }
      } else {
        return user.ioSocketID;
      }
    }
  }
  /**
 * Get owner pc  socket id  or public key socket id
 *
 * @param {object} user  user information
 * @param {string} pcKeyPublic computer public access key
 * @param {callback} callback
 */
  async function getPCSocketID(user, pcKeyPublic, callback) {
    if (pcKeyPublic === '') {
      const userPC = await PC.getPCUsingID(user.userNowAccessPCID);
      return userPC.pcSocketID;
    } else {
      const pc =await PC.getPCPublicKey(pcKeyPublic);
      if (pc.publicAccessStatus === 1) {
        return pc.pcSocketID;
      } else {
        const userPC = PC.getPCUsingID(user.userNowAccessPCID);
        return userPC.pcSocketID;
      }
    }
  }
  /**
 * Request  Computer Hard drive list
 */
  socket.on('hDDList', async function(input) {
    console.log(input);

    const userID = input.userID;
    const authentication_key = input.authentication_key;
    const computerKey = md5(input.computerKey);
    const pc = await PC.authApp(userID, authentication_key, computerKey);
    if (pc) {
      const user = await User.getUser(userID);
      if (user) {
      // to  web
        const socketID = await getUserSocketID(pc, user);
        io.sockets.in(socketID).emit('hDDList', input.data);
      }
    }
  });
  /**
   * Request  computer information
   */
  socket.on('pcInfoRequest', async function(input) {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcID = input.pcID;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      const userInfo = {};
      userInfo.pcID = pcID;
      await User.updateUserNowAccessPCID(userID, userInfo, {});
      const pc = await PC.getPCUsingID(pcID);
      if (pc) {
        const sendUserInfoToApp = {};
        sendUserInfoToApp.email = user.email;
        sendUserInfoToApp.name = user.name;
        sendUserInfoToApp.nameLast = user.nameLast;
        sendUserInfoToApp.status = true;
        sendUserInfoToApp.userID = user._id;
        io.sockets.to(pc.pcSocketID).emit('pcInfoRequest', sendUserInfoToApp);
      }
    }
  });
  /**
   *
   */
  socket.on('pcInfo', async function(input) {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKey = md5(input.pcKey);
    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      const user =await User.getUser(userID);
      if (user) {
      // to  web
        const socketID = await getUserSocketID(pc, user);
        io.sockets.in(socketID).emit('pcInfo', input.pcInfo);
      }
    }
  });
  /**
 * Request for open folder
 */
  socket.on('openFolder', async function(input) {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKeyPublic = input.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      const socket =await getPCSocketID(user, pcKeyPublic );
      io.sockets.to(socket).emit('openFolderRequest', input);
    }
  });
  // from  pc
  socket.on('sendOpenFolderRequest', async function(input) {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKey = md5(input.pcKey);
    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      const user = await User.getUser(userID);
      if (user) {
        // to  web
        const socketID = await getUserSocketID(pc, user);
        io.sockets.in(socketID).emit('openFolderRequestToWeb', input.data);
      }
    }
  });
  // get  access for  public pc key
  /**
   * User
   */
  app.post('/api/v1/computer/public/access', async function(req, res) {
    const authentication_key = req.headers.authentication_key;
    const userID = req.body.userID;
    const pcKeyPublic = req.body.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    }
    const sendUserInfoToApp = {};
    sendUserInfoToApp.email = user.email;
    sendUserInfoToApp.name = user.name;
    sendUserInfoToApp.nameLast = user.nameLast;
    sendUserInfoToApp.userID = user._id;
    const pcInfo = await PC.getPCPublicKey(pcKeyPublic);
    if (pcInfo) {
      if (pcInfo.publicAccessStatus === 1) {
        const pc = {};
        pc.pcKeyPublic = pcKeyPublic;
        pc.userID = id;
        await UserAndPC.createNewUserAndPC(pc);
        io.sockets.to(pcInfo.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
      }
    }
  });
  // validate folder name
  app.post('api/v1/user/computer/validateFolderName', async function(req, res) {
    const authentication_key = req.headers.authentication_key;
    const createFolderName = req.body.createFolderName;
    const userID = req.body.userID;
    const path = req.body.path;
    const pcKeyPublic = req.body.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      res.status(200);
      if (!isValidFoldersName(createFolderName)) {
        res.json(respond(isValidFoldersName(createFolderName), 'Invalid Folder name', null));
      } else {
        res.json(respond(true, '', null));
        const output = {};
        output.path = path;
        output.createFolderName = createFolderName;
        const socket = await getPCSocketID(user, pcKeyPublic);
        io.sockets.to(socket).emit('validateFolderName', output);
      }
    }
  });
  // from  pc  send  information after create  folder
  socket.on('folderCreateCallback', async function(input) {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const computerKey = md5(input.computerKey);
    const computer = await PC.authApp(userID, authentication_key, computerKey);
    if (computer) {
      const user = await User.getUser(userID);
      if (user) {
        const socketID =await getUserSocketID(computer, user);
        io.sockets.in(socketID).emit('folderCreateCallbackToWeb', input.data);
      }
    }
  });
});
