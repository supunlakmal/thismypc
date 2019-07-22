

/**
 * User Class
 */
class ApiComponent {
  constructor() {

  }

   respond(type, msg, data) {
    const res = {};
    res.data = data;
    res.message = msg;
    res.status = type;
    return res;
   }
  
}
module.exports = ApiComponent;
