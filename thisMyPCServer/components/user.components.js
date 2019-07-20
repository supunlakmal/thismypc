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
  userData() {
    return this.user;
  }
}
module.exports = UserComponent;
