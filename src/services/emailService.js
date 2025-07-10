
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendPasswordResetEmail(to, token) {
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Password Reset Request',
            html: `
                <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }
}

module.exports = new EmailService();
