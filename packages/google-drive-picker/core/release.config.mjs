/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
	extends: "semantic-release-monorepo",
	ci: false,
	branches: [
		"main",
		{ name: "alpha", prerelease: true },
		{ name: "beta", prerelease: true },
		{ name: "next", prerelease: true },
		{ name: "feature/*", prerelease: "${name.replace(/\\//, '-')}" },
		{ name: "fix/*", prerelease: "${name.replace(/\\//, '-')}" },
	],
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
						// { type: "style", section: "💅 Code Style" },
						// { type: "refactor", section: "♻ Code Refactoring" },
						{
							type: "perf",
							section: "⚡ Performance Improvements",
						},
						// { type: "test", section: "🧪 Tests" },
						// { type: "build", section: "📦 Build System" },
						// { type: "ci", section: "🔧 Continuous Integration" },
						// { type: "chore", section: "📌 Chores" },
						// { type: "revert", section: "⏪ Reverts" },
						{
							type: "BREAKING CHANGE",
							section: "💥 Breaking Changes",
						},
					],
				},
			},
		],
		[
			"@semantic-release/changelog",
			{
				changelogFile: "./CHANGELOG.md",
				changelogTitle:
					"# Changelog for\n\n @geniux/google-drive-picker-core",
			},
		],
		"@semantic-release/npm",
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json"],
				message:
					"chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: [{ path: "dist/**", label: "Compiled code" }],
				successComment: false,
				failTitle: false,
				releasedLabels: false,
				addReleases: "top",
				releaseNameTemplate: "v${nextRelease.version}"
			},
		],
	],
};
