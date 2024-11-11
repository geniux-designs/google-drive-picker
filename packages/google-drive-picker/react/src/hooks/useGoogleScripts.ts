import { useCallback, useEffect } from "react";
import type { ScriptConfig } from "../types";

/**
 * Base props for the useGoogleScripts hook.
 */
type UseGoogleScriptsProps = {
	scripts: ScriptConfig[];
	onSuccess: () => void;
	onError: (errorMessage: string) => void;
};

/**
 * Custom hook to dynamically load external Google scripts required for Google Drive Picker and GIS.
 * @param props - Configuration options, including the scripts to load, success callback, and error callback.
 * @returns An object with a `reloadScripts` function to reload scripts as needed.
 */
const useGoogleScripts = (props: UseGoogleScriptsProps) => {
	const { scripts, onSuccess, onError } = props;

	/**
	 * Injects a single script into the document.
	 * @param script - The script configuration object, specifying URL, async, and defer settings.
	 * @returns A promise resolving when the script is loaded or rejecting on error.
	 */
	const injectScript = useCallback((script: ScriptConfig): Promise<void> => {
		return new Promise((resolve, reject) => {
			// Ensure we're in the browser environment
			if (typeof window === "undefined") {
				reject(new Error("Cannot inject script on the server."));
				return;
			}

			// Check if the script is already present in the document
			if (document.getElementById(script.id)) {
				resolve();
				return;
			}

			const scriptElement = document.createElement("script");
			scriptElement.id = script.id;
			scriptElement.src = script.src;
			scriptElement.async = script.async ?? true;
			scriptElement.defer = script.defer ?? false;

			// Set additional attributes if provided
			if (script.attributes) {
				for (const [key, value] of Object.entries(script.attributes)) {
					scriptElement.setAttribute(key, value);
				}
			}

			scriptElement.onload = () => resolve();
			scriptElement.onerror = () =>
				reject(new Error(`Failed to load script ${script.src}`));

			document.body.appendChild(scriptElement);
		});
	}, []);

	/**
	 * Sequentially loads all specified scripts, invoking callbacks for success or error.
	 */
	const loadAllScripts = useCallback(async (): Promise<void> => {
		try {
			for (const script of scripts) {
				await injectScript(script);
			}
			onSuccess();
		} catch (error) {
			if (error instanceof Error) {
				onError(error.message);
			} else {
				onError("An unknown error occurred while loading scripts.");
			}
		}
	}, [injectScript, scripts, onSuccess, onError]);

	useEffect(() => {
		loadAllScripts();
	}, [loadAllScripts]);

	return { reloadScripts: loadAllScripts };
};

export { useGoogleScripts, type UseGoogleScriptsProps };
