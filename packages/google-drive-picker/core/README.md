# @geniux/google-drive-picker-core

A lightweight, **framework-agnostic** core package for integrating Google Drive Picker and Google Identity Services. 

This package provides foundational functionality designed to support integrations with any framework, such as React, Vue, or others.


---

## Use in Framework-Specific Integrations

This core package is designed to support framework-specific packages, such as [@geniux/google-drive-picker-react](../react), which provides a ready-to-use implementation for React applications.

Developers using other frameworks can leverage this core package to build their own integrations or make a Pull Request here 😉

---

## Features

* OAuth Token Initialization via Google Identity Services.
* Google Drive Picker Creation with customizable configurations (multi-select, file types, etc.).
* Typed Interface for Google Picker and OAuth, including all necessary Google Drive API scopes.

---


## Installation

To install `@geniux/google-drive-picker-core`, use your preferred package manager:

```bash
pnpm add @geniux/google-drive-picker-core
```
or
```bash
npm install @geniux/google-drive-picker-core
```
or
```bash
yarn add @geniux/google-drive-picker-core
```

---

## Basic Usage

### Initialize Google Identity for OAuth

To retrieve an OAuth token from Google Identity Services, use the initializeGoogleIdentityService function, providing your client ID and an array of scopes.

```ts
import { 
    type GoogleDriveScope, 
    initializeGoogleIdentityService 
} from '@geniux/google-drive-picker-core';

const clientId = 'YOUR_GOOGLE_CLIENT_ID';
const scopes: GoogleDriveScope[] = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Initialize Google Identity and get an OAuth token
initializeGoogleIdentityService({
  clientId,
  scopes,
  callback: (oauthToken: string) => {
    console.log('OAuth Token:', oauthToken);
    // Pass this token to createPicker or other Google APIs
  },
});
```

### Create the Google Drive Picker

Using the OAuth token obtained, you can now create a Google Drive Picker instance to allow users to select files.

```ts
import { 
    type GoogleDrivePickerConfig, 
    type GoogleDriveFile, 
    createPicker
} from '@geniux/google-drive-picker-core';

const oauthToken = 'YOUR_OAUTH_TOKEN'; // Obtained from initializeGoogleIdentityService
const apiKey = 'YOUR_GOOGLE_API_KEY';

const config: GoogleDrivePickerConfig = {
  viewId: 'DOCS',
  allowMultiSelect: true,
};

// Callback function to handle selected files
const handleSelectedFiles = (files: GoogleDriveFile[]) => {
  console.log('Selected Files:', files);
};

// Create and open the picker
createPicker({
  oauthToken,
  apiKey,
  config,
  setSelectedFiles: handleSelectedFiles,
});
```

---

## Types and Configuration Options
Refer to the package’s [types](./src/types) folder for additional details and customization options.

---

## License

MIT

