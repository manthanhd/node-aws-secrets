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

        subject.resolve("s3://mybucket/mysecret")
            .then(function (ciphertext) {
                expect(ciphertext).toBe('some-plaintext-key');
                done();
            })
            .catch(function (err) {
                expect(err).toBe(null);
                done(err);
            });
    });

    it('catches error from S3', function (done) {
        mock('aws-sdk', { S3: function() {
            return {
                getObject: function (params, callback) {
                    expect(params.Bucket).toBe('mybucket');
                    expect(params.Key).toBe('mysecret');

                    return callback(new Error("some-error"));
                }
            }
        }, KMS: function() {}});

        const SecretsManager = require("../lib/SecretsManager");
        const subject = new SecretsManager();

        subject.resolve("s3://mybucket/mysecret")
            .then(function (ciphertext) {
                done("Expected error to have happened");
            })
            .catch(function (err) {
                expect(err.message).toBe('some-error');
                done();
            });
    });

    it('catches error from KMS', function (done) {
        const fakeCiphertextBuffer = new Buffer("secret-string");

        mock('aws-sdk', { S3: function() {
            return {
                getObject: function (params, callback) {
                    expect(params.Bucket).toBe('mybucket');
                    expect(params.Key).toBe('mysecret');

                    return callback(undefined, {Body: fakeCiphertextBuffer});
                }
            }
        }, KMS: function() {
            return {
                decrypt: function (params, callback) {
                    expect(params.CiphertextBlob).toBe(fakeCiphertextBuffer);

                    return callback(new Error('some-kms-error'));
                }
            }
        }});

        const SecretsManager = require("../lib/SecretsManager");
        const subject = new SecretsManager();

        subject.resolve("s3://mybucket/mysecret")
            .then(function (ciphertext) {
                done("Expected error to have happened");
            })
            .catch(function (err) {
                expect(err.message).toBe('some-kms-error');
                done();
            });
    });

    it('throws error when given uri is not regexp', function (done) {
        const SecretsManager = require("../lib/SecretsManager");
        const subject = new SecretsManager();

        subject.resolve("something totally not s3 uri")
            .then(function (ciphertext) {
                done("Expected error to have happened");
            })
            .catch(function (err) {
                expect(err.message).toBe('uri is not s3 uri');
                expect(err.code).toBe('URI_VALIDATION_ERROR');
                done();
            });
    });
});