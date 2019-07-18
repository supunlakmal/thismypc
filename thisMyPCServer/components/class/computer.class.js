  class Computer{
    constructor(computerData){
        this.setComputerObject = computerData;
    this.computer = {};
    }
computerInformation(){
    this.computer.computerID = this.setComputerObject._id;
   
return this;
}
withAuthentication(){
    this.computer.authentication_key = this.setComputerObject.authApp;
    return this;
}
withPublicAccessStatus(){
    this.computer.publicAccessStatus = this.setComputerObject.publicAccessStatus;
    return this;
}
withPublicAccessKey(){
    this.computer.publicAccessKey = this.setComputerObject.publicAccessKey;
    return this;
}


withUserInformation(userObject){
    this.computer.userID = userObject._id;
    this.computer.firstName = userObject.name;
    this.computer.lastName = userObject.nameLast;
    this.computer.email = userObject.email;
    return this;
}


get(){
    return  this.computer;
}
}
module.exports = Computer;