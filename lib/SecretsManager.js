function SecretsManager(config) {
    const AwsSdk = require("aws-sdk");
    const s3Config = (config && config.s3) ? config.s3 : undefined;
    const kmsConfig = (config && config.kms) ? config.kms : undefined;
    const s3 = new AwsSdk.S3(s3Config);
    const kms = new AwsSdk.KMS(kmsConfig);
    const regexp = /s3:\/\/([\w-_\.]+)\/(.*)$/g;

    this.upload = function UploadSecretsFn(options) {
        return new Promise(function(resolve, reject) {
            var s3Location = options.s3Location;
            var match = regexp.exec(s3Location);
            if(null === match || (match.length !== null && match.length != 3)) {
                var error = new Error('uri is not s3 uri');
                error.code = 'URI_VALIDATION_ERROR';
                return reject(error);
            }

            var bucketName = match[1];
            var key = match[2];
            var secret = options.secret;
            var kmsKeyId = options.kmsKeyId;

            kms.encrypt({KeyId: kmsKeyId, Plaintext: secret}, function(err, data) {
                if(err) return reject(err);

                var ciphertextBlob = data.CiphertextBlob;

                s3.putObject({Bucket: bucketName, Key: key, Body: ciphertextBlob}, function(err, data) {
                    if(err) return reject(err);

                    resolve(ciphertextBlob);
                });
            });
        });
    };

    this.resolve = function ResolveSecretsFn (uri) {
        return new Promise (function (resolve, reject) {
            var match = regexp.exec(uri);
            if(null === match || (match.length !== null && match.length != 3)) {
                var error = new Error('uri is not s3 uri');
                error.code = 'URI_VALIDATION_ERROR';
                return reject(error);
            }

            var bucketName = match[1];
            var key = match[2];
            s3.getObject({Bucket: bucketName, Key: key}, function (err, data) {
                if(err) return reject(err);

                var secretData = data.Body;

                return kms.decrypt({CiphertextBlob: secretData}, function (err, data) {
                    if(err) return reject(err);

                    return resolve(data.Plaintext);
                });
            });
        });
    };

    return this;
}

module.exports = SecretsManager;