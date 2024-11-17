import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execa } from "execa";
import {
	findWorkspaceDependencies,
	findWorkspacePackages,
	findWorkspaceRoot,
	revertToWorkspaceVersions,
	updateToExactVersions,
} from "./utils.js";

const pluginState = {
	pkgJsonPath: null,
	workspaceDeps: null,
};

/**
 * Verify plugin conditions and store package.json path
 */
const verifyConditions = async (pluginConfig, context) => {
	const { logger, cwd } = context;
	logger.log("🔍 Starting verifyConditions...");

	try {
		const workspaceRoot = findWorkspaceRoot(cwd);
		logger.log(`Found workspace root at ${workspaceRoot}`);

		const workspaceVersions = findWorkspacePackages(workspaceRoot);
		logger.log(`Found ${workspaceVersions.size} workspace packages`);

		const pkgJsonPath = path.join(cwd, "package.json");
		if (!existsSync(pkgJsonPath)) {
			throw new Error("package.json not found");
		}

		logger.log(`Found package.json at ${pkgJsonPath}`);

		const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
		const workspaceDeps = findWorkspaceDependencies(pkg, workspaceVersions);
		logger.log(`Found ${workspaceDeps.length} workspace dependencies`, {
			workspaceDeps,
		});

		// Store in plugin state
		pluginState.pkgJsonPath = pkgJsonPath;
		pluginState.workspaceDeps = workspaceDeps;
		logger.log("✅ Plugin state updated", { pluginState });
	} catch (error) {
		logger.error("Failed to verify conditions", { error });
		throw error;
	}
};

/**
 * Update dependencies to exact versions before publishing
 */
const prepare = async (pluginConfig, context) => {
	const { logger } = context;

	if (!pluginState.pkgJsonPath || !pluginState.workspaceDeps) {
		throw new Error("Plugin state missing required data");
	}

	// Read and parse package.json
	const pkg = JSON.parse(readFileSync(pluginState.pkgJsonPath, "utf8"));

	// Update to exact versions
	const changes = updateToExactVersions(
		pkg,
		pluginState.workspaceDeps,
		logger,
		pluginConfig,
	);

	if (changes) {
		// Write changes back to package.json
		writeFileSync(
			pluginState.pkgJsonPath,
			`${JSON.stringify(pkg, null, 2)}\n`,
		);

		// Stage the changes
		await execa("git", ["add", pluginState.pkgJsonPath]);
	}
};

/**
 * Revert dependencies back to workspace:* after publishing
 */
const success = async (pluginConfig, context) => {
	const { logger } = context;
	logger.log("🔍 Starting success step...");

	if (!pluginConfig.revertToWorkspaceAfterRelease) {
		logger.log("Skipping revert to workspace - disabled in config");
		return;
	}

	if (!pluginState.pkgJsonPath || !pluginState.workspaceDeps) {
		logger.error("Plugin state missing required data", { pluginState });
		throw new Error("Plugin state missing required data");
	}

	logger.log(`📦 Reading package.json from ${pluginState.pkgJsonPath}`);

	// Read and parse package.json
	const pkg = JSON.parse(readFileSync(pluginState.pkgJsonPath, "utf8"));

	// Revert to workspace versions
	const changes = revertToWorkspaceVersions(
		pkg,
		pluginState.workspaceDeps,
		logger,
	);

	if (changes) {
		logger.log("💾 Writing changes back to package.json");
		// Write changes back to package.json
		writeFileSync(
			pluginState.pkgJsonPath,
			`${JSON.stringify(pkg, null, 2)}\n`,
		);

		// Stage and commit the changes
		logger.log("🔄 Creating git commit");
		try {
			await execa("git", ["add", pluginState.pkgJsonPath]);
			await execa("git", [
				"commit",
				"-m",
				"chore: reverted dependencies back to workspace:* [skip ci]",
			]);
			logger.log("✅ Successfully created revert commit");

			// Push the revert commit
			const { branch } = context;
			await execa("git", ["push", "origin", branch.name]);
			logger.log("🚀 Pushed revert commit to remote");
		} catch (error) {
			logger.error("Failed to create or push git commit", { error });
			throw error;
		}
	} else {
		logger.log("No changes needed, skipping commit");
	}
};

/**
 * Handle release failure
 */
const fail = async (pluginConfig, context) => {
	const { logger } = context;
	logger.log("! Release failed, cleaning up...");
	pluginState.pkgJsonPath = null;
	pluginState.workspaceDeps = null;
};

export { verifyConditions, prepare, success, fail };
