require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Import mô hình User
const User = require('../models/User');

// Tạo hoặc cập nhật người dùng admin
async function createAdmin() {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
      // Cập nhật vai trò nếu người dùng đã tồn tại
      adminExists.role = 'manager';
      await adminExists.save();
      console.log('Admin user updated successfully!');
    } else {
      // Tạo người dùng admin mới
      const hashedPassword = await bcrypt.hash('manager123', 10);
      const adminUser = new User({
        username: 'manager',
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'manager',
        isActive: true
      });
      await adminUser.save();
      console.log('Admin user created successfully!');
    }

    // Thoát quá trình
    process.exit(0);
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    process.exit(1);
  }
}

// Cập nhật vai trò của người dùng hiện tại thành manager
async function updateUserToAdmin(username) {
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`User with username "${username}" not found.`);
      process.exit(1);
    }
    
    user.role = 'manager';
    await user.save();
    console.log(`User "${username}" has been updated to manager role.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

// Xử lý đối số dòng lệnh
const args = process.argv.slice(2);
if (args.length > 0) {
  updateUserToAdmin(args[0]);
} else {
  createAdmin();
} 