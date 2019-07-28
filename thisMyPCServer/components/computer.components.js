/**
 * User Module
 */
const PC = require('../models/pc');
const UserComponent = require('./user.components');
// md5 encrypt
const md5 = require('js-md5');
/**
 * User Class
 */
class ComputerComponent extends UserComponent {
  constructor() {
    super();
    this.computerDbObject ={};
    this.computer={};
  }
  deconstructionComputerObject() {
    this.computerDbObject ={};
    this.computer={};
  }
  async getComputerDataFromDBUsingUserID(userID) {
    this.deconstructionComputerObject();
    this.computerDbObject = await PC.getUser(userID);
    return this;
  }
  /**
 * Get Computer information user ID and  computer Key
 */
  async getComputerDataFromDBUsingUserIdAndComputerKey(userID, computerKey) {
    this.deconstructionComputerObject();
    this.computerDbObject = PC.getPCByUserIDAndPCKey(computerKey, userID);
    return this;
  }
 /**
  * Get computer  Key
  */
  getComputerKey() {
    this.computer.computerKey = this.computerDbObject.pcKey;
    return this;
  }
  /**
   * User ID
   */
  getUserID() {}
  /**
   * Computer  public access key that  alow to other user can use computer
   */
  getPublicAccessKey() {
    this.computer.publicAccessKey = this.computerDbObject.publicAccessKey;
    return this;
  }
  /**
   * Public access status
   */
  getPublicAccessStatus() {}
  /**
   * Computer Name
   */
  getPcName() {}
  /**
   * Compter Platform
   */
  getPlatform() {}
  /**
   * Is  computer online
   */
  getPcOnline() {}
  /**
   * get computer authentication
   */
  getComputerAuthentication() {
    this.computer.authentication_key = this.computerDbObject.authApp;
    return this;
  }
  /**
 * Get  computer  user  information
 */
  async getComputerUserInformation(userID) {
    const userInformation = new UserComponent();
    await userInformation.getUserDataFromDB(userID);
    this.computer.userID = userInformation.userID('get');
    this.computer.firstName = userInformation.userFirstName('get');
    this.computer.lastName = userInformation.userLastName('get');
    this.computer.email = userInformation.userEmail('get');
    return this;
  }
  /**
   *
   * @param {Object} res
   * @param {String} userID
   * @param {String} authentication_key
   * @param {String} computerKey
   */
  async authentication(res, userID, authentication_key, computerKey) {
    if (!await PC.authApp(userID, authentication_key, computerKey)) {
      res.status(401);
      return res.json(this.respond(false, 'Invalid User', null));
    }
  }
  /**
   *
   * @param {object} user  user information
   * @param {*} pcKey  Computer key
   * @return {object} new auth key
   */
  async updateAppUserAuth(user, pcKey) {
    this.deconstructionComputerObject();
    const date = new Date();
    const input = {};
    input.auth = md5(user._id + date + pcKey);
    input.id = user._id;
    const updateUserAuthApp = await PC.updateUserAuthApp(pcKey, input, {
      new: true,
    });
    this.computerDbObject = updateUserAuthApp;
  }
  /**
   * Get computer information
   */
  getComputer() {
    return this.computer;
  }

  /**
   * Get computer information
   */
  setComputer(data) {
    this.deconstructionComputerObject();
    this.computerDbObject = data;
  }
}
module.exports = ComputerComponent;
