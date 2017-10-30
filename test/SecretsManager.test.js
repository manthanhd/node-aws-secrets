describe("SecretsManager", function () {
    const expect = require("expect");
    const mock = require('mock-require');

    it('resolves secrets given S3 URI', function (done) {
        const fakeCiphertextBuffer = new Buffer("secret-string");

        mock('aws-sdk', { S3: function() {
            return {
                getObject: function (params, callback) {
                    expect(params.Bucket).toBe('mybucket');
                    expect(params.Key).toBe('mysecret');

                    return callback(undefined, {Body: fakeCiphertextBuffer});
                }
            }
        }, KMS: function () {
            return {
                decrypt: function (params, callback) {
                    expect(params.CiphertextBlob).toBe(fakeCiphertextBuffer);
                    return callback(undefined, {Plaintext: 'some-plaintext-key'});
                }
            }
        }});

        const SecretsManager = require("../lib/SecretsManager");
        const subject = new SecretsManager();

        subject.resolve("bucket/secret")
            .then(function (ciphertext) {
                expect(ciphertext).toBe('some-plaintext-key');
                done();
            })
            .catch(function (err) {
                expect(err).toBe(null);
                done(err);
            });
    });
});