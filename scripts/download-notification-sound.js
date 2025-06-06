#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// URL of a free notification sound from notificationsounds.com
const NOTIFICATION_SOUND_URL = 'https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3';
const OUTPUT_PATH = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'sounds', 'notification.mp3');

console.log('Downloading notification sound...');

// Ensure the directory exists
const dir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dir)) {
  console.log(`Creating directory: ${dir}`);
  fs.mkdirSync(dir, { recursive: true });
}

// Download the file
https.get(NOTIFICATION_SOUND_URL, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download notification sound: ${response.statusCode} ${response.statusMessage}`);
    return;
  }

  const fileStream = fs.createWriteStream(OUTPUT_PATH);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`Notification sound downloaded to: ${OUTPUT_PATH}`);
  });
}).on('error', (err) => {
  console.error(`Error downloading notification sound: ${err.message}`);
  
  // Create a placeholder file if download fails
  fs.writeFileSync(
    OUTPUT_PATH, 
    '// This is a placeholder for the notification sound file.\n// Please download a notification sound from a free sound library and replace this file.'
  );
  console.log(`Created placeholder file at: ${OUTPUT_PATH}`);
});

console.log('Note: If the download fails, please manually download a notification sound from a free sound library');
console.log('Recommended sites:');
console.log('- https://notificationsounds.com/');
console.log('- https://mixkit.co/free-sound-effects/notification/');
console.log('- https://www.zapsplat.com/sound-effect-category/notifications-and-prompts/'); 