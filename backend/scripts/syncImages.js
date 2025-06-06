const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const stringSimilarity = require('string-similarity');
const MenuItem = require('../models/MenuItem');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

const syncImages = async () => {
  const mongoURI = process.argv[2] || process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('Please provide MongoDB URI as an argument or in .env file.');
    process.exit(1);
  }

  await connectDB(mongoURI);

  const manualMappings = {
    'pan-seared_foie_gras_with_berry_sauce': 'Gan Ngỗng Áp Chảo Sốt Dâu Rừng',
    'stir-fried_glass_noodles_with_crab': 'Miến Xào Cua Bể'
  };

  try {
    const imagesBaseDir = path.join(__dirname, '../../backend/public/images/menu');
    const dbMenuItems = await MenuItem.find({}, 'name imageUrls');
    const dbMenuItemNames = dbMenuItems.map(item => item.name);

    if (!fs.existsSync(imagesBaseDir)) {
      console.log(`Image directory not found: ${imagesBaseDir}. Skipping sync.`);
      return;
    }

    const dishFolders = fs.readdirSync(imagesBaseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folderName of dishFolders) {
      let matchedDbItemName = null;
      let matchSource = null;

      // Check manual mappings first
      if (manualMappings[folderName]) {
        matchedDbItemName = manualMappings[folderName];
        matchSource = 'manual mapping';
      } else {
        // If not in manual mappings, use string similarity
        const bestMatch = stringSimilarity.findBestMatch(folderName, dbMenuItemNames);
        if (bestMatch.bestMatch.rating > 0.6) { // Similarity threshold
          matchedDbItemName = bestMatch.bestMatch.target;
          matchSource = `similarity (${bestMatch.bestMatch.rating.toFixed(2)})`;
        }
      }

      if (matchedDbItemName) {
        const menuItemToUpdate = dbMenuItems.find(item => item.name === matchedDbItemName);

        const imageFiles = fs.readdirSync(path.join(imagesBaseDir, folderName));
        const newImageUrls = imageFiles
          .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
          .map(file => `/images/menu/${folderName}/${file}`);

        if (menuItemToUpdate && JSON.stringify(menuItemToUpdate.imageUrls) !== JSON.stringify(newImageUrls)) {
          menuItemToUpdate.imageUrls = newImageUrls;
          await menuItemToUpdate.save();
          console.log(`SYNCED (via ${matchSource}): '${folderName}' -> '${matchedDbItemName}'. Found ${newImageUrls.length} image(s).`);
        } else if (menuItemToUpdate) {
          console.log(`SKIPPED (already up-to-date): '${folderName}' -> '${matchedDbItemName}'`);
        }
      } else {
        const bestMatch = stringSimilarity.findBestMatch(folderName, dbMenuItemNames);
        console.log(`NO MATCH FOUND for folder: '${folderName}' (Best similarity match: '${bestMatch.bestMatch.target}' with rating ${bestMatch.bestMatch.rating.toFixed(2)})`);
      }
    }
    console.log('\nImage synchronization process completed.');

  } catch (error) {
    console.error('An error occurred during image synchronization:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

syncImages(); 