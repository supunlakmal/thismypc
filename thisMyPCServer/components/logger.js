'use strict';

/**
 *  log class
 */
class Logger {
/**
 * @param {object} message 
 */
    log(message) {
    const timestamp =new Date().toISOString();
    console.log(`${timestamp} -  ${message}`);
  }
}
module.exports =new Logger();
