function SecretsManager() {
    const AwsSdk = require("aws-sdk");
    const s3 = new AwsSdk.S3();
    const kms = new AwsSdk.KMS();
    const regexp = /s3:\/\/(\w+)\/(.*)$/g;

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