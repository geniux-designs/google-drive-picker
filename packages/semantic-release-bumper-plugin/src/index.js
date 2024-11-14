import path from "node:path";
import SemanticReleaseError from "@semantic-release/error";
import {
	findWorkspaceDependencies,
	findWorkspacePackages,
	findWorkspaceRoot,
	readPackageJson,
	revertToWorkspaceVersions,
	updateToVersionRanges,
	writePackageJson,
} from "./utils.js";

// Default configuration
const DEFAULT_CONFIG = {
	replaceDevDeps: false,
	revertOnly: false,
};

// Store analysis results for use across plugin lifecycle
let analysisState = {
	workspaceDeps: null,
	packageJson: null,
	pkgJsonPath: null,
	workspaceRoot: null,
	config: DEFAULT_CONFIG,
};

/**
 * Resets the analysis state
 */
function resetAnalysisState() {
	analysisState = {
		workspaceDeps: null,
		packageJson: null,
		pkgJsonPath: null,
		workspaceRoot: null,
		config: DEFAULT_CONFIG,
	};
}

const plugin = {
	verifyConditions: async (pluginConfig, context) => {
		const { logger, options } = context;
		logger.log("🚀 semantic-release-bumper-plugin starting up");

		// Merge default config with plugin config
		analysisState.config = { ...DEFAULT_CONFIG, ...pluginConfig };

		logger.log(
			"📋 Plugin configuration:",
			JSON.stringify(analysisState.config, null, 2),
		);
		logger.log("🔧 Running in dry-run mode:", !!options.dryRun);

		// Skip analysis in revert-only mode
		if (analysisState.config.revertOnly) {
			logger.log(
				"i Running in revert-only mode, skipping dependency analysis",
			);
			return;
		}

		try {
			// Setup paths and find workspace root
			analysisState.pkgJsonPath = path.join(
				process.cwd(),
				"package.json",
			);
			analysisState.workspaceRoot = findWorkspaceRoot(process.cwd());
			logger.log("📂 Found workspace root:", analysisState.workspaceRoot);

			// Find and analyze workspace packages
			const workspacePackages = findWorkspacePackages(
				analysisState.workspaceRoot,
				logger,
			);
			const { workspaceDeps, packageJson } = findWorkspaceDependencies(
				analysisState.pkgJsonPath,
				workspacePackages,
				analysisState.config,
				logger,
			);

			analysisState.workspaceDeps = workspaceDeps;
			analysisState.packageJson = packageJson;

			if (workspaceDeps.length > 0) {
				logger.log(
					"✅ Found workspace dependencies:",
					JSON.stringify(workspaceDeps, null, 2),
				);
				logger.log("📋 Dependencies that will be updated:");
				for (const dep of workspaceDeps) {
					logger.log(
						`  - ${dep.name} (${dep.type}): ${dep.actualVersion} → [next version]`,
					);
				}
			} else {
				logger.log("i No workspace dependencies found to update");
			}
		} catch (error) {
			throw new SemanticReleaseError(
				"Error in verifyConditions step",
				"EVERIFY",
				error.message,
			);
		}
	},

	prepare: async (config, context) => {
		const { logger, nextRelease, options } = context;

		// Handle revert-only mode
		if (analysisState.config.revertOnly) {
			logger.log(
				"🔄 Running in revert-only mode, reverting dependencies back to workspace:*",
			);
			try {
				const pkgJsonPath = path.join(process.cwd(), "package.json");
				const packageJson = readPackageJson(pkgJsonPath);

				if (revertToWorkspaceVersions(packageJson, logger)) {
					writePackageJson(pkgJsonPath, packageJson);
					logger.log(
						"💾 Successfully reverted package.json back to workspace dependencies",
					);
				}
			} catch (error) {
				throw new SemanticReleaseError(
					"Error reverting dependencies",
					"EREVERT",
					error.message,
				);
			}
			return;
		}

		// Handle update mode
		if (!nextRelease || !analysisState.workspaceDeps) {
			logger.log("! No release planned or no dependencies to update");
			return;
		}

		if (!options.dryRun && analysisState.workspaceDeps.length > 0) {
			try {
				logger.log(
					"🔄 Updating dependencies to version:",
					nextRelease.version,
				);
				const updatedPkg = { ...analysisState.packageJson };

				if (
					updateToVersionRanges(
						updatedPkg,
						analysisState.workspaceDeps,
						nextRelease.version,
						logger,
					)
				) {
					writePackageJson(analysisState.pkgJsonPath, updatedPkg);
					logger.log(
						"💾 Successfully wrote version ranges to package.json",
					);
				}
			} catch (error) {
				throw new SemanticReleaseError(
					"Error updating dependencies",
					"EUPDATE",
					error.message,
				);
			}
		}
	},

	success: async (config, context) => {
		const { logger, nextRelease } = context;

		if (analysisState.config.revertOnly) {
			logger.log("✨ Successfully reverted dependencies");
		} else {
			logger.log("✨ Success step - dependencies updated");
			logger.log("📌 Release version:", nextRelease?.version);
		}

		resetAnalysisState();
	},

	fail: async (config, context) => {
		const { logger, errors } = context;
		logger.log("❌ Release failed");
		logger.log("Error details:", errors);

		resetAnalysisState();
	},
};

export default plugin;
