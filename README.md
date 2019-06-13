# This My PC

<div align="center">
    <a href="http://thismypc.com/">
        <img src="http://thismypc.com/assets/images/logo/logo-mini.png">
    </a>
</div>
<br />


[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5b677e607def4466b8084eb76be4f0d7)](https://app.codacy.com/app/supunlakmal/thismypc?utm_source=github.com&utm_medium=referral&utm_content=supunlakmal/thismypc&utm_campaign=Badge_Grade_Dashboard) 
![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/supunlakmal/thismypc/graphs/commit-activity) [![Website thismypc.com](https://img.shields.io/website-up-down-green-red/http/shields.io.svg)](http://thismypc.com/) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/supunlakmal/thismypc/blob/master/LICENSE) [![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](http://thismypc.com/)

ThisMyPC is a next-generation open source solution for remote pc. It's a full stack based project that starts as an experiment.

## App Screenshots

Desktop App  Login         |  Desktop App Open
:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/supunlakmal/thismypc/master/thisMyPCWeb/src/assets/images/screen/app-login.PNG" title="Desktop App  Login " width="100%"> |<img src="https://raw.githubusercontent.com/supunlakmal/thismypc/master/thisMyPCWeb/src/assets/images/screen/app-home.PNG" title="Desktop App Open" width="100%">

Web App  PC  Drivers       |  Web App PC Drivers Open
:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/supunlakmal/thismypc/master/thisMyPCWeb/src/assets/images/screen/web-system.PNG" title="Web App  PC  Drivers" width="100%"> |<img src="https://raw.githubusercontent.com/supunlakmal/thismypc/master/thisMyPCWeb/src/assets/images/screen/web-system.PNG" title="Web App  PC  Drivers" width="100%">


##  Folder Structure 


    .
    ├── .github/ISSUE_TEMPLATE
    ├── api                          # API documentation folder
    ├── thisMyPCApp                  # Electron JS app folder
    ├── thisMyPCMobileApp            # React Native Mobile App folder
    ├── thisMyPCServer               # Node JS MongoDB and Express JS server folder
    ├── thisMyPCWeb                  # Angular website folder
    ├── .gitignore
    ├── .gitlab-ci.yml
    ├── CODE_OF_CONDUCT.md
    ├── LICENSE
    └── README.md


## Developing

### Built With

* [Node JS](https://nodejs.org/en/)
* [Angular](https://angularjs.org/)
* [Electron JS](https://electronjs.org/)
* [Mongodb](https://www.mongodb.com/)
* [React Native](https://facebook.github.io/react-native/)


### Clone Project

```shell
git clone https://github.com/supunlakmal/thismypc.git
```
This Command  will copy a full  project  to your local  environment 

### Setting up Angular Project

```shell
cd thisMyPCWeb/
npm i
```

`cd thisMyPCWeb` Move into angular Project Folder 
`npm i` install all  dependency.

### Setting up Electron Project

```shell
cd thisMyPCApp/
npm i
```

`cd thisMyPCWeb` Move into  Electron  Project Folder 
`npm i` install all  dependency.


### Setting up Node Server 

```shell
cd thisMyPCServer/
npm i
```

`cd thisMyPCServer` Move into  Node  Project Folder 
`npm i` install all  dependency.



### Building Node  Project

Run `npm node index.js` to start node server


### Building Angular Project

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Building Electron  Project

Run `npm run start` start electron app in debug mode

## REST  API Reference

#### API Reference

 * PC - Personal Computer 
 * thismypc.com:5000 - This is Thismypc web site API url. You can use your own Thismypc server link instead default Link.


### Web API

Web API| URL | Description 
------------ | ------------- | -------------
User Register| thismypc.com:5000/register |[User Register](api/UserRegister.md)
User Login | thismypc.com:5000/login | [User Login](api/LoginFromWeb.md)
User Logout | thismypc.com:5000/logout | -
User Auth | thismypc.com:5000/auth | -
User Info | thismypc.com:5000/myInfo | -
User Online PC List| thismypc.com:5000/myInfo/myPC/online | -
Public PC Access | thismypc.com:5000/public/pc/access | -
User PC List | thismypc.com:5000/myInfo/myPC | -
Update User Account | thismypc.com:5000/account/myInfo/update | -
Update User Password | thismypc.com:5000/account/password/update | -
Update User PC Info | thismypc.com:5000/myInfo/myPc/update | -

### App API

APP API| URL | Description 
------------ | ------------- | -------------
-| - |-

## Database

MongoDB use as Database. 

## Licensing

The MIT License 2019 Supun Lakmal
