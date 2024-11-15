# Geniux Google Drive Picker Monorepo

This monorepo contains packages for integrating Google Drive Picker with Google Identity Services, supporting various framework-specific implementations.

[![Run Lint](https://github.com/geniux-designs/google-drive-picker/actions/workflows/run-lint.yml/badge.svg)](https://github.com/geniux-designs/google-drive-picker/actions/workflows/run-lint.yml)
[![Release Packages](https://github.com/geniux-designs/google-drive-picker/actions/workflows/release-packages.yml/badge.svg)](https://github.com/geniux-designs/google-drive-picker/actions/workflows/release-packages.yml)
---

## Getting Started

Each package has its own README.md with installation instructions, usage details, and API documentation. Refer to these individual package documentation files for comprehensive guidance.


* [@geniux/google-drive-picker-core](./packages/google-drive-picker/core): The core functionality package, providing Google Identity OAuth and Google Drive Picker capabilities.
* [@geniux/google-drive-picker-react](./packages/google-drive-picker/react): A React-specific package utilizing the core package to offer hooks and a context provider for easy Google Drive Picker integration in React applications.

**Note**: If you are working in a React environment, simply install @geniux/google-drive-picker-react, as it already includes the core package as a dependency.

---

## License

MIT