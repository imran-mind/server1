/**
 * Created by imran on 31/12/16.
 */
var config = require('config'),
    fs = require('fs'),
    AWS = require('aws-sdk');

var debug = require('debug')('app.routes.common'),
    async = require('async');
//log = require('app/utils/logger')(module);

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


function getBucketUrl(fileName, cb) {
    console.log('=======>invoking getBucketUrl');

    if (!fileName) {
        return 'please provide file name';
    }

    var keyJpg = 'user/' + fileName + '.jpg';
    var keyUrl = baseUrl + keyJpg;
    var params = {
        Bucket: config.aws.bucket,
        Key: "home/imran/Desktop/imran.jpg",
        ContentType: 'image/jpg',
        Expires: config.aws.expiry,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
            log.error('==>Error in getting signedUrl', err);
            return cb(err);
        }
        console.log('==>signedUrl', url);
        console.log('==>imageUrl ', keyUrl);


        var params = {
            Bucket: config.aws.bucket,
            Key: "imran.jpg", //file.name doesn't exist as a property
            Body: fs.readFileSync("/home/imran/Desktop/imran.jpg")
        };
        s3.upload(params, function (err, data) {
            console.log("PRINT FILE:");
            if (err) {
                console.log('ERROR MSG: ', err);
                //res.status(500).send(err);
            } else {
                console.log('Successfully uploaded data');
                //res.status(200).end();
            }
        });
        return cb(null, url, keyUrl);
    });

};



getBucketUrl("file", function (err, result) {
    if (err) {
        console.log(err);
    }
    console.log(result);
})
