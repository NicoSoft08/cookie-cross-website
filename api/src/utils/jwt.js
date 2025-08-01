const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '3d',
    });
};

const generateRefreshToken = (payload, expiresIn = '1d') => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
};

module.exports = { generateAccessToken, generateRefreshToken };