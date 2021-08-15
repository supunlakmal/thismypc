/*
! TODO Do not send user auth key and other information to client side app
*/
"use strict";
// https://javascript.info/async-await
const app = require("express")();
const bodyParser = require("body-parser");
// MongoDb config variables
const db = require("./config/db");
// config  variables
const config = require("./config/config");
// const fileUpload = require('express-fileupload');
// md5 encrypt
const md5 = require("js-md5");
const mongoose = require("mongoose");
// validate inputs
const validator = require("validator");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
/**
 * components
 */
// logger
const logger = require("./components/logger");

// MongoDB server connection Atlas
mongoose.connect(`${db}`, {
  useNewUrlParser: true,
});
// Set mongoose.Promise to any Promise implementation
mongoose.Promise = Promise;
const http = require("http").Server(app);
const io = require("socket.io")(http);
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
const User = require("./models/user");
// software module
const Software = require("./models/software");
// pc  module
const PC = require("./models/pc");
// pc and user  module
const UserAndPC = require("./models/userAndPC");
// pc and PC Owner  module
const PcOwner = require("./models/PCOwner");
app.use(bodyParser.json());
app.disable("x-powered-by");
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept ,authentication_key ,userID"
  );
  next();
});
/**
 * Import Component
 */
/**
 * User Component
 */
const userComponent = require("./components/user.components");
const computerComponent = require("./components/computer.components");
/**
 * GraphQL
 */
const schema = buildSchema(`
type Query {
  user(userID: String!) : UserData,
  userWebLogin(email:String! , password:String!) : userWebLoginData
}
type userWebLoginData {
  userID :String
  firstName :String
  lastName :String
  email :String
  authentication_key:String
}
type UserData {
  userID :String
  firstName :String
  lastName :String
  email :String
}
`);
/**
 * User login
 *
 * @param {Object} args
 */
const userWebLogin = async ({ email, password }) => {
  // convert   password to  md54
  password = md5(password);
  const userLogin = await User.loginUser(email, password);
  if (!userLogin) {
    throw new Error("Invalid  User");
  }
  const date = new Date();
  userLogin.authentication_key = md5(userLogin._id + date);
  const userClass = new userComponent();
  await userClass.setUserDataToClass(
    await User.updateUserAuth(userLogin._id, userLogin, {
      new: true,
    })
  );
  return userClass
    .userEmail()
    .userFirstName()
    .userID()
    .userLastName()
    .getAuthenticationKey()
    .getUser();
};
/**
 * User Information  by ID
 *
 * @param {object} args
 */
