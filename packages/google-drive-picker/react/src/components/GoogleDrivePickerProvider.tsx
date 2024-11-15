"use client";

import {
	type FC,
	type ReactNode,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";
import { useGoogleScripts } from "../hooks";
import type { ScriptConfig } from "../types";

/**
 * Props for GoogleDrivePickerProvider, including clientId and apiKey for Google API configuration.
 */
type GoogleDrivePickerProviderProps = {
	children: ReactNode;
	clientId: string;
	apiKey: string;
};

/**
 * Configuration for Google scripts to be loaded by `useGoogleScripts`.
 */
const googleScripts: ScriptConfig[] = [
	{
		id: "gapi",
		src: "https://apis.google.com/js/api.js",
		async: true,
		defer: true,
	},
	{
		id: "gis",
		src: "https://accounts.google.com/gsi/client",
		async: true,
		defer: true,
	},
	{
		id: "picker",
		src: "https://apis.google.com/js/platform.js",
		async: true,
		defer: true,
	},
];

/**
 * Context value type for GoogleDrivePicker, including states for script loading and error handling.
 */
type GoogleDrivePickerContextType = {
	scriptsLoaded: boolean;
	loadError: string | null;
	reloadScripts: () => void;
	clientId: string;
	apiKey: string;
};

const GoogleDrivePickerContext = createContext<
	GoogleDrivePickerContextType | undefined
>(undefined);

/**
 * Provider component that wraps the application and provides Google Drive Picker context.
 * Manages `scriptsLoaded` and `loadError` states, initializes Google Picker API if loaded,
 * and accepts `clientId` and `apiKey` as props to configure the Google API.
 *
 * @param props - The provider's props containing children, clientId, and apiKey.
 * @returns The context provider component.
 */
const GoogleDrivePickerProvider: FC<GoogleDrivePickerProviderProps> = ({
	children,
	clientId,
	apiKey,
}) => {
	const [scriptsLoaded, setScriptsLoaded] = useState<boolean>(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	/**
	 * Callback for successfully loading all Google scripts.
	 * Initializes Google Picker API when `gapi` is available.
	 */
	const handleScriptsSuccess = () => {
		setScriptsLoaded(true);
		setLoadError(null);
		if (window.gapi) {
			window.gapi.load("client:picker", () => {});
		}
	};

	/**
	 * Callback for handling script loading errors.
	 * Sets the error message for troubleshooting.
	 * @param errorMessage - The error message from the failed script load.
	 */
	const handleScriptsError = (errorMessage: string) => {
		setLoadError(errorMessage);
		setScriptsLoaded(false);
	};

	// Load Google scripts using `useGoogleScripts` and manage reload functionality.
	const { reloadScripts } = useGoogleScripts({
		scripts: googleScripts,
		onSuccess: handleScriptsSuccess,
		onError: handleScriptsError,
	});

	const contextValue = useMemo(
		() => ({
			scriptsLoaded,
			loadError,
			reloadScripts,
			clientId,
			apiKey,
		}),
		[scriptsLoaded, loadError, reloadScripts, clientId, apiKey],
	);

	return (
		<GoogleDrivePickerContext.Provider value={contextValue}>
			{children}
		</GoogleDrivePickerContext.Provider>
	);
};

/**
 * Custom hook to use the GoogleDrivePickerContext.
 * @returns The context value, including `scriptsLoaded`, `loadError`, `reloadScripts`, `clientId`, and `apiKey`.
 * @throws Error if used outside GoogleDrivePickerProvider.
 */
const useGoogleDrivePickerContext = (): GoogleDrivePickerContextType => {
	const context = useContext(GoogleDrivePickerContext);
	if (!context) {
		throw new Error(
			"useGoogleDrivePickerContext must be used within a GoogleDrivePickerProvider",
		);
	}
	return context;
};

export { GoogleDrivePickerProvider, useGoogleDrivePickerContext };
