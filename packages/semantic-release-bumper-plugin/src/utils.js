import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Finds the workspace root by looking for pnpm-workspace.yaml
 * @param {string} startDir - Directory to start searching from
 * @returns {string} Path to workspace root
 */
export const findWorkspaceRoot = (startDir) => {
	let currentDir = startDir;
	while (currentDir !== "/") {
		if (existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
			return currentDir;
		}
		currentDir = path.dirname(currentDir);
	}
	throw new Error("No pnpm-workspace.yaml found in parent directories");
};

/**
 * Finds all package.json files in the workspace
 * @param {string} workspaceRoot - Path to workspace root
 * @returns {Object[]} Array of workspace packages with their versions
 */
export const findWorkspacePackages = (workspaceRoot) => {
	const packages = new Map();
	const queue = [workspaceRoot];

	while (queue.length > 0) {
		const currentDir = queue.shift();
		const entries = readdirSync(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name);

			if (
				entry.isDirectory() &&
				!entry.name.startsWith(".") &&
				entry.name !== "node_modules"
			) {
				queue.push(fullPath);
			} else if (entry.name === "package.json") {
				const pkg = JSON.parse(readFileSync(fullPath, "utf8"));
				if (pkg.name && pkg.version) {
					packages.set(pkg.name, pkg.version);
				}
			}
		}
	}

	return packages;
};

/**
 * Finds workspace dependencies in package.json and their actual versions
 * @param {Object} pkg - Package.json contents
 * @param {Map<string,string>} workspaceVersions - Map of workspace package names to versions
 * @returns {Object[]} Array of workspace dependencies with actual versions
 */
export const findWorkspaceDependencies = (pkg, workspaceVersions) => {
	const deps = [];

	// Check dependencies
	if (pkg.dependencies) {
		for (const [name, version] of Object.entries(pkg.dependencies)) {
			if (version.startsWith("workspace:")) {
				const actualVersion = workspaceVersions.get(name);
				deps.push({
					name,
					type: "dependencies",
					version,
					actualVersion,
				});
			}
		}
	}

	// Check devDependencies
	if (pkg.devDependencies) {
		for (const [name, version] of Object.entries(pkg.devDependencies)) {
			if (version.startsWith("workspace:")) {
				const actualVersion = workspaceVersions.get(name);
				deps.push({
					name,
					type: "devDependencies",
					version,
					actualVersion,
				});
			}
		}
	}

	return deps;
};

/**
 * Updates workspace dependencies to exact versions
 * @param {Object} pkg - Package.json contents
 * @param {Object[]} workspaceDeps - Array of workspace dependencies with actual versions
 * @param {Object} logger - Semantic Release logger
 * @param {Object} config - Plugin configuration
 * @returns {boolean} Whether any changes were made
 */
export const updateToExactVersions = (pkg, workspaceDeps, logger, config) => {
	let changes = false;

	for (const dep of workspaceDeps) {
		const { name, type, actualVersion } = dep;

		// Skip devDependencies if replaceDevDeps is false
		if (type === "devDependencies" && config.replaceDevDeps === false) {
			continue;
		}

		const depSection = pkg[type];
		if (depSection?.[name] && actualVersion) {
			const oldVersion = depSection[name];
			depSection[name] = `^${actualVersion}`;
			changes = true;
			logger.log(
				`📦 Updated ${name} from ${oldVersion} to ^${actualVersion}`,
			);
		}
	}

	return changes;
};

/**
 * Reverts workspace dependencies to workspace versions
 * @param {Object} pkg - Package.json contents
 * @param {Object[]} workspaceDeps - Array of workspace dependencies
 * @param {Object} logger - Semantic Release logger
 * @returns {boolean} Whether any changes were made
 */
export const revertToWorkspaceVersions = (pkg, workspaceDeps, logger) => {
	let changes = false;

	for (const dep of workspaceDeps) {
		const { name, type } = dep;
		const depSection = pkg[type];

		if (depSection?.[name]) {
			const currentVersion = depSection[name];
			depSection[name] = "workspace:*";
			changes = true;
			logger.log(
				`📦 Reverted ${name} from ${currentVersion} to workspace:*`,
			);
		}
	}

	return changes;
};
