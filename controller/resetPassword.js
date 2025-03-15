import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
//
dotenv.config();
const resetPassword = (req, res) => {

}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendWelcomeEmail = async (recipientEmail) => {
  try {
    const info = await transporter.sendMail({
      from: '"authentication" <sakshamgupta2308@gmail.com>',
      to: recipientEmail,
      subject: 'Welcome to Our Service!',
      text: 'Hello, welcome to our service. We are glad to have you onboard!',
      html: '<p>Hello, <strong>welcome</strong> to our service. We are glad to have you onboard!</p>'
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
