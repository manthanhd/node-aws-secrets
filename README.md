# AWS Secret Manager for Node

Allows download and upload of secrets from AWS S3 and KMS

[![npm version](https://badge.fury.io/js/node-aws-secrets.svg)](https://badge.fury.io/js/node-aws-secrets) [![Build Status](https://travis-ci.org/manthanhd/node-aws-secrets.svg?branch=master)](https://travis-ci.org/manthanhd/node-aws-secrets) [![Coverage Status](https://coveralls.io/repos/github/manthanhd/node-aws-secrets/badge.svg?branch=master)](https://coveralls.io/github/manthanhd/node-aws-secrets?branch=master)

## Usage

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