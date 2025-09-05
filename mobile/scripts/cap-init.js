const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

const config = {
  appId: 'com.college.cash.swap',
  appName: 'College Cash Swap',
  webDir: path.resolve(__dirname, '../../frontend').replace(/\\/g, '/'),
  server: {
    androidScheme: 'https'
  }
};

const configPath = path.resolve(__dirname, '../capacitor.config.json');
if (!existsSync(path.dirname(configPath))) {
  mkdirSync(path.dirname(configPath), { recursive: true });
}

writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Wrote', configPath);

