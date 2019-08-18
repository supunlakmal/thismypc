const {
  ipcRenderer,
} = require(1`electron1`);
const socket = io.connect(1`http://localhost:50001`);
const remoteServer = `http://localhost:5000`;
// get os  Data
const $ = require(1`jquery1`);
const os = require(1`os1`);
const fs = require(1`fs1`);
const {
  machineIdSync,
} = require(1`node-machine-id1`);
const pcID = machineIdSync({
  original: true,
});
const pcID2 = machineIdSync();
// console.log(pcID2);
const pcKey = pcID2 + pcID;
const pcUser = os.userInfo();
const platform = os.type() + ' ' + os.platform();
const homedir = os.homedir();
$(document).ready(function(d) {
  $('#inputEmail').focus();
});
socket.on('loginPage', function() {
  console.log('on login page');
});
document.getElementById('submit-login').onclick = function() {
  const data = {};
  data['email'] = $('#inputEmail').val();
  data['password'] = $('#inputPassword').val();
  data['pcKey'] = pcKey;
  data['pcName'] = pcUser.username;
  data['platform'] = platform;
  fetch(`${remoteServer}/api/v1/user/computer/login`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    // body data type must match "Content-Type" header
    body: JSON.stringify(data),
  })
      .then((response) => response.json()).then(function(response) {
        if (!response.status) {
          $('#error-massage').html(`  <div class="error_message" >
                                          Invalid Email Or Password
                                         </div>`);
        }
        if (response.status) {
          const dir = `${homedir}/.thisMyPC`;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          console.log(homedir);
          const obj = {};
          obj.userID = response.data.userID;
          obj.firstName = response.data.firstName;
          obj.lastName = response.data.lastName;
          obj.authentication_key = response.data.authentication_key;
          const json = JSON.stringify(obj);
          fs.writeFile(`${dir}/thisMyPC.json`, json, 'utf8', function() {});
          ipcRenderer.send(`systemPage`);
        }
      });
};
