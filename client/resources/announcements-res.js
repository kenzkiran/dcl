'use strict';
module.exports = function ($resource, DclCommon) {
    console.log('Resource: Announcements: ' + DclCommon.baseUrl);
    var resourceUrl = DclCommon.baseUrl + 'Announcements/Blogger/:id';
    //Saving resource URL to variable Resource
    var Resource = $resource(resourceUrl, {id: '@id'});
    //if announcementID is passed, a single announcement is returned
    var getAnnouncements = function (announcementID) {
        if (announcementID !== undefined) {
            return Resource.get({ id: announcementID}).$promise;
        }
        return Resource.query().$promise;
    };
    
    return {
        // to access Announcement resource
        Resource: Resource,
        get: getAnnouncements
    };
};