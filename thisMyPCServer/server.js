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
const User = require('./models_p/user');
// software module
const Software = require('./models_p/software');
// pc  module
const PC = require('./models_p/pc');
// pc and user  module
const UserAndPC = require('./models_p/userAndPC');
// pc and PC Owner  module
const PcOwner = require('./models_p/PCOwner');
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
app.post('/register', async function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  const userData = req.body;
  const date = new Date();
  const out = {};
  // create  room id
  userData.ioSocketID = md5(req.body.email + Date.now());
  if (req.body.email === '' || req.body.password === '' || req.body.name === '') {
    res.status(401);
    return res.json(respond(false, 'username/password/name required', null));
  }

  if (!validator.isEmail(email)) {
    res.status(401);
    return res.json(respond(false, 'Invalid Email', null));
  }
  // search user by user name
  const user = await User.searchEmailUser(email);


  if (!user) {
    const userCrated = await User.createUser(userData);

    if (userCrated) {
      const userLoginData = await User.loginUser(email, password);


      out.auth = md5(userLoginData._id + date);
      out.id = userLoginData._id;
      out.ioSocketID = userLoginData.ioSocketID;
      out.name = userLoginData.name;
      User.updateUserAuth(userLoginData._id, out, {}, function(err, user) {});
      // Todo this will no need in future
      out.ioSocketID = 'room1';
      res.status(200);
      res.json(respond(true, 'User login infromation', out));
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
app.post('/login', async function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  if (req.body.email === '' || req.body.password === '') {
    res.status(401);
    return res.json(respond(false, 'username/password required', null));
  }
  // wait till the promise resolves (*)
  const user = await User.loginUser(email, password);

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
    res.json(respond(true, 'User login infromation', out));
  } else {
    res.status(401);
    res.json(respond(false, 'Invalid User', null));
  }
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
app.post('/logout', async function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  const date = new Date();
  const out = {};
  const user = await User.authUser(id, auth);
  if (user) {
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
app.post('/app/logout', async function(req, res) {
  const id = req.body.id;
  const auth = req.body.auth;
  const date = new Date();
  const out = {};
  const user = await User.authApp(id, auth);


  if (user) {
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
app.post('/account/password/update', async function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  const newPassword = md5(req.body.newPassword);
  const password = md5(req.body.password);
  const user = await User.authUser(id, auth);
  if (!user) {
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
  const passwordConfirm = await User.passwordConfirm(id, password);
  if (!passwordConfirm) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }
  const out = {};
  out.password = newPassword;
  User.updateUserPassword(id, out, {}, function(err, user) {});
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
app.post('/account/myInfo/update', async function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  const user = await User.authUser(id, auth);

  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }

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
app.post('/app/myInfo', async function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  const pcKey = req.body.pcKey;
  const pc = await PC.authApp(id, auth, pcKey);

  if (pc) {
    const user = await User.getUserPublic(id);

    if (!user) {
      res.status(401);
      return res.json(respond(false, 'Invalid User', null));
    } else {
      res.status(200);
      res.json(respond(true, 'good call', user));
    }
  }
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
app.post('/myInfo', async function(req, res) {
  const auth = req.headers.token;
  const id = req.body.id;
  const user = await User.authUser(id, auth);

  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }


  const userInfo = await User.userInfo(id, auth);

  if (userInfo) {
    res.status(200);
    res.json(respond(true, 'User Information', userInfo));
  } else {
    res.status(401);
    res.json(respond(false, 'Invalid User', null));
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
app.post('/myInfo/myPc/update', async function(req, res) {
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
  const user = await User.authUser(userID, auth);


  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }


  const out = {};
  out.publicAccessKey = publicAccessKey;
  out.publicAccessStatus = publicAccessStatus;


  const pc= await PC.updatePublicAccessStatus(pcID, out, {});
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
app.post('/myInfo/myPc/publicKey/update', async function(req, res) {
  const auth = req.headers.token;
  const pcID = req.body.pcID;
  const userID = req.body.id;
  let publicAccessKey = pcID + Date.now();
  publicAccessKey = md5(publicAccessKey);


  const user =await User.authUser(userID, auth);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }


  const out = {};
  out.publicAccessKey = publicAccessKey;


  const pc = await PC.newPublicAccessKey(pcID, out, {});

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
app.post('/myInfo/myPc/online', async function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  const user =await User.authUser(id, auth);

  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }


  const pc = await PC.getPCByUserIDOnline(id);

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
app.post('/myInfo/myPc', async function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  const user = await User.authUser(id, auth);
  if (!user) {
    res.status(401);
    return res.json(respond(false, 'Invalid User', null));
  }

  const pc =await PC.getPCByUserID(id);

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
app.post('/auth', async function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  const user = await User.authUser(id, auth);

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
      PC.updatePcOnlineStatus(pc._id, pcInfo, {}, function(err, user) {});
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
});


