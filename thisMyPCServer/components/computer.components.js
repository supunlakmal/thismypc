/**
 * User Module
 */
const PC = require('../models/pc');
const UserComponent = require('./user.components');
/**
 * User Class
 */
class ComputerComponent extends UserComponent {
  constructor() {
    super();
  }
  /**
   * Get computer  Key
   */
  getComputerKey() {}
  /**
   * User ID
   */
  getUserID() {}
  /**
   * Computer  public access key that  alow to other user can use computer
   */
  getPublicAccessKey() {}
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
  getComputerAuthentication() {}
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
}
module.exports = ComputerComponent;
