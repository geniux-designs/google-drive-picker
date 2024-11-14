const fs = require('fs');
const path = require('path');
const SemanticReleaseError = require('@semantic-release/error');

// Default configuration
const DEFAULT_CONFIG = {
  replaceDevDeps: false
};

// Store analysis results for use across plugin lifecycle
let analysisState = {
  workspaceDeps: null,
  packageJson: null,
  pkgJsonPath: null,
  workspaceRoot: null,
  config: DEFAULT_CONFIG
};

const findWorkspaceRoot = (currentDir) => {
  let rootDir = currentDir;
  while (rootDir !== '/' && !fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml'))) {
    rootDir = path.dirname(rootDir);
  }
  
  if (rootDir === '/') {
    throw new Error('Could not find workspace root (pnpm-workspace.yaml)');
  }
  
  return rootDir;
};

const findWorkspacePackages = (workspaceRoot, logger) => {
  const packages = new Map(); // name -> {version, path}
  
  const scanDirectory = (dir) => {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // Skip node_modules and hidden directories
      if (item === 'node_modules' || item.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const pkgJsonPath = path.join(fullPath, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            // Only include packages that are in our workspace (relative to workspaceRoot)
            if (pkg.name && fullPath.startsWith(path.join(workspaceRoot, 'packages'))) {
              logger.log(`  📦 Found workspace package: ${pkg.name} (${pkg.version || 'unknown'})`);
              packages.set(pkg.name, {
                version: pkg.version || 'unknown',
                path: pkgJsonPath
              });
            }
          } catch (error) {
            logger.log(`  ⚠️ Error reading package.json at ${pkgJsonPath}: ${error.message}`);
          }
        }
        // Continue scanning subdirectories only if we're still in the packages directory
        if (fullPath.startsWith(path.join(workspaceRoot, 'packages'))) {
          scanDirectory(fullPath);
        }
      }
    }
  };

  // Only scan the packages directory
  const packagesDir = path.join(workspaceRoot, 'packages');
  if (fs.existsSync(packagesDir)) {
    logger.log('🔍 Scanning workspace packages directory...');
    scanDirectory(packagesDir);
  } else {
    logger.log('⚠️ No packages directory found in workspace');
  }

  return packages;
};

const findWorkspaceDependencies = (packageJsonPath, workspacePackages, config, logger) => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const workspaceDeps = [];

    logger.log('📦 Analyzing package:', packageJson.name);
    logger.log('⚙️ Plugin config:', JSON.stringify(config, null, 2));
    
    // Always check regular dependencies
    const deps = packageJson.dependencies;
    if (deps) {
      logger.log('🔍 Checking dependencies...');
      for (const [name, version] of Object.entries(deps)) {
        if (version === 'workspace:*') {
          const pkgInfo = workspacePackages.get(name);
          if (pkgInfo) {
            logger.log(`  ✅ Found workspace dependency: ${name} in dependencies (current version: ${pkgInfo.version})`);
            workspaceDeps.push({ 
              name, 
              type: 'dependencies', 
              currentVersion: version,
              actualVersion: pkgInfo.version,
              packagePath: pkgInfo.path
            });
          } else {
            logger.log(`  ⚠️ Workspace dependency ${name} declared but not found in workspace`);
          }
        }
      }
    }

    // Only check devDependencies if replaceDevDeps is true
    if (config.replaceDevDeps) {
      const devDeps = packageJson.devDependencies;
      if (devDeps) {
        logger.log('🔍 Checking devDependencies...');
        for (const [name, version] of Object.entries(devDeps)) {
          if (version === 'workspace:*') {
            const pkgInfo = workspacePackages.get(name);
            if (pkgInfo) {
              logger.log(`  ✅ Found workspace dependency: ${name} in devDependencies (current version: ${pkgInfo.version})`);
              workspaceDeps.push({ 
                name, 
                type: 'devDependencies', 
                currentVersion: version,
                actualVersion: pkgInfo.version,
                packagePath: pkgInfo.path
              });
            } else {
              logger.log(`  ⚠️ Workspace dependency ${name} declared but not found in workspace`);
            }
          }
        }
      }
    } else {
      logger.log('ℹ️ Skipping devDependencies (replaceDevDeps is false)');
    }

    return { workspaceDeps, packageJson };
  } catch (error) {
    throw new SemanticReleaseError(
      'Error analyzing workspace dependencies',
      'EANALYSIS',
      error.message
    );
  }
};

