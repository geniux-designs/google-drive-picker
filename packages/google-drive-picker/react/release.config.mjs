/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  extends: "semantic-release-monorepo",
  ci: false,
  branches: [
    "main",
    { name: "beta", prerelease: true },
    { name: "next", prerelease: true },
    { name: "feature/*", prerelease: "${name.replace(/\\//, '-')}" },
    { name: "fix/*", prerelease: "${name.replace(/\\//, '-')}" },
  ],
  tagFormat: "@geniux/google-drive-picker-react-v${version}",
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "🚀 Features" },
            { type: "fix", section: "🐞 Bug Fixes" },
            { type: "docs", section: "📝 Documentation" },
            { type: "style", section: "💅 Code Style" },
            { type: "refactor", section: "♻ Code Refactoring" },
            { type: "perf", section: "⚡ Performance Improvements" },
            { type: "test", section: "✅ Tests" },
            { type: "build", section: "📦 Build System" },
            { type: "ci", section: "👷 CI" },
            { type: "chore", section: "🔧 Chore" },
            { type: "revert", section: "⏪ Reverts" },
          ],
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "./CHANGELOG.md",
        changelogTitle: "# Changelog for\n\n @geniux/google-drive-picker-react",
      },
    ],
    // First run: Update to version ranges
    ['@geniux/semantic-release-bumper-plugin', {
      replaceDevDeps: false
    }],
    "@semantic-release/npm",
    // Second run: Revert to workspace:*
    ['@geniux/semantic-release-bumper-plugin', {
      replaceDevDeps: false,
      revertOnly: true
    }],
    [
      "@semantic-release/git",
      {
        assets: ["./CHANGELOG.md", "./package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [{ path: "dist/**", label: "Compiled code" }],
        changelogTitle: (version, releaseDate) => {
          // Extract the version by stripping everything out up to the last dash
          const cleanVersion = version.split("-").pop();
          return `v${cleanVersion} - ${releaseDate}`;
        },
      },
    ],
  ],
};
