const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');
const defaultCategories = require('../utils/defaultCategories');
const { verifyEmailTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Email already in use.' });

  const hashed = await bcrypt.hash(password, 12);
  const verifyToken = generateToken();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      verifyToken,
      verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Create default categories for the user
  await prisma.category.createMany({
    data: defaultCategories.map((c) => ({ ...c, userId: user.id })),
  });

  // Create default settings
  await prisma.settings.create({ data: { userId: user.id } });

  // Send verification email
  const url = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendEmail({ to: email, subject: 'Verify your FinFlow account', html: verifyEmailTemplate(name, url) });

  res.status(201).json({ message: 'Account created! Please check your email to verify your account.' });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before logging in.' });
  }

  const token = signToken(user.id);
  setCookie(res, token);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, avatar: true, isVerified: true, createdAt: true },
  });
  res.json({ user });
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyTokenExpiry: { gt: new Date() } },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null, verifyTokenExpiry: null },
  });

  res.json({ message: 'Email verified! You can now log in.' });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const resetToken = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const url = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({ to: email, subject: 'Reset your FinFlow password', html: resetPasswordTemplate(user.name, url) });

  res.json({ message: 'If that email exists, a reset link has been sent.' });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired reset link.' });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ message: 'Password reset successfully. You can now log in.' });
};

// PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  const { name } = req.body;
  const avatar = req.file?.path || undefined;

  const data = {};
  if (name) data.name = name;
  if (avatar) data.avatar = avatar;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: { id: true, name: true, email: true, avatar: true },
  });

  res.json({ user });
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  res.json({ message: 'Password changed successfully.' });
};

module.exports = { register, login, logout, getMe, verifyEmail, forgotPassword, resetPassword, updateProfile, changePassword, resendVerification };

// POST /api/auth/resend-verification
async function resendVerification(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.json({ message: 'If that email exists, a verification link has been sent.' });
  if (user.isVerified) return res.status(400).json({ message: 'This email is already verified.' });

  const verifyToken = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyToken,
      verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const url = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your FinFlow account',
    html: verifyEmailTemplate(user.name, url),
  });

  res.json({ message: 'Verification email resent. Please check your inbox.' });
}
