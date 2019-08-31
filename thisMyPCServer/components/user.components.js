/**
 * User Module
 */
const User = require('../models/user');
const ApiComponent = require('./api.components');
/**
 * User Class
 */
class UserComponent extends ApiComponent {
  constructor() {
    super();
    this.userDbObject = {};
    this.user = {};
  }
  /**
 * Deconstruction user and  class object
 */
  deconstructionUserObject() {
    this.userDbObject = {};
    this.user = {};
    return this;
  }
  /**
   * get User Data from DB
   *
   * @param {String} userID
   */
  async getUserDataFromDB(userID) {
    this.deconstructionUserObject();
    this.userDbObject = await User.getUser(userID);
    return this;
  }
  /**
   * Set User data from out side to class
   *
   * @param {Object} userData
   */
  setUserDataToClass(userData) {
    this.deconstructionUserObject();
    this.userDbObject = userData;
    return this;
  }
  /**
   * Get all user data
   */
  allUserData() {
    return this.userDbObject;
  }
  /**
 * User first name
 */
  userFirstName(type=false) {
    this.user.firstName = this.userDbObject.name;
    return type?this.userDbObject.name: this;
  }
  /**
 * User last name
 */
  userLastName(type=false) {
    this.user.lastName = this.userDbObject.nameLast;
    return type?this.userDbObject.nameLast:this;
  }
  /**
 * User Email
 */
  userEmail(type=false) {
    this.user.email = this.userDbObject.email;
    return type? this.userDbObject.email:this;
  }
  /**
 * User ID
 */
  userID(type=false) {
    this.user.userID = this.userDbObject._id;
    return type? this.userDbObject._id:this;
  }
  /**
   * Return constructed user Data
   */
  getUser() {
    const userInformation = this.user;
    this.user ={};
    return userInformation;
  }
  /**
   * get authentication data
   */
  getAuthenticationKey() {
    this.user.authentication_key = this.userDbObject.auth;
    return this;
  }
  /**
 *
 * @param {Object} res
 * @param {String} userID
 * @param {String} authentication_key
 */
  async authentication(res, userID, authentication_key) {
    if (!await User.authUser(userID, authentication_key)) {
      res.status(401);
      return res.json(this.respond(false, 'Invalid User', null));
    }
  }
}
module.exports = UserComponent;
