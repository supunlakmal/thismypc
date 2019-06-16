const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const md5 = require('js-md5');
const validator = require('validator');
const fileUpload = require('express-fileupload');
const db = require('./db');
mongoose.connect(`mongodb://${db.user}:${db.password}@localhost/${db.db}`, {
  useNewUrlParser: true,
});
const http = require('http').Server(app);
const io = require('socket.io')(http);
// functions
function respond(type, msg, data) {
  const res = {};
  res.status = type;
  res.message = msg;
  res.data = data;
  return res;
}
// mongoDB models
User = require('./models/user');
// admin module
Admin = require('./models/admin');
// software module
Software = require('./models/software');
// pc  module
PC = require('./models/pc');
// pc and user  module
UserAndPC = require('./models/userAndPC');
// pc and PC Owner  module
PcOwner = require('./models/PCOwner');


app.use(bodyParser.json());
app.use(fileUpload());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept ,token ,uid');
  next();
});
http.listen(process.env.PORT || 5000);
/**
 * Custom function  for user >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 */
// pc owner socket id or  pc public key user socket id
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
// owner pc  socket id  or public key socket id
function getPCSocketID(user, pcKeyPublic, callback) {
  if (pcKeyPublic === '') {
    PC.getPCUsingID(user.userNowAccessPCID, function(err, userPC) {
      // //console.log(err);
      // console.log(pc);
      callback(userPC.pcSocketID);
    });
  } else {
    PC.getPCPublicKey(pcKeyPublic, function(err, pc) {
      if (pc.publicAccessStatus === 1) {
        callback(pc.pcSocketID);
      } else {
        PC.getPCUsingID(user.userNowAccessPCID, function(err, userPC) {
          // //console.log(err);
          // console.log(pc);
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
app.get('/siteInfo', function(req, res) {
  const outPut = {};
  User.countUsers(function(err, userCount) {
    PC.countPC(function(err, pcCount) {
      outPut.userCount = userCount;
      outPut.pcCount = pcCount;
      res.status(200);
      res.json(respond(true, 'good call', outPut));
    });
  });
});
// todo all  user  id  must  set as  uID add  it should call from headers
app.post('/auth', function(req, res) {
  //  //console.log(req.headers.token);
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
// get all pc
app.post('/myInfo/myPc', function(req, res) {
  //  //console.log(req.headers.token);
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
// get all online  pc
app.post('/myInfo/myPc/online', function(req, res) {
  //  //console.log(req.headers.token);
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
app.post('/myInfo/myPc/publicKey/update', function(req, res) {
  //  //console.log(req.headers.token);
  const userID = req.body.id;
  const auth = req.headers.token;
  const pcID = req.body.pcID;
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
  // console.log(out, pcID);
  PC.newPublicAccessKey(pcID, out, {}, function(err, pc) {
    res.status(200);
    res.json(respond(true, 'Update Done', out));
  });
});
app.post('/myInfo/myPc/update', function(req, res) {
  //  //console.log(req.headers.token);
  const userID = req.body.id;
  const auth = req.headers.token;
  const pcID = req.body.pcID;
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
  // out.auth = md5(user._id + date);
  out.publicAccessStatus = publicAccessStatus;
  // out.ioSocketID = user.ioSocketID;
  // console.log(out, pcID);
  PC.updatePublicAccessStatus(pcID, out, {}, function(err, pc) {
    res.status(200);
    res.json(respond(true, 'Update Done', out));
  });
});
// get user  info
app.post('/myInfo', function(req, res) {
  //  //console.log(req.headers.token);
  const id = req.body.id;
  const auth = req.headers.token;
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
// get user  info
app.post('/app/myInfo', function(req, res) {
  //  //console.log(req.headers.token);
  const id = req.body.id;
  const auth = req.headers.token;
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
// get user  notification  and  app notification
app.post('/app/notification', function(req, res) {
  //  //console.log(req.headers.token);
  const id = req.body.id;
  const auth = req.headers.token;
  const pcKey = req.body.pcKey;
  PC.authApp(id, auth, pcKey, function(err, pc) {
    User.getUserPublic(id, function(err, user) {
      if (!user) {
        res.status(401);
        return res.json(respond(false, 'Invalid User', null));
      } else {
        res.status(200);
        res.json(respond(true, 'good call', null));
      }
    });
  });
});
// update account  info
app.post('/account/myInfo/update', function(req, res) {
  //  //console.log(req.headers.token);
  const id = req.body.id;
  const auth = req.headers.token;
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
  // out.auth = md5(user._id + date);
  out.nameLast = req.body.nameLast;
  // out.ioSocketID = user.ioSocketID;
  User.updateUserInfo(id, out, {}, function(err, user) {});
  res.status(200);
  res.json(respond(true, 'Update Done', null));
});
// update account  password
app.post('/account/password/update', function(req, res) {
  //  //console.log(req.headers.token);
  const id = req.body.id;
  const auth = req.headers.token;
  const password = md5(req.body.password);
  const newPassword = md5(req.body.newPassword);
  const confirmNewPassword = md5(req.body.confirmNewPassword);
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
  // out.auth = md5(user._id + date);
  // out.ioSocketID = user.ioSocketID;
  User.updateUserPassword(id, out, {}, function(err, user) {});
  res.status(200);
  res.json(respond(true, 'Update Done', null));
});

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
    //    //console.log(user);
    if (!user) {
      //      //console.log('No New User');
      User.createUser(userData, function(err, user) {
        //       //console.log('add New User');
        if (err) {
          throw err;
        }
        User.loginUser(email, password, function(err, user) {
          const date = new Date();
          const out = {};
          out.name = user.name;
          out.auth = md5(user._id + date);
          out.id = user._id;
          out.ioSocketID = user.ioSocketID;
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
// this user  login
app.post('/login', function(req, res) {
  const email = req.body.email;
  const password = md5(req.body.password);
  req.body.password = password;
  const userData = req.body;
  if (req.body.email === '' || req.body.password === '') {
    res.status(401);
    return res.json(respond(false, 'username/password required', null));
  }
  User.loginUser(email, password, function(err, user) {
    if (user) {
      const date = new Date();
      const out = {};
      out.name = user.name;
      out.auth = md5(user._id + date);
      out.id = user._id;
      out.ioSocketID = user.ioSocketID;
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
// logout
app.post('/logout', function(req, res) {
  const id = req.body.id;
  const auth = req.headers.token;
  User.authUser(id, auth, function(err, user) {
    if (user) {
      const date = new Date();
      const out = {};
      out.name = user.name;
      out.auth = md5(user._id + date) + '_logout';
      out.id = user._id;
      //  out.ioSocketID = user.ioSocketID;
      User.updateUserAuth(user._id, out, {}, function(err, user) {});
      res.status(200);
      res.json(respond(true, 'logout!', null));
    } else {
      res.status(401);
      res.json(respond(true, 'Invalid User', null));
    }
  });
});
// logout
// todo  need to  fix
app.post('/app/logout', function(req, res) {
  const id = req.body.id;
  const auth = req.body.auth;
  User.authApp(id, auth, function(err, user) {
    if (user) {
      const date = new Date();
      const out = {};
      out.name = user.name;
      out.auth = md5(user._id + date) + '_logout';
      out.id = user._id;
      //  out.ioSocketID = user.ioSocketID;
      User.updateUserAuthApp(user._id, out, {}, function(err, user) {});
      res.status(200);
      res.json(respond(true, 'logout!', null));
    } else {
      res.status(401);
      res.json(respond(false, 'Invalid User', null));
    }
  });
});
// this api  function    for  admin
// create  app frp for app Store
app.post('/admin/create/app', function(req, res) {
  const limit = req.body.limit;
  const out = {};
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          const app = {};
          app.appName = req.body.appName;
          app.appInfo = req.body.appInfo;
          app.appImageUrl = req.body.appImageUrl;
          app.userID = req.body.userID;
          app.version = req.body.version;
          App.createApp(app, function(err, app) {});
          res.status(200);
          res.json(respond(true, 'Done', app));
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
// delete  app frp for app Store
app.post('/admin/update/app/image', function(req, res) {
  const id = req.body.id;
  const image = req.files.image;
  const imageName = image.name;
  console.log(id);
  console.log(image.mimetype);
  const out = {};
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          const imagePath = 'assets/images/app/' + imageName;
          image.mv('../' + imagePath, function(err) {
            if (err) return res.status(500).send(err);
            //
            //
            // res.send('File uploaded!');
            App.appImageUpdate(id, imagePath, {}, function(err, update) {});
            res.status(200);
            res.json(respond(true, 'Image Update Done', app));
          });
          // res.status(200);
          // res.json(respond(true, 'Delete Done', app));
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
app.post('/admin/update/app', function(req, res) {
  const id = req.body.id;
  const out = {};
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          App.appUpdateData(id, req.body, {}, function(err, data) {});
          res.status(200);
          res.json(respond(true, 'info Update Done', app));
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
// delete  app frp for app Store
app.post('/admin/delete/app', function(req, res) {
  const id = req.body.id;
  const out = {};
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          App.deleteApp(id, function(err, app) {});
          res.status(200);
          res.json(respond(true, 'Delete Done', app));
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});

// get all  PC
app.post('/admin/pc', function(req, res) {
  const limit = req.body.limit;
  const out = {};
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          PC.getAllPC(limit, function(err, pc) {
            if (user) {
              res.status(200);
              res.json(respond(true, 'All PC', pc));
            } else {
              res.status(401);
              res.json(respond(false, 'Invalid User', null));
            }
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
// get all  users
app.post('/admin/users', function(req, res) {
  const limit = req.body.limit;
  const out = {};
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          User.getUsers(limit, function(err, user) {
            if (user) {
              res.status(200);
              res.json(respond(true, 'All Users', user));
            } else {
              res.status(401);
              res.json(respond(false, 'Invalid User', null));
            }
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
app.post('/admin/admin/create', function(req, res) {
  const out = {};
  out.id = req.body.userID;
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          Admin.searchAdmin(out.id, function(err, admin) {
            // //console.log(admin);
            if (!admin) {
              Admin.createAdmin(out, function(err, admin) {
                //   //console.log('add New Admin');
                if (err) {
                  throw err;
                }
                //  get user info  using   id
                User.getUser(out.id, function(err, user) {
                  if (user) {
                    res.status(200);
                    res.json(respond(true, ' New Admin', user));
                  } else {
                    res.status(401);
                    res.json(respond(false, 'Invalid User', null));
                  }
                });
              });
            } else {
              res.status(401);
              res.json(respond(false, 'Admin  Already exit', null));
            }
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
app.post('/admin/user/status', function(req, res) {
  const out = {};
  out.id = req.body.userID;
  out.status = req.body.status;
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          User.updateUserStatus(out.id, out, {}, function(err, user) {
            User.getUser(out.id, function(err, userWithNewStatus) {
              res.status(200);
              res.json(respond(true, 'Status Update', userWithNewStatus));
            });
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
//  create   software   version
app.post('/admin/software/create', function(req, res) {
  const out = {};
  out.version = req.body.version;
  out.versionKey = md5(req.body.version);
  out.status = req.body.status;
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          Software.getSoftware(out.versionKey, function(err, softwareIn) {
            if (!softwareIn) {
              Software.createSoftwareVersion(out, function(err, software) {
                //       //console.log('add New User');
                if (err) {
                  throw err;
                }
                res.status(200);
                res.json(respond(true, 'new Software ', software));
              });
            } else {
              res.status(401);
              res.json(respond(false, 'Software  Already exit', null));
            }
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
//  get all   software   version
app.post('/admin/software/all', function(req, res) {
  const out = {};
  out.limit = req.body.limit;
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          Software.getSoftwares(out, function(err, software) {
            res.status(200);
            res.json(respond(software, true, 'All Software '));
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
// TODO  need to  complete
app.post('/admin/software/notification', function(req, res) {
  const out = {};
  out.version = req.body.version;
  out.versionKey = md5(req.body.version);
  out.status = req.body.status;
  out.auth = req.headers.token;
  out.uID = req.headers.uid;
  User.authUser(out.uID, out.auth, function(err, user) {
    if (user) {
      Admin.authAdmin(out.uID, function(err, admin) {
        if (admin) {
          Software.getSoftware(out.versionKey, function(err, softwareIn) {
            if (!softwareIn) {
              Software.createSoftwareVersion(out, function(err, software) {
                //       //console.log('add New User');
                if (err) {
                  throw err;
                }
                res.status(200);
                res.json(respond(true, 'new Software ', software));
              });
            } else {
              res.status(401);
              res.json(respond(false, 'Software  Already exit', null));
            }
          });
        } else {
          res.status(401);
          res.json(respond(false, 'Authenticating Error Admin', null));
        }
      });
    } else {
      res.status(401);
      res.json(respond(false, 'Authenticating Error', null));
    }
  });
});
io.on('connection', function(socket) {
  // console.log(socket.id);
  // //console.log('socket run......');
  // TODO this user  login from app need to add few   function to  it
  socket.on('loginPage', function() {
    //   //console.log('You Are  in  Login Page');
  });
  // some  user  or  app get disconnected  from serve
  socket.on('disconnect', function() {
    //  console.log('user  get  disconnected->' + socket);
    PC.getPCSocketID(socket.id, function(err, pc) {
      if (pc) {
        //   console.log(pc);
        const pcInfo = {};
        pcInfo.pcOnline = 0;
        pcInfo.pcSocketID = socket.id;
        PC.updatePcOnlineStatus(pc._id, pcInfo, {}, function(err, user) {});
      } else {
        User.getUserSocketId(socket.id, function(err, user) {
          if (user) {
            // //console.log(user);
            PC.getPCUsingID(user.userNowAccessPCID, function(err, pc) {
              const sendUserInfoToApp = {};
              sendUserInfoToApp.status = false;
              io.sockets.to(pc.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
              console.log('when  user  disconnect', pc.pcSocketID);
              //  socket.leave(pc.pcSocketID);
            });
          }
        });
      }
    });
  });

  function updateAppUserAuth(user, pcKey) {
    const date = new Date();
    const out = {};
    out.auth = md5(user._id + date + pcKey);
    out.id = user._id;
    PC.updateUserAuthApp(pcKey, out, {}, function(err, user) {
      console.log(out);
    });
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
    const userData = req.body;
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
                pcOwner.userID = user._id;
                pcOwner.pcID = pc._id;
                pcOwner.pcKey = pcKey;
                PcOwner.pcAndOwner(pcOwner, function(err, pcOwner) {
                  //     console.log(err, pcOwner);
                  const out = updateAppUserAuth(user, pcKey);
                  out.ioSocketID = 'room1';
                  res.status(200);
                  res.json(respond(true, 'Hello!', out));
                });
              } else {
                const pc = {};
                pc.pcKey = pcKey;
                pc.userID = user._id;
                pc.pcName = pcName;
                pc.platform = platform;
                pc.publicAccessKey = md5(pcKey + Date.now());
                pc.pcOnline = 1;
                pc.pcSocketID = socket.id;
                PC.createNewPC(pc, function(err, pc) {
                  const pcOwner = {};
                  pcOwner.userID = user._id;
                  pcOwner.pcID = pc._id;
                  pcOwner.pcKey = pcKey;
                  PcOwner.pcAndOwner(pcOwner, function(err, pcOwner) {
                    //       console.log(err, pcOwner);
                    const out = updateAppUserAuth(user, pcKey);
                    out.ioSocketID = 'room1';
                    res.status(200);
                    res.json(respond(true, 'Hello!', out));
                  });
                });
              }
            });
            //  socket.room = user.ioSocketID;
            socket.join(user.ioSocketID);
            //  //console.log(`This App create  new  Room ${roomID} and join to it`);
            // pc app create new  room  and other user need to join it to manage pc
            // //console.log('WEBPC------->>>>',io.sockets);
            /*   var clients_in_the_room = io.sockets.adapter.rooms[roomID].sockets;
                           for (var clientId in clients_in_the_room) {
                               //console.log('client: %s', clientId); //Seeing is believing
                           }*/
            // Todo this will no need in future
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
        // console.log(`User send data ${data}`);
        socket.join(user.ioSocketID);
        // update user Currentsockett ID
        const userData = {};
        userData.userCurrentSocketId = socket.id;
        User.updateUserCurrentSocketId(user._id, userData, {}, function(user) {});
        // console.log(`User Join to PC App Room ${user.ioSocketID}`);
        // pulling data from app
        io.sockets.in(user.ioSocketID).emit('getAppData', {
          data: 'start',
        });
        const clients_in_the_room = io.sockets.adapter.rooms[user.ioSocketID].sockets;
        for (const clientId in clients_in_the_room) {
          //    console.log('client -web: %s', clientId); //Seeing is believing
        }
      }
    });
  });
  // join user from  app
  socket.on('joinFromApp', function(data) {
    const id = data.data.id;
    const auth = data.data.auth;
    const pcKey = md5(data.data.pcKey);
    // let roomID = '';
    // console.log('joinFromApp >>>>>>>>', data);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            //       console.log(` joinFromApp >>>>>>>> user data error >>>>>>>>> ${err}`);
            //       console.log(` joinFromApp >>>>>>>> room ${user.ioSocketID}  >>>>>>> user data >>>>>>>>>`);
            socket.join(user.ioSocketID);
            PC.getPC(pcKey, function(err, pcData) {
              //  console.log('this is  app socket ->>>>>', socket.id);
              const pcInfo = {};
              pcInfo.pcSocketID = socket.id;
              PC.updatePcSocketID(pcData._id, pcInfo, {}, function(err, pc) {
                //     console.log(err);
              });
            });
            // console.log(`App Join to PC App Room ${user.ioSocketID}`);
            //     io.sockets.in(user.ioSocketID).emit('getAppData', {data: 'start'});
            const clients_in_the_room = io.sockets.adapter.rooms[user.ioSocketID].sockets;
            for (const clientId in clients_in_the_room) {
              // console.log('client -web: %s', clientId); //Seeing is believing
            }
          }
        });
      }
    });
  });
  /*   socket.on('sendList', function (msg) {
           ////console.log('get list from app ', msg);
           //   io.sockets.emit('sendToWeb', msg);
       });*/
  socket.on('pcAccessRequest', function(input) {
    //  console.log('PC Access from drop down', input);
    const id = input.userID;
    const auth = input.auth;
    const pcID = input.pcID;
    User.authUser(id, auth, function(err, user) {
      console.log('user select   pc');
      if (user) {
        const userInfo = {};
        userInfo.pcID = pcID;
        User.updateUserNowAccessPCID(id, userInfo, {}, function(err, user) {});
        // //console.log(user);
        PC.getPCUsingID(pcID, function(err, pc) {
          const sendUserInfoToApp = {};
          sendUserInfoToApp.status = true;
          sendUserInfoToApp.name = user.name;
          sendUserInfoToApp.nameLast = user.nameLast;
          sendUserInfoToApp.email = user.email;
          sendUserInfoToApp.userID = user._id;
          console.log(pc);
          io.sockets.to(pc.pcSocketID).emit('pcAccessRequest', sendUserInfoToApp);
          console.log('user ask  for  pc', pc.pcSocketID);
        });
      }
    });
    // //console.log('get list from app ', msg);
    //   io.sockets.emit('sendToWeb', msg);
  });
  // from  pc
  socket.on('hDDList', function(input) {
    //  //console.log(input);
    const id = input.id;
    const auth = input.auth;
    const pcKey = md5(input.pcKey);
    // console.log('hDDList >>>>>>>>', input);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            //            console.log(` hDDList >>>>>>>> room ${user.ioSocketID}>>>> user data error >>>>>>>>> ${err}`);
            //      //console.log(input);
            //   //console.log('get list from app ', input.data);
            // to  web
            getUserSocketID(pc, user, function(socketID) {
              // /          console.log('User new socket id >>>>>>>>>>>>>> ', socketID);
              io.sockets.in(socketID).emit('hDDList', input.data);
            });
            //  io.sockets.in(newSocketID).emit('hDDList', input.data);
          }
        });
      }
    });
  });
  // from  web
  socket.on('openFolder', function(input) {
    const id = input.id;
    const auth = input.auth;
    const pcKeyPublic = input.pcKeyPublic;
    User.authUser(id, auth, function(err, user) {
      // console.log(input);
      if (user) {
        // console.log(user);
        //     //console.log('open Folder Request ', input);
        // to pc
        //        io.sockets.in(user.ioSocketID)
        // //console.log(user);
        /*  PC.getPCUsingID(user.userNowAccessPCID, function (err, pc) {
                      // //console.log(err);
                      //console.log(pc);
                      io.sockets.to(pc.pcSocketID).emit('openFolderRequest', input);
                  });*/
        getPCSocketID(user, pcKeyPublic, function(socket) {
          io.sockets.to(socket).emit('openFolderRequest', input);
        });
      }
    });
  });
  // from  pc
  socket.on('sendOpenFolderRequest', function(input) {
    const id = input.id;
    const auth = input.auth;
    const pcKey = md5(input.pcKey);
    //   console.log('sendOpenFolderRequest >>>>>>>>', input);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      if (pc) {
        User.getUser(id, function(err, user) {
          if (user) {
            //    console.log(` sendOpenFolderRequest >>>>>>>> room ${user.ioSocketID} >>>>>> user data error >>>>>>>>> ${err}`);
            // console.log('open Folder get ', input);
            //  io.sockets.emit('openFolderRequestToWeb', msg);
            // to  web
            getUserSocketID(pc, user, function(socketID) {
              //  console.log('User new socket id >>>>>>>>>>>>>> ', socketID);
              // io.sockets.in(socketID).emit('hDDList', input.data);
              io.sockets.in(socketID).emit('openFolderRequestToWeb', input.data);
            });
          }
        });
      }
    });
  });
  // copy file  location ad paste file  location
  socket.on('copyPasteToPC', function(input) {
    const id = input.id;
    const auth = input.auth;
    User.authUser(id, auth, function(err, user) {
      // console.log(user);
      if (user) {
        // console.log(input);
        io.sockets.in(user.ioSocketID).emit('copyPasteToPCApp', input.data);
      }
    });
  });
  // copy  and paste  Done
  socket.on('pasteDone', function(input) {
    const id = input.id;
    const auth = input.auth;
    const pcKey = md5(input.pcKey);
    let roomID = '';
    // console.log('pasteDone >>>>>>>', input);
    PC.authApp(id, auth, pcKey, function(err, pc) {
      User.getUser(id, function(err, user) {
        if (user) {
          roomID = user.ioSocketID;
        }
      });
      //  console.log(` pasteDone >>>>>>>> room ${roomID} >>>>>> user data error >>>>>>>>> ${err}`);
      if (pc) {
        // console.log(input);
        io.sockets.in(user.ioSocketID).emit('pasteDone', input.data);
      }
    });
  });
  // file  transfer
  socket.on('uploadFileInfo_to_pc', function(input) {
    const id = input.id;
    const auth = input.auth;
    User.authUser(id, auth, function(err, user) {
      // console.log(user);
      if (user) {
        // console.log(input);
        io.sockets.in(user.ioSocketID).emit('uploadFileInfo_from_web', input.data);
      }
    });
  });
  socket.on('uploadFile_chunk_to_pc', function(input) {
    const id = input.id;
    const auth = input.auth;
    User.authUser(id, auth, function(err, user) {
      // console.log(user);
      if (user) {
        // console.log(input);
        io.sockets.in(user.ioSocketID).emit('uploadFile_chunk_from_web', input.data);
      }
    });
  });
  socket.on('fileSendingFromPc', function(input) {
    //  console.log(input);
  });
  // get  access for  public pc key
  /**
     * User
     */
  app.post('/public/pc/access', function(req, res) {
    const id = req.body.id;
    const auth = req.headers.token;
    const pcKeyPublic = req.body.pcKeyPublic;
    User.authUser(id, auth, function(err, user) {
      if (!user) {
        res.status(401);
        return res.json(respond(false, 'Invalid User', null));
      }
      const sendUserInfoToApp = {};
      sendUserInfoToApp.name = user.name;
      sendUserInfoToApp.nameLast = user.nameLast;
      sendUserInfoToApp.email = user.email;
      sendUserInfoToApp.userID = user._id;
      //    console.log('User Auth >>>>>>>> ');
      PC.getPCPublicKey(pcKeyPublic, function(err, pcInfo) {
        if (pcInfo) {
          if (pcInfo.publicAccessStatus === 1) {
            //      console.log('pc allow to access from public');
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
  app.post('/pc/downloadFileRequest', function(req, res) {
    const id = req.body.id;
    const auth = req.headers.token;
    const pcKeyPublic = req.body.pcKeyPublic;
    const path = req.body.path;
    User.authUser(id, auth, function(err, user) {
      // console.log(input);
      if (user) {
        const output = {};
        output.path = path;
        //     console.log('User Auth >>>>>>>> ');
        // console.log(user);
        //     //console.log('open Folder Request ', input);
        // to pc
        //        io.sockets.in(user.ioSocketID)
        // //console.log(user);
        /*  PC.getPCUsingID(user.userNowAccessPCID, function (err, pc) {
                      // //console.log(err);
                      //console.log(pc);
                      io.sockets.to(pc.pcSocketID).emit('openFolderRequest', input);
                  });*/
        getPCSocketID(user, pcKeyPublic, function(socket) {
          io.sockets.to(socket).emit('downloadFileRequest', output);
        });
      }
    });
  });
  // validate folder name
  app.post('/validateFolderName', function(req, res) {
    const id = req.body.id;
    const auth = req.headers.token;
    const pcKeyPublic = req.body.pcKeyPublic;
    const createFolderName = req.body.createFolderName;
    const path = req.body.path;
    User.authUser(id, auth, function(err, user) {
      // console.log(input);
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
    const id = input.id;
    const auth = input.auth;
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
