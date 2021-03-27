module.exports = function($resource, DclCommon) {
    console.log('Resource: Division: ' + DclCommon.baseUrl);
    var resourceUrl = DclCommon.baseUrl + 'Divisions/:id';
    return $resource(resourceUrl, {id: '@id'}, {
        update: {method: 'PUT'}
    });
};