const getUserData = async (args, req) => {
  const authentication_key = req.headers.authentication_key;
  if (!(await User.authUser(args.userID, authentication_key))) {
    throw new Error("Unauthenticated");
  }
  const userID = args.userID;
  const userClass = new userComponent();
  await userClass.getUserDataFromDB(userID);
  return userClass
    .userEmail()
    .userFirstName()
    .userID()
    .userLastName()
    .getUser();
};
// Root resolver
const root = {
  user: getUserData,
  userWebLogin: userWebLogin,
};
app.use(
  "/api/v1/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
// app.use(fileUpload());
// server port ex-5000
http.listen(process.env.PORT || config.port);
logger.log(`Sever start on Port ${config.port}`);
/**
 * REST API V1
 */
/**
 * API main end point
 */
app.get("/api/", async (req, res) => {
  res.status(200).json(respond(true, "REST API working", null));
});
/**
 *  API variation end point
 */
app.get("/api/v1/", async (req, res) => {
  res.status(200).json(respond(true, "REST API working", null));
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
app.get("/api/v1/user/:userID", async (req, res) => {
  // authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  // user ID
  const userID = req.params.userID;
  // user  class
  const userClass = new userComponent();
  const authentication = await userClass.authentication(
    res,
    userID,
    authentication_key
  );
  if (authentication) {
    return (res = authentication);
  }
  await userClass.getUserDataFromDB(userID);
  userClass
    .userID()
    .userFirstName()
    .userLastName()
    .userEmail()
    .getAuthenticationKey();
  res.status(200).json(respond(true, "User Information", userClass.getUser()));
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
app.get("/api/v1/user/:userID/computer/:computerKey", async (req, res) => {
  // authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  // user ID
  const userID = req.params.userID;
  const computerKey = md5(req.params.computerKey);
  const userClass = new userComponent();
  const computerClass = new computerComponent();
  const authentication = await computerClass.authentication(
    res,
    userID,
    authentication_key,
    computerKey
  );
  if (authentication) {
    return (res = authentication);
  }
  // user Information
  // user  class
  await userClass.getUserDataFromDB(userID);
  userClass
    .userID()
    .userFirstName()
    .userLastName()
    .userEmail()
    .getAuthenticationKey();
  res.status(200).json(respond(true, "User Information", userClass.getUser()));
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
app.post("/api/v1/user/register", async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  const userData = req.body;
  if (
    req.body.email === "" ||
    req.body.password === "" ||
    req.body.firstName === "" ||
    req.body.lastName === ""
  ) {
    res.status(401);
    return res.json(
      respond(false, "username/password/first name/last name required", null)
    );
  }
  if (
    !validator.isAlpha(req.body.firstName) ||
    !validator.isAlpha(req.body.lastName)
  ) {
    res.status(401);
    return res.json(
      respond(false, "First Name and Last Name need to be only string", null)
    );
  }
  if (!validator.isEmail(email)) {
    res.status(401);
    return res.json(respond(false, "Invalid Email", null));
  }
  // search user by user name
  const user = await User.searchEmailUser(email);
  if (!user) {
    const userClass = new userComponent();
    // create  room id
    const ioSocketID = md5(req.body.email + Date.now());
    userData.ioSocketID = ioSocketID;
    userData.authentication_key = md5(ioSocketID);
    const newUser = await User.createUser(userData);
    if (newUser) {
      // user  class
      userClass
        .setUserDataToClass(newUser)
        .userID()
        .userFirstName()
        .userLastName()
        .userEmail()
        .getAuthenticationKey();
      res
        .status(200)
        .json(respond(true, "User Information", userClass.getUser()));
    }
  } else {
    res.status(401);
    res.json(respond(false, "User  Already exit", null));
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
app.post("/api/v1/user/login", async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  if (req.body.email === "" || req.body.password === "") {
    res.status(401);
    return res.json(respond(false, "username/password required", null));
  }
  // wait till the promise resolves (*)
  const userLogin = await User.loginUser(email, password);
  if (userLogin) {
    const userClass = new userComponent();
    const date = new Date();
    userLogin.authentication_key = md5(userLogin._id + date);
    const user = await User.updateUserAuth(userLogin._id, userLogin, {
      new: true,
    });
    userClass
      .setUserDataToClass(user)
      .userID()
      .userFirstName()
      .userLastName()
      .userEmail()
      .getAuthenticationKey();
    res.status(200);
    res.json(respond(true, "User login information", userClass.getUser()));
  } else {
    res.status(401);
    res.json(respond(false, "Invalid User", null));
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
app.post("/api/v1/user/password/edit", async (req, res) => {
  // authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  const userID = req.body.userID;
  const newPassword = md5(req.body.newPassword);
  const password = md5(req.body.password);
  if (!(await User.authUser(userID, authentication_key))) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  if (
    req.body.password === "" ||
    req.body.newPassword === "" ||
    req.body.confirmNewPassword === ""
  ) {
    res.status(401);
    return res.json(
      respond(false, "Password/New Password/Confirm Password required", null)
    );
  }
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    res.status(401);
    return res.json(
      respond(false, "New Password and  Confirm Password not equal", null)
    );
  }
  const user = await User.passwordConfirm(userID, password);
  if (!user) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  user.password = newPassword;
  await User.updateUserPassword(userID, user, {});
  res.status(200);
  res.json(respond(true, "Update Done", null));
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
app.post("/api/v1/user/update", async (req, res) => {
  // authentication  key from  headers
  const authentication_key = req.headers.authentication_key;
  const userID = req.body.userID;
  if (!(await User.authUser(userID, authentication_key))) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  if (req.body.firstName === "" || req.body.lastName === "") {
    res.status(401);
    return res.json(respond(false, "First name /Last name required", null));
  }
  await User.updateUserInfo(userID, req.body, {});
  res.status(200);
  res.json(respond(true, "Update Done", null));
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
app.get("/api/v1/user/:userID/logout", async (req, res) => {
  const userID = req.params.userID;
  const authentication_key = req.headers.authentication_key;
  if (!(await User.authUser(userID, authentication_key))) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  if (user) {
    const out = {};
    out.authentication_key = md5(userID + new Date()) + "_logout";
    await User.updateUserAuth(userID, out, {});
    res.status(200);
    res.json(respond(true, "logout!", null));
  } else {
    res.status(401);
    res.json(respond(true, "Invalid User", null));
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
app.get("/api/v1/user/:userID/computer/logout", async (req, res) => {
  const userID = req.params.userID;
  const authentication_key = req.headers.authentication_key;
  if (!(await User.authApp(userID, authentication_key))) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  if (user) {
    const out = {};
    out.authentication_key = md5(userID + new Date()) + "_logout";
    await User.updateUserAuth(userID, out, {});
    res.status(200);
    res.json(respond(true, "logout!", null));
  } else {
    res.status(401);
    res.json(respond(true, "Invalid User", null));
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
app.post("/api/v1/user/computer/public/status/update", async (req, res) => {
  const authentication_key = req.headers.authentication_key;
  const computerKey = req.body.computerKey;
  const userID = req.body.userID;
  const publicAccessStatus = req.body.status;
  const user = await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
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
  const computerClassData = await PC.updatePublicAccessStatus(
    computerKey,
    out,
    {
      new: true,
    }
  );
  if (computerClassData) {
    const computerClass = new computerComponent();

    computerClass.setComputer(computerClassData);
    computerClass.getComputerAuthentication();
    computerClass.getPublicAccessKey();
    res.status(200);
    res.json(respond(true, "Update Done", computerClass.getComputer()));
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
app.post("/api/v1/user/computer/public/key/update", async (req, res) => {
  const authentication_key = req.headers.authentication_key;
  const computerKey = req.body.computerKey;
  const userID = req.body.userID;
  const user = await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  let publicAccessKey = computerKey + Date.now();
  publicAccessKey = md5(publicAccessKey);
  const out = {};
  out.publicAccessKey = publicAccessKey;
  const pc = await PC.newPublicAccessKey(pcID, out, {
    new: true,
  });
  if (pc) {
    res.status(200);
    res.json(respond(true, "Update Done", out));
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
app.post("/api/v1/user/computer/online", async (req, res) => {
  const userID = req.body.userID;
  const authentication_key = req.headers.authentication_key;
  const user = await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  const pc = await PC.getPCByUserIDOnline(userID);
  if (pc) {
    res.status(200);
    res.json(respond(true, "Computer  Information", pc));
  } else {
    res.status(401);
    res.json(respond(false, "Invalid User", null));
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
app.post("/api/v1/user/computer", async (req, res) => {
  const userID = req.body.userID;
  const authentication_key = req.headers.authentication_key;
  const user = await User.authUser(userID, authentication_key);
  if (!user) {
    res.status(401);
    return res.json(respond(false, "Invalid User", null));
  }
  const pc = await PC.getPCByUserID(userID);
  if (pc) {
    res.status(200);
    res.json(respond(true, "good call", pc));
  } else {
    res.status(401);
    res.json(respond(false, "Invalid User", null));
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
app.post("/api/v1/user/authentication", async (req, res) => {
  const userID = req.body.userID;
  const authentication_key = req.headers.authentication_key;
  const user = await User.authUser(userID, authentication_key);
  if (user) {
    res.status(200);
    res.json(respond(true, "good call", null));
  } else {
    res.status(401);
    res.json(respond(false, "Invalid User", null));
  }
});
const isValidFoldersName = (() => {
  const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
  const rg2 = /^\./; // cannot start with dot (.)
  const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return function isValidFoldersName(fname) {
    return rg1.test(fname) && !rg2.test(fname) && !rg3.test(fname);
  };
})();
io.on("connection", (socket) => {
  logger.log(socket.id);
  // TODO this user  login from app need to add few   function to  it
  socket.on("loginPage", () => {});
  // some  user  or  app get disconnected  from serve
  socket.on("disconnect", async () => {
    const pc = await PC.getPCSocketID(socket.id);
    if (pc) {
      const pcInfo = {};
      pcInfo.pcOnline = 0;
      pcInfo.pcSocketID = socket.id;
      await PC.updatePcOnlineStatus(pc._id, pcInfo, {});
    } else {
      const user = await User.getUserSocketId(socket.id);
      if (user) {
        const pc = await PC.getPCUsingID(user.userNowAccessPCID);
        if (pc) {
          const sendUserInfoToApp = {};
          sendUserInfoToApp.status = false;
          io.sockets
            .to(pc.pcSocketID)
            .emit("pcAccessRequest", sendUserInfoToApp);
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
    const updateUserAuthApp = await PC.updateUserAuthApp(pcKey, input, {
      new: true,
    });
    return updateUserAuthApp;
  }
  app.post("/api/v1/user/computer/login", async (req, res) => {
    const email = req.body.email;
    // const key = req.body.appKey;
    const password = md5(req.body.password);
    const pcKey = md5(req.body.pcKey);
    const pcName = req.body.pcName;
    const platform = req.body.platform;
    req.body.password = password;
    if (req.body.email === "" || req.body.password === "") {
      res.status(401);
      return res.json(respond(false, "username/password required", null));
    }
    // const software = await Software.getActiveSoftware(key);
    // if (software) {
    const computerClass = new computerComponent();
    const user = await User.loginUser(email, password);
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
          await computerClass.updateAppUserAuth(user, pcKey);
          computerClass.getComputerAuthentication();
          await computerClass.getComputerUserInformation(user._id);
          res.status(200);
          res.json(respond(true, "Hello!", computerClass.getComputer()));
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
            await computerClass.updateAppUserAuth(user, pcKey);
            computerClass.getComputerAuthentication();
            await computerClass.getComputerUserInformation(user._id);
            res.status(200);
            res.json(respond(true, "Hello!", computerClass.getComputer()));
          }
        }
      }
      socket.join(user.ioSocketID);
    } else {
      res.status(401);
      res.json(respond(false, "Invalid User", null));
    }
    // } else {
    //   res.status(401);
    //   res.json(respond(false, 'This  software version  no  longer  work', null));
    // }
  });
  // join user from  web
  socket.on("joinFromWeb", async (data) => {
    //  logger.log(data);
    const userID = data.data.userID;
    const authentication_key = data.data.authentication_key;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      socket.join(user.ioSocketID);
      // update user Current socket ID
      const userData = {};
      userData.userCurrentSocketId = socket.id;
      await User.updateUserCurrentSocketId(user._id, userData, {});
      // pulling data from app
      io.sockets.in(user.ioSocketID).emit("getAppData", {
        data: "start",
      });
    }
  });
  // join user from  app
  socket.on("joinFromApp", async (data) => {
    const authentication_key = data.data.authentication_key;
    const userID = data.data.userID;
    const pcKey = md5(data.data.pcKey);
    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      const user = await User.getUser(userID);
      if (user) {
        socket.join(user.ioSocketID);
        const pcData = await PC.getPC(pcKey);
        if (pcData) {
          const pcInfo = {};
          pcInfo.pcSocketID = socket.id;
          await PC.updatePcSocketID(pcData._id, pcInfo, {});
        }
      }
    }
  });
  socket.on("pcAccessRequest", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcID = input.pcID;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      // logger.log(user);
      const userInfo = {};
      userInfo.pcID = pcID;
      await User.updateUserNowAccessPCID(userID, userInfo, {});
      const pc = await PC.getPCUsingID(pcID);
      if (pc) {
        //  logger.log(pc);
        const sendUserInfoToApp = {};
        sendUserInfoToApp.email = user.email;
        sendUserInfoToApp.name = user.name;
        sendUserInfoToApp.nameLast = user.nameLast;
        sendUserInfoToApp.status = true;
        sendUserInfoToApp.userID = user._id;
        logger.log(pc.pcSocketID);
        io.sockets.to(pc.pcSocketID).emit("pcAccessRequest", sendUserInfoToApp);
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
        const userAndPc = await UserAndPC.getUserAndPCUsingKey(
          pc.publicAccessKey
        );
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
    if (pcKeyPublic === "") {
      const userPC = await PC.getPCUsingID(user.userNowAccessPCID);
      return userPC.pcSocketID;
    } else {
      const pc = await PC.getPCPublicKey(pcKeyPublic);
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
  socket.on("hDDList", async (input) => {
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
        io.sockets.in(socketID).emit("hDDList", input.data);
      }
    }
  });
  /**
   * Request  computer information
   */
  socket.on("pcInfoRequest", async (input) => {
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
        io.sockets.to(pc.pcSocketID).emit("pcInfoRequest", sendUserInfoToApp);
      }
    }
  });
  /**
   *
   */
  socket.on("pcInfo", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKey = md5(input.pcKey);
    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      const user = await User.getUser(userID);
      if (user) {
        // to  web
        const socketID = await getUserSocketID(pc, user);
        io.sockets.in(socketID).emit("pcInfo", input.pcInfo);
      }
    }
  });
  /**
   * Request for open folder
   */
  socket.on("openFolder", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKeyPublic = input.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      const socket = await getPCSocketID(user, pcKeyPublic);
      io.sockets.to(socket).emit("openFolderRequest", input);
    }
  });
  // from  pc
  socket.on("sendOpenFolderRequest", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKey = md5(input.pcKey);
    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      const user = await User.getUser(userID);
      if (user) {
        // to  web
        const socketID = await getUserSocketID(pc, user);
        io.sockets.in(socketID).emit("openFolderRequestToWeb", input.data);
      }
    }
  });
  // get  access for  public pc key
  /**
   * User
   */
  app.post("/api/v1/computer/public/access", async (req, res) => {
    const authentication_key = req.headers.authentication_key;
    const userID = req.body.userID;
    const pcKeyPublic = req.body.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (!user) {
      res.status(401);
      return res.json(respond(false, "Invalid User", null));
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
        io.sockets
          .to(pcInfo.pcSocketID)
          .emit("pcAccessRequest", sendUserInfoToApp);
      }
    }
  });
  // validate folder name
  app.post("/api/v1/user/computer/validateFolderName", async (req, res) => {
    const authentication_key = req.headers.authentication_key;
    const createFolderName = req.body.createFolderName;
    const userID = req.body.userID;
    const path = req.body.path;
    const pcKeyPublic = req.body.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      res.status(200);
      if (!isValidFoldersName(createFolderName)) {
        res.json(
          respond(
            isValidFoldersName(createFolderName),
            "Invalid Folder name",
            null
          )
        );
      } else {
        res.json(respond(true, "", null));
        const output = {};
        output.path = path;
        output.createFolderName = createFolderName;
        const socket = await getPCSocketID(user, pcKeyPublic);
        io.sockets.to(socket).emit("validateFolderName", output);
      }
    }
  });
  // from  pc  send  information after create  folder
  socket.on("folderCreateCallback", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const computerKey = md5(input.computerKey);
    const computer = await PC.authApp(userID, authentication_key, computerKey);
    if (computer) {
      const user = await User.getUser(userID);
      if (user) {
        const socketID = await getUserSocketID(computer, user);
        io.sockets.in(socketID).emit("folderCreateCallbackToWeb", input.data);
      }
    }
  });

  // Download file request
  socket.on("downloadFileRequest", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKeyPublic = input.pcKeyPublic;
    const user = await User.authUser(userID, authentication_key);
    if (user) {
      const socket = await getPCSocketID(user, pcKeyPublic);
      io.sockets.to(socket).emit("downloadFileRequestToPC", input);
    }
  });

  // Download file request
  socket.on("downloadFileInfoRequestCallBack", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const computerKey = md5(input.computerKey);
    const computer = await PC.authApp(userID, authentication_key, computerKey);
    if (computer) {
      const user = await User.getUser(userID);
      if (user) {
        const socketID = await getUserSocketID(computer, user);
        io.sockets.in(socketID).emit("downloadFileInfoSendToWeb", input.data);
      }
    }
  });

  //get data from app and send to web
  socket.on("sendFileChunksToServer", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const computerKey = md5(input.computerKey);
    const computer = await PC.authApp(userID, authentication_key, computerKey);
    if (computer) {
      const user = await User.getUser(userID);
      if (user) {
        const socketID = await getUserSocketID(computer, user);
        io.sockets.in(socketID).emit("sendFileChunksToWeb", input.data);
      }
    }
  });

  //requestScreenShot

  socket.on("requestScreenShot", async (input) => {
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKeyPublic = "";
    const user = await User.authUser(userID, authentication_key);

    if (user) {
      const socket = await getPCSocketID(user, pcKeyPublic);

      io.sockets.to(socket).emit("requestScreenShotFromPC", input);
    }
  });

  //sendScreenShotToServer

  socket.on("sendScreenShotToServer", async (input) => {
    //  console.log(input.authentication_key,input.userID,input.computerKey);
    const authentication_key = input.authentication_key;
    const userID = input.userID;
    const pcKey = md5(input.computerKey);

    const pc = await PC.authApp(userID, authentication_key, pcKey);
    if (pc) {
      //  console.log(pc)
      const user = await User.getUser(userID);
      if (user) {
        // to  web

        //  console.log(user)
        const socketID = await getUserSocketID(pc, user);
        io.sockets.in(socketID).emit("sendScreenShotToWeb", input.data);
      }
    }
  });
});
