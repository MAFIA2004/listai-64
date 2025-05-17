
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Building Android APK ===${colors.reset}\n`);

// Step 1: Build the web app
console.log(`${colors.yellow}Step 1: Building web application...${colors.reset}`);
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Web build successful${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}× Web build failed${colors.reset}`);
  process.exit(1);
}

// Step 2: Add Android platform if not already added
console.log(`${colors.yellow}Step 2: Adding Android platform (if not exists)...${colors.reset}`);
try {
  if (!fs.existsSync(path.join(process.cwd(), 'android'))) {
    execSync('npx cap add android', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Android platform added${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ Android platform already exists${colors.reset}\n`);
  }
} catch (error) {
  console.error(`${colors.red}× Failed to add Android platform${colors.reset}`);
  process.exit(1);
}

// Step 3: Copy web assets to Android platform
console.log(`${colors.yellow}Step 3: Copying web assets to Android platform...${colors.reset}`);
try {
  execSync('npx cap sync android', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Synced assets to Android${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}× Failed to sync assets${colors.reset}`);
  process.exit(1);
}

// Step 4: Instructions for building APK
console.log(`${colors.bright}${colors.cyan}=== Build Complete ===${colors.reset}\n`);
console.log(`${colors.bright}To build the APK:${colors.reset}`);
console.log(`${colors.cyan}Option 1: Using Android Studio${colors.reset}`);
console.log(`1. Run: ${colors.yellow}npx cap open android${colors.reset}`);
console.log(`2. In Android Studio, click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"${colors.reset}\n`);

console.log(`${colors.cyan}Option 2: Using Command Line${colors.reset}`);
console.log(`1. Ensure ANDROID_HOME is set and build tools are properly installed${colors.reset}`);
console.log(`2. Navigate to android directory: ${colors.yellow}cd android${colors.reset}`);
console.log(`3. Run: ${colors.yellow}./gradlew assembleDebug${colors.reset}`);
console.log(`4. Find APK at: ${colors.yellow}android/app/build/outputs/apk/debug/app-debug.apk${colors.reset}\n`);

console.log(`${colors.bright}${colors.green}Done! Your Android build is ready.${colors.reset}`);
