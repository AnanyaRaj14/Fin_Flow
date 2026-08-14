const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  register, login, logout, getMe,
  verifyEmail, forgotPassword, resetPassword,
  updateProfile, changePassword, resendVerification,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/update-profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
