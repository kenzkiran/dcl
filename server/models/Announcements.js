var _ = require('underscore');
var config = require('../config.json');
var googleapis = require('googleapis');
var blogger = googleapis.blogger('v3');
var SERVICE_ACCOUNT_EMAIL = 'blogger@dcl-blogs.iam.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = './dcl-blogger-api-key.json';
//json web token 
var jwt = new googleapis.auth.JWT(
        SERVICE_ACCOUNT_EMAIL,
        SERVICE_ACCOUNT_KEY_FILE,
        null,
        ['https://www.googleapis.com/auth/blogger']);
//create a promise object
var authPromise  = new Promise(function(resolve, reject){
    var currentDateTime = new Date();
    //resolve when expiry date is greater than currentDateTime
    if(jwt && jwt.credentials && jwt.credentials.expiry_date && jwt.credentials.expiry_date > currentDateTime){
        resolve(jwt);
        return;
    }
    //create a token
    jwt.authorize(function(err) {
     if (err) {
        reject(err);
         return;
      }
      resolve(jwt);
    });
});

module.exports = function(Announcements){
    Announcements.getBlogs = function(cb){
        try{
            authPromise
                .then(function(auth){
                    blogger.blogs.get({blogId: config.bloggerBlogId,
                                         maxPosts: 100,
                                         view: 'READER',
                                         auth: auth}, function (err, result) {
                        if(err){
                            cb(err, null);
                        }
                      if (result && result.posts && result.posts.items) {
                          var transformedResult = _.map(result.posts.items, function(item){
                              return {
                                  blogId : item.blog.id,
                                  id: item.id,
                                  published: item.published,
                                  updated: item.updated,
                                  title: item.title,
                                  url: item.url,
                                  author: item.author.displayName
                              };
                            });
                           cb(null, transformedResult);
                           } 
                        else {
                        cb("Blog not found", null);
                      }
                    });
            })
            .catch(function(error){
                cb(error, null);
            });
        } catch (error) {
            cb(error, null);
        }
    };
    Announcements.getBlog = function(postId, cb){
        try{
            authPromise
                .then(function(auth){
                  if(auth){
                    blogger.posts.get({blogId: config.bloggerBlogId,
                                         maxComments: 1,
                                         postId: postId,
                                         view: 'READER',
                                         auth: auth}, function (err, result) {
                      if(err){
                         cb(err, null);
                      }
                        
                      if (result) {
                        cb(null, result);
                      } else {
                        cb("Post not found", null);
                      }                       
                    });
                  }
            })
            .catch(function(error){
                cb(error, null);
            });
        } catch (error) {
            cb(error, null);
        }
    };
    Announcements.remoteMethod(
        'getBlogs', 
        {
            http: {path: '/blogger', verb: 'get'},
            returns: {type: '[Announcements]', root: true}
        }
    );
    Announcements.remoteMethod(
        'getBlog', 
        {
            accepts: {arg: 'postId', type: 'string'},
            http: {path: '/blogger/:postId', verb: 'get'},
            returns: {type: 'Announcements', root: true}
        }
    );
};