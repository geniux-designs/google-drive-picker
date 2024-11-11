import { defineConfig } from "tsup";

const config = defineConfig({
	clean: true,
	entry: ["src/index.ts"],
	tsconfig: "tsconfig.json",
	legacyOutput: false, // true will output folders like "esm",
	esbuildPlugins: [],
	format: ["cjs", "esm"],
	dts: true,
});

export default config;
