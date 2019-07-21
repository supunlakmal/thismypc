
/**
 * User Module
 */
const User = require('../models/user');
const ApiComponent = require('../components/api.components');
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
   * get User Data from DB
   *
   * @param {String} userID
   */
  async getUserDataFromDB(userID) {
    this.userDbObject = await User.getUser(userID);
  }
  /**
   * Set User data from out side to class
   *
   * @param {Object} userData
   */
  setUserDataToClass(userData) {
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
 userFirstName() {
    this.user.firstName = this.userDbObject.name;
  }
  /**
 * User last name
 */
 userLastName() {
    this.user.lastName = this.userDbObject.nameLast;
  }
  /**
 * User Email
 */
  userEmail() {
    this.user.email = this.userDbObject.email;
  }
  /**
 * User ID
 */
  userID() {
    this.user.userID = this.userDbObject._id;
  }
  /**
   * Return constructed user Data
   */
  getUser() {
    return this.user;
  }
  /**
   * get authentication data
   */
  getAuthenticationKey() {
    this.user.authentication_key = this.userDbObject.auth;
  }

 async authentication(res,userID,authentication_key){
    if (!await User.authUser(userID, authentication_key)) {
      res.status(401);
     return  res.json(this.respond(false, 'Invalid User', null));
  
    }


  }
}
module.exports = UserComponent;
