import fs from "node:fs";
import path from "node:path";
import SemanticReleaseError from "@semantic-release/error";

/**
 * Reads and parses a package.json file
 * @param {string} pkgJsonPath - Path to package.json
 * @returns {Object} Parsed package.json contents
 */
export const readPackageJson = (pkgJsonPath) => {
	try {
		return JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
	} catch (error) {
		throw new SemanticReleaseError(
			"Error reading package.json",
			"EREADPKG",
			error.message,
		);
	}
};

/**
 * Writes content to package.json
 * @param {string} pkgJsonPath - Path to package.json
 * @param {Object} content - Content to write
 */
export const writePackageJson = (pkgJsonPath, content) => {
	try {
		fs.writeFileSync(pkgJsonPath, `${JSON.stringify(content, null, 2)}\n`);
	} catch (error) {
		throw new SemanticReleaseError(
			"Error writing package.json",
			"EWRITEPKG",
			error.message,
		);
	}
};

/**
 * Finds the workspace root by looking for pnpm-workspace.yaml
 * @param {string} startDir - Directory to start searching from
 * @returns {string} Path to workspace root
 */
export const findWorkspaceRoot = (startDir) => {
	let currentDir = startDir;
	while (currentDir !== "/") {
		if (fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
			return currentDir;
		}
		currentDir = path.dirname(currentDir);
	}
	throw new SemanticReleaseError(
		"Could not find workspace root",
		"EWORKSPACE",
		"No pnpm-workspace.yaml found in parent directories",
	);
};

/**
 * Finds all package.json files in the workspace
 * @param {string} workspaceRoot - Path to workspace root
 * @param {Object} logger - Semantic Release logger
 * @returns {Object[]} Array of workspace packages
 */
export const findWorkspacePackages = (workspaceRoot, logger) => {
	try {
		const packages = [];
		const queue = [workspaceRoot];

		while (queue.length > 0) {
			const currentDir = queue.shift();
			const entries = fs.readdirSync(currentDir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(currentDir, entry.name);

				if (
					entry.isDirectory() &&
					!entry.name.startsWith(".") &&
					entry.name !== "node_modules"
				) {
					queue.push(fullPath);
				} else if (entry.name === "package.json") {
					const pkg = readPackageJson(fullPath);
					packages.push({ path: fullPath, pkg });
				}
			}
		}

		logger.log(` Found ${packages.length} packages in workspace`);
		return packages;
	} catch (error) {
		throw new SemanticReleaseError(
			"Error scanning workspace",
			"ESCANWS",
			error.message,
		);
	}
};

/**
 * Analyzes dependencies in package.json for workspace packages
 * @param {string} pkgJsonPath - Path to package.json
 * @param {Object[]} workspacePackages - Array of workspace packages
 * @param {Object} config - Plugin configuration
 * @param {Object} logger - Semantic Release logger
 * @returns {Object} Object containing workspace dependencies and package.json
 */
export const findWorkspaceDependencies = (
	pkgJsonPath,
	workspacePackages,
	config,
	logger,
) => {
	const packageJson = readPackageJson(pkgJsonPath);
	const workspaceDeps = [];

	// Map of package names to their actual versions
	const pkgVersions = new Map(
		workspacePackages.map(({ pkg }) => [pkg.name, pkg.version]),
	);

	// Types of dependencies to check
	const depTypes = ["dependencies"];
	if (config.replaceDevDeps) {
		depTypes.push("devDependencies");
	}

	for (const type of depTypes) {
		const deps = packageJson[type];
		if (!deps) continue;

		for (const [name, version] of Object.entries(deps)) {
			if (version === "workspace:*" && pkgVersions.has(name)) {
				workspaceDeps.push({
					name,
					type,
					version,
					actualVersion: pkgVersions.get(name),
				});
			}
		}
	}

	return { workspaceDeps, packageJson };
};

/**
 * Updates dependencies to major version ranges (^)
 * @param {Object} pkg - Package.json contents
 * @param {Object[]} workspaceDeps - Array of workspace dependencies
 * @param {string} version - Version to update to
 * @param {Object} logger - Semantic Release logger
 * @returns {boolean} Whether any changes were made
 */
export const updateToVersionRanges = (pkg, workspaceDeps, version, logger) => {
	let changes = false;

	for (const dep of workspaceDeps) {
		const depSection = pkg[dep.type];
		if (depSection && depSection[dep.name]) {
			depSection[dep.name] = `^${version}`;
			changes = true;
			logger.log(
				`  Updated ${dep.name} in ${dep.type} from ${dep.actualVersion} to ^${version}`,
			);
		}
	}

	return changes;
};

/**
 * Reverts all @geniux dependencies to workspace:*
 * @param {Object} pkg - Package.json contents
 * @param {Object} logger - Semantic Release logger
 * @returns {boolean} Whether any changes were made
 */
export const revertToWorkspaceVersions = (pkg, logger) => {
	let changes = false;
	const depTypes = ["dependencies", "devDependencies", "peerDependencies"];

	for (const type of depTypes) {
		const deps = pkg[type];
		if (!deps) continue;

		for (const [name, version] of Object.entries(deps)) {
			if (/^\d/.test(version) && name.startsWith("@geniux/")) {
				deps[name] = "workspace:*";
				changes = true;
				logger.log(`  Reverted ${name} in ${type} back to workspace:*`);
			}
		}
	}

	return changes;
};
