const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
const Review = require('./models/Review');

// Import database connection
const connectDB = require('./config/db');

// Read JSON data
const menuItems = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'seed_menu_data.json'), 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'seed_user_data.json'), 'utf-8')
);

// Import Data
const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await MenuItem.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    
    console.log('Existing data cleared');
    
    // Import menu items
    await MenuItem.insertMany(menuItems);
    console.log('Menu items imported');
    
    // Hash passwords before inserting users
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );
    
    // Import users
    await User.insertMany(usersWithHashedPasswords);
    console.log('Users imported');
    
    console.log('Data import completed');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Delete Data
const destroyData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await MenuItem.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    
    console.log('All data destroyed');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Run script based on command line arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  console.log('Please specify --import or --destroy');
  process.exit();
} 