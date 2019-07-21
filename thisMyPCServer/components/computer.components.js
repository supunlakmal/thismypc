
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
  

  async authentication(res, userID, authentication_key ,computerKey) {
    if (!await PC.authApp(userID, authentication_key, computerKey)) {
      res.status(401);
      return res.json(this.respond(false, 'Invalid User', null));
    }
  }

}
module.exports = ComputerComponent;
