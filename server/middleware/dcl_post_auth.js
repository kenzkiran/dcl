module.exports = function() {
  return function dclAdminHandler(req, res, next) {
    //console.log("My dclAdminFilter ", req.originalUrl);
    next();
  }
};