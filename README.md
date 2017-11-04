# AWS Secret Manager for Node

Allows download and upload of secrets from AWS S3 and KMS

[![npm version](https://badge.fury.io/js/node-aws-secrets.svg)](https://badge.fury.io/js/node-aws-secrets) [![Build Status](https://travis-ci.org/manthanhd/node-aws-secrets.svg?branch=master)](https://travis-ci.org/manthanhd/node-aws-secrets) [![Coverage Status](https://coveralls.io/repos/github/manthanhd/node-aws-secrets/badge.svg?branch=master)](https://coveralls.io/github/manthanhd/node-aws-secrets?branch=master)

## Usage

Upload secret to S3 via KMS encryption

```javascript
const SecretsManager = require("../lib/SecretsManager");
const secretsManager = new SecretsManager();

var options = {
    secret: 'my-plaintext-secret',
    s3Location: 's3://mybucket/mysecret',
    kmsKeyId: 'my-kms-key-id/arn/alias'
};
secretsManager.upload(options)
    .then(function (ciphertextBuffer) {
        // Upload and encryption was successful
        // ciphertextBuffer as Buffer object
        console.log(ciphertextBuffer.toString());
    }).catch(function (err) {
        // If things went wrong
        // err is Error object
        console.error(err);
    });
```

Access encrypted secret stored on S3

```javascript
const SecretsManager = require("../lib/SecretsManager");
const secretsManager = new SecretsManager();

secretsManager.resolve("s3://mybucket/myfolder/mysecret")
    .then(function (ciphertext) {
        // Download and decryption was successful
        // ciphertext as Buffer object
        console.log(ciphertext.toString());
    })
    .catch(function (err) {
        // If things went wrong
        // err is Error object
        console.error(err);
    });
```

## Contact

If you have a question/idea/suggestion, I'd like to encourage you to raise an issue with relevant label. I will try to get back to you as soon as I can.

If you are able, I highly encourage people to communicate their ideas over a pull request with code as it is the best and most efficient way to effectively knowledge transfer. 