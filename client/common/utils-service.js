module.exports = function() {

var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

return {
  /**
   * Check if the given email is valid or not
   * Returns true if valid else false
   * @param {*} email 
   */
  IsValidEmail : function (email) {
    let email_not_ok = email_regex.exec(email) === null;
    return !email_not_ok;
  }
}

}