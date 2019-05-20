const {
  ipcRenderer,
} = require('electron');
const socket = io.connect('http://thismypc.com:5000');
// get os  Data
const $ = require('jquery');
const os = require('os');
const fs = require('fs');
const {
  machineIdSync,
} = require('node-machine-id');
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
  const appKey = '52ce36fd7b283c9f6ed245f50df602a2';
  const data = {};
  data['email'] = $('#inputEmail').val();
  data['password'] = $('#inputPassword').val();
  //  app  key
  data['appKey'] = appKey;
  data['pcKey'] = pcKey;
  data['pcName'] = pcUser.username;
  data['platform'] = platform;
  fetch('http://thismypc.com:5000/login/app', {
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
          const dir = homedir + '\/.thisMyPC';
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          console.log(homedir);
          const obj = {};
          obj.id = response.data.id;
          obj.name = response.data.name;
          obj.ioSocketID = response.data.ioSocketID;
          obj.auth = response.data.auth;
          obj.appKey = appKey;
          const json = JSON.stringify(obj);
          fs.writeFile(dir + '\/thisMyPC.json', json, 'utf8', function() {});
          ipcRenderer.send('systemPage');
        }
      });
};
