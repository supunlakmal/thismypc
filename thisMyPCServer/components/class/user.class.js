  class User{
    constructor(userData){
        this.setUserObject = userData;
    this.user = {};
    }
userInformation(){
    this.user.userID = this.setUserObject._id;
    this.user.firstName = this.setUserObject.name;
    this.user.lastName = this.setUserObject.nameLast;
    this.user.email = this.setUserObject.email;
return this;
}
withAuthentication(){
    this.user.authentication_key = this.setUserObject.auth;
    return this;
}

get(){
    return  this.user;
}
}
module.exports = User;