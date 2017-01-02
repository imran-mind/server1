/**
 * Created by imran on 5/10/16.
 */

var config = require('config'),
    AWS = require('aws-sdk');

var debug = require('debug')('app.routes.common'),
    async = require('async'),
    log = require('app/utils/logger')(module);

var s3 = new AWS.S3({
    Bucket: config.aws.bucket,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    computeChecksums: true
});


console.log(JSON.stringify(config));
/*//don't hard code your credential :)
AWS.config.update(config.get('thirdparties.aws'));*/

//S3 Configurations
AWS.config.region = config.aws.region;

var baseUrl = "https://s3-us-west-2.amazonaws.com/imran-server/";

var common = {
    generateQuery: generateQuery,
    getBucketUrl: getBucketUrl,
    mapOrderByFields: mapOrderByFields
};

function mapOrderByFields(order, type) {
    switch (order) {
        case 'pick':
            return 'pick ' + type.toUpperCase();
            break;
        case 'drop':
            return 'drop ' + type.toUpperCase();
            break;
        case 'ptime':
            return 'ptime ' + type.toUpperCase();
            break;
        case 'dtime':
            return 'dtime ' + type.toUpperCase();
            break;
    }
}
function generateQuery(type, data) {
    var query = {};
    switch (type) {
        case 'pick':
            if (data) {
                query.fromAdd = {$iLike: '%' + data.trim() + '%'};
            }
            break;
        case 'drop':
            if (data) {
                query.toAdd = {$iLike: '%' + data.trim() + '%'};
            }
            break;
        case 'ptime':
            if (data) {
                query.fromTime = {$iLike: '%' + data.trim() + '%'};
            }
            break;
        case 'dtime':
            if (data) {
                query.toTime = {$iLike: '%' + data.trim() + '%'};
            }
            break;
    }
    return query;
}


function getBucketUrl(fileName, cb) {
    log.info('=======>invoking getBucketUrl');

    if (!fileName) {
        return 'please provide file name';
    }

    var keyJpg = 'user/' + fileName + '.jpg';
    var keyUrl = baseUrl + keyJpg;
    var params = {
        Bucket: config.aws.bucket,
        Key: keyJpg,
        ContentType: 'image/jpg',
        Expires: config.aws.expiry,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
            log.error('==>Error in getting signedUrl', err);
            return cb(err);
        }
        log.info('==>signedUrl', url);
        log.info('==>imageUrl ', keyUrl);
        return cb(null, url, keyUrl);
    });

}


module.exports = common;
