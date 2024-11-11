# @geniux/google-drive-picker-react

A React integration for Google Drive Picker, leveraging @geniux/google-drive-picker-core for Google Identity Services and Google Drive Picker functionality. 

This package provides an easy-to-use setup for React applications to enable file selection from Google Drive.

---

## Features

* Easy OAuth Initialization: Leverages Google Identity Services for secure OAuth token handling.
* Google Drive Picker with React Hooks: Simplifies integration with hooks and context providers.
* Typed Interfaces: Includes TypeScript types for Google Picker and OAuth, including Google Drive API scopes.
* Multi-Select Support: Allows selection of multiple files from Google Drive.

---

## Installation

To install @geniux/google-drive-picker-react, use your preferred package manager:


```bash
pnpm add @geniux/google-drive-picker-react
```
or
```bash
npm install @geniux/google-drive-picker-react
```
or
```bash
yarn add @geniux/google-drive-picker-react
```

---

## Basic Usage

Wrap Your App with the Provider

Wrap your app with the GoogleDrivePickerProvider, passing in your clientId and apiKey.

```tsx
import { GoogleDrivePickerProvider } from '@geniux/google-drive-picker-react';

const App = () => (
  <GoogleDrivePickerProvider clientId="YOUR_GOOGLE_CLIENT_ID" apiKey="YOUR_GOOGLE_API_KEY">
    <YourComponent />
  </GoogleDrivePickerProvider>
);
```

### Using the Picker in Your Component

Use the useGoogleDrivePicker hook to open the Google Drive Picker and manage selected files.

```tsx
import { useGoogleDrivePicker } from '@geniux/google-drive-picker-react';

const YourComponent = () => {
  const { openPicker, selectedFiles } = useGoogleDrivePicker({
    allowMultiSelect: true,
    scopes: ['https://www.googleapis.com/auth/drive.file'], // This scope is already default for the picker, but you can define others.
  });

  return (
    <div>
      <button onClick={openPicker}>Open Google Drive Picker</button>
      <ul>
        {selectedFiles.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Next.js Compatibility

For Next.js users, you may encounter SSR (Server-Side Rendering) issues due to the way Next.js handles client-side scripts in packages that use barrel files (index files that re-export from multiple modules).

Since this package uses barrel files, it can lead to Next.js attempting to load client-specific scripts during SSR, resulting in errors or unintended behavior.

To mitigate this, add the following configuration to next.config.js. This setting tells Next.js to optimize the import of @geniux/google-drive-picker-react so that client-side modules are correctly handled as client-only, preventing SSR errors:

```js
// next.config.js|mjs|ts
module.exports = {
    experimental: {
        optimizePackageImports: ['@geniux/google-drive-picker-react'],
    },
};
```
With this configuration, Next.js will avoid attempting to load client-side scripts server-side, ensuring the Google scripts and Picker functionality load properly when rendered on the client.


### Options and Configurations

#### GoogleDrivePickerProvider Props

* clientId (string): Google API client ID for OAuth.
* apiKey (string): Google API key for Drive Picker.

#### useGoogleDrivePicker Options

* allowMultiSelect (boolean): Allow multi-selection of files.
* scopes (array of GoogleDriveScope): OAuth scopes for Google Drive access, defaults to ['https://www.googleapis.com/auth/drive.file'].

---

## Types and Configuration Options

Refer to the [types](./src/types) for detailed type definitions and additional configuration options.

Also, check the types in [@geniux/google-drive-picker-core](../../google-drive-picker/core/src/types) for more details on OAuth configurations.

---

## License

MIT