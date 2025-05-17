
const fs = require('fs');
const path = require('path');

try {
  // Create the scripts directory if it doesn't exist
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir);
  }
  
  console.log('Created scripts directory successfully');
  
  // Make the build-android.js file executable
  const buildAndroidPath = path.join(scriptsDir, 'build-android.js');
  fs.chmodSync(buildAndroidPath, '755');
  
  console.log('Made build-android.js executable');
  
  console.log('Scripts updated successfully!');
  console.log('\nTo build your Android app, you can now run:');
  console.log('node scripts/build-android.js');
} catch (error) {
  console.error('Error updating scripts:', error);
}