let plugin = {
  verifyConditions: async (pluginConfig, context) => {
    const { logger, options } = context;
    logger.log('🚀 semantic-release-bumper-plugin starting up');
    
    // Merge default config with plugin config
    const config = { ...DEFAULT_CONFIG, ...pluginConfig };
    analysisState.config = config;
    
    logger.log('📋 Plugin configuration:', JSON.stringify(config, null, 2));
    logger.log('🔧 Running in dry-run mode:', !!options.dryRun);

    try {
      // Find workspace root and scan for packages
      logger.log('📦 Starting workspace dependency analysis');
      analysisState.pkgJsonPath = path.join(process.cwd(), 'package.json');
      analysisState.workspaceRoot = findWorkspaceRoot(process.cwd());
      logger.log('📂 Found workspace root:', analysisState.workspaceRoot);
      
      // Scan for all workspace packages
      const workspacePackages = findWorkspacePackages(analysisState.workspaceRoot, logger);
      
      // Analyze dependencies
      const { workspaceDeps, packageJson } = findWorkspaceDependencies(
        analysisState.pkgJsonPath, 
        workspacePackages,
        config,
        logger
      );
      
      analysisState.workspaceDeps = workspaceDeps;
      analysisState.packageJson = packageJson;
      
      if (workspaceDeps.length > 0) {
        logger.log('✅ Found workspace dependencies:', JSON.stringify(workspaceDeps, null, 2));
        logger.log('📋 Dependencies that will be updated:');
        for (const dep of workspaceDeps) {
          logger.log(`  - ${dep.name} (${dep.type}): ${dep.actualVersion} → [next version]`);
        }
      } else {
        logger.log('ℹ️ No workspace dependencies found to update');
      }
    } catch (error) {
      throw new SemanticReleaseError(
        'Error in verifyConditions step',
        'EVERIFY',
        error.message
      );
    }
  },

  analyzeCommits: async (config, context) => {
    const { logger } = context;
    logger.log('📊 Analyzing commits in bumper plugin');
    return null;
  },

  generateNotes: async (config, context) => {
    const { logger, nextRelease } = context;
    logger.log('📝 Generating notes in bumper plugin');
    
    if (analysisState.workspaceDeps?.length > 0) {
      logger.log('📋 Workspace dependency updates for version', nextRelease?.version);
      for (const dep of analysisState.workspaceDeps) {
        logger.log(`  - ${dep.name} (${dep.type}): ${dep.actualVersion} → ${nextRelease?.version}`);
      }
    }
    
    return null;
  },

  prepare: async (config, context) => {
    const { logger, nextRelease, options } = context;
    
    if (!nextRelease || !analysisState.workspaceDeps) {
      logger.log('⚠️ No release planned or no dependencies to update');
      return;
    }

    if (!options.dryRun && analysisState.workspaceDeps.length > 0) {
      logger.log('🔄 Updating dependencies to version:', nextRelease.version);
      try {
        const updatedPkg = { ...analysisState.packageJson };
        let changes = false;

        for (const dep of analysisState.workspaceDeps) {
          const depSection = updatedPkg[dep.type];
          if (depSection && depSection[dep.name]) {
            depSection[dep.name] = nextRelease.version;
            changes = true;
            logger.log(`  ✅ Updated ${dep.name} in ${dep.type} from ${dep.actualVersion} to ${nextRelease.version}`);
          }
        }

        if (changes) {
          fs.writeFileSync(analysisState.pkgJsonPath, JSON.stringify(updatedPkg, null, 2) + '\n');
          logger.log('💾 Successfully wrote updates to package.json');
        }
      } catch (error) {
        throw new SemanticReleaseError(
          'Error updating dependencies',
          'EUPDATE',
          error.message
        );
      }
    }
  },

  publish: async (config, context) => {
    const { logger, nextRelease } = context;
    logger.log('🚀 Publish step starting');
    logger.log('📌 Next release version:', nextRelease?.version);
    return null;
  },

  success: async (config, context) => {
    const { logger, nextRelease } = context;
    logger.log('✨ Success step - release completed');
    logger.log('📌 Released version:', nextRelease?.version);
    
    // Clear analysis state after successful release
    analysisState = {
      workspaceDeps: null,
      packageJson: null,
      pkgJsonPath: null,
      workspaceRoot: null,
      config: DEFAULT_CONFIG
    };
  },

  fail: async (config, context) => {
    const { logger, errors } = context;
    logger.log('❌ Release failed');
    logger.log('Error details:', errors);
    
    // Clear analysis state on failure
    analysisState = {
      workspaceDeps: null,
      packageJson: null,
      pkgJsonPath: null,
      workspaceRoot: null,
      config: DEFAULT_CONFIG
    };
  }
};

module.exports = plugin;
