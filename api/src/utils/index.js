const crypto = require('crypto');

exports.cryptoRandomUUID = () => {
    return crypto.randomUUID();
}