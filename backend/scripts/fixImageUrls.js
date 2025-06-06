const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('../models/MenuItem');

// Load environment variables from .env file as a fallback
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Failed to connect to MongoDB');
    console.error(err.message);
    process.exit(1);
  }
};

const fixImageUrls = async () => {
  // Get MONGO_URI from command line arguments or from .env
  const mongoURI = process.argv[2] || process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('Please provide the MongoDB URI as a command line argument or in a .env file.');
    console.error('Usage: node backend/scripts/fixImageUrls.js <MONGO_URI>');
    process.exit(1);
  }
  
  await connectDB(mongoURI);

  const imagesFilePath = path.join(__dirname, '../../missing_images.txt');
  if (!fs.existsSync(imagesFilePath)) {
    console.error(`File not found: ${imagesFilePath}`);
    mongoose.connection.close();
    return;
  }
  
  const imagesFile = fs.readFileSync(imagesFilePath, 'utf-8');
  const imagePaths = imagesFile.split('\n').filter(line => line.trim() !== '');

  const imageMap = {};
  // Group images by menu item name
  imagePaths.forEach(imagePath => {
    const parts = imagePath.split('/');
    if (parts.length > 3) {
      const itemNameSlug = parts[3];
      if (!imageMap[itemNameSlug]) {
        imageMap[itemNameSlug] = [];
      }
      imageMap[itemNameSlug].push(imagePath);
    }
  });

  for (const itemNameSlug in imageMap) {
    // Convert slug back to name
    const itemName = itemNameSlug.replace(/_/g, ' ');

    try {
      const menuItem = await MenuItem.findOne({ name: new RegExp('^' + itemName + '$', 'i') });

      if (menuItem) {
        const newImageUrls = imageMap[itemNameSlug];
        // Replace existing URLs or add new ones
        menuItem.imageUrls = newImageUrls;
        await menuItem.save();
        console.log(`Updated image URLs for: ${menuItem.name}`);
      } else {
        console.log(`Menu item not found for slug: ${itemNameSlug}`);
      }
    } catch (error) {
      console.error(`Error updating item with slug ${itemNameSlug}:`, error);
    }
  }

  mongoose.connection.close();
  console.log('Finished updating image URLs.');
};

fixImageUrls(); 