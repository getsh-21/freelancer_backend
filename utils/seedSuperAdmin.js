const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) {
    console.log('Superadmin already exists:', existing.email);
    process.exit(0);
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('SuperAdmin@123', salt);
  await User.create({
    name: 'Super Admin',
    email: 'superadmin@freelancehub.com',
    password: hashed,
    role: 'superadmin',
  });
  console.log('Superadmin created: superadmin@freelancehub.com / SuperAdmin@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });