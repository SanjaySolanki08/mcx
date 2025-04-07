const cron = require('node-cron');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const checkInactiveAccounts = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Deactivate inactive users (15 days)
      const inactiveUsers = await User.find({
        lastPostDate: { $lt: fifteenDaysAgo },  
        accountStatus: 'active', 
      }); 

      for (const user of inactiveUsers) {
        user.accountStatus = 'inactive';
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await user.save();

        await transporter.sendMail({
          to: user.email,
          subject: 'Reactivate Your Stock Market Account',
          text: `Your account is inactive. Use this OTP to reactivate: ${otp}. Expires in 24 hours.`,
        });
      }

      // Mark as deleted (30 days)
      const toDeleteUsers = await User.find({
        lastPostDate: { $lt: thirtyDaysAgo },
        accountStatus: 'inactive',
      });

      for (const user of toDeleteUsers) {
        user.accountStatus = 'deleted';
        user.isDeleted = true;
        await user.save();
      }

      console.log('Account status check completed');
    } catch (error) {
      console.error('Error checking inactive accounts:', error);
    }
  });
};

module.exports = { checkInactiveAccounts };
