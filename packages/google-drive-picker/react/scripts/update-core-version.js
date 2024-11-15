#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the latest version of the core package
const coreVersion = execSync('npm view @geniux/google-drive-picker-core version', { encoding: 'utf8' }).trim();
console.log('Latest core version:', coreVersion);

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update the dependency version
packageJson.dependencies['@geniux/google-drive-picker-core'] = `^${coreVersion}`;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Updated core dependency to version:', coreVersion);
