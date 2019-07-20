
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
  /**
   * get User Data from DB
   *
   * @param {String} userID
   */
  async getUserDataFunction(userID) {
    this.userDbObject = await User.getUser(userID);
  }
  /**
   * Get User data
   *
   * @param {Object} userData
   */
  setUserDataFunction(userData) {
    this.userDbObject = userData;
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
  /**
   * get authentication data
   */
  getAuthentication() {
    this.user.authentication_key = this.userDbObject.auth;
  }
}
module.exports = UserComponent;
