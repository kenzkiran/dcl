module.exports = function ($resource, DclCommon) {
    console.log('Resource: Ground: ' + DclCommon.baseUrl);
    var resourceUrl = DclCommon.baseUrl + 'Grounds/';
    var GroundResource = $resource(resourceUrl, {id: '@id'}, {
        update: {method: 'PUT'}
    });

    var getGroundsList = function (filter) {
        filter = filter || {};
        filter.order = "name ASC";
        
        return GroundResource.query({ filter: filter }).$promise;
    };

    var upsertGround = function (ground) {

        var t = new GroundResource();
        t.name = ground.name;
        t.address = ground.address;
        t.city = ground.city;
        t.url = ground.url;
        t.active = ground.active;

        if (ground.id) {
            t.id = ground.id;
            return t.$update();
        }

        // new tournament's without ids are created
        return t.$save();
    };

    return {
        getGrounds: getGroundsList,
        upsertGround: upsertGround
    };
};
