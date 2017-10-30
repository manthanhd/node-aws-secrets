function SecretsManager() {
    const AwsSdk = require("aws-sdk");
    const s3 = new AwsSdk.S3();
    const kms = new AwsSdk.KMS();

    this.resolve = function ResolveSecretsFn (uri) {
        return new Promise (function (resolve, reject) {
            s3.getObject({Bucket: "mybucket", Key: "mysecret"}, function (err, data) {
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