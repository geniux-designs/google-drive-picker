import {
	type GoogleDriveFile,
	type GoogleDrivePickerConfig,
	createPicker,
	initializeGoogleIdentityService,
} from "@geniux/google-drive-picker-core";
import { useState } from "react";
import { useGoogleDrivePickerContext } from "../components";

type UseGoogleDrivePickerResult = {
	openPicker: () => void;
	selectedFiles: GoogleDriveFile[];
};

/**
 * Custom hook for opening the Google Drive Picker.
 * @param config - Configuration options for the Google Drive Picker, such as multi-select, view type, and scopes.
 * @returns An object with `openPicker` to open the Picker and `selectedFiles` containing selected file data.
 */
const useGoogleDrivePicker = (
	config: GoogleDrivePickerConfig = {},
): UseGoogleDrivePickerResult => {
	const { scriptsLoaded, clientId, apiKey } = useGoogleDrivePickerContext();
	const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([]);

	const openPicker = () => {
		if (!scriptsLoaded) {
			console.error("Google scripts are not fully loaded.");
			return;
		}

		initializeGoogleIdentityService({
			clientId,
			scopes: config.scopes || [
				"https://www.googleapis.com/auth/drive.file",
			],
			callback: (oauthToken) => {
				createPicker({
					oauthToken,
					apiKey,
					config,
					setSelectedFiles,
				});
			},
		});
	};

	return { openPicker, selectedFiles };
};

export { useGoogleDrivePicker, type UseGoogleDrivePickerResult };
