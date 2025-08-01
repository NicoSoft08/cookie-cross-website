const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // Only for development/testing
    }
});

module.exports = {
    transporter
};