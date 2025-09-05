const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtp = async (email, otp) => {
  const mailOptions = {
    from: `"CashSwap Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for CashSwap Signup',
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtp;
