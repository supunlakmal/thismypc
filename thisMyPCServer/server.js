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
