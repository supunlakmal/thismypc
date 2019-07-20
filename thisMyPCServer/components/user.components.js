// md5 encrypt
const md5 = require('js-md5');
/**
 * User Module
 */
const User = require('../models/user');
/**
 * User Class
 */
class UserComponent {
  constructor() {
    this.userDbObject = {};
    this.user = {};
  }
  async getUserDataFunction(userID) {
    this.userDbObject = await User.getUser(userID);
  }
  setUserDataFunction(userData) {
    this.userDbObject = userData;
  }
  allUserData() {
    return this.userDbObject;
  }
  /**
 * User first name
 */
  getUserFirstName() {
    this.user.firstName = this.userDbObject.name;
  }
  /**
 * User last name
 */
  getUserLastName() {
    this.user.lastName = this.userDbObject.nameLast;
  }
  /**
 * User Email
 */
  getUserEmail() {
    this.user.email = this.userDbObject.email;
  }
  /**
 * User ID
 */
  getUserID() {
    this.user.userID = this.userDbObject._id;
  }
  /**
   * Return user Data
   */
  userData() {
    return this.user;
  }
  getAuthentication() {
    this.user.authentication_key = this.userDbObject.auth;
  }
}
module.exports = UserComponent;