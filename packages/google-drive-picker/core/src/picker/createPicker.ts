import type {
	GoogleDriveFile,
	GoogleDrivePickerConfig,
	PickerCallbackData,
} from "../types";

/**
 * Options required to create and display the Google Drive Picker.
 */
type CreatePickerOptions = {
	/** The OAuth token for authentication */
	oauthToken: string;
	/** The Google API key */
	apiKey: string;
	/** Picker configuration, including view ID and multi-select option */
	config: GoogleDrivePickerConfig;
	/** Function to update selected files state */
	setSelectedFiles: (files: GoogleDriveFile[]) => void;
};

/**
 * Creates and displays the Google Drive Picker.
 * @param options - The options required to configure and display the Picker.
 */
const createPicker = (options: CreatePickerOptions) => {
	const { oauthToken, apiKey, config, setSelectedFiles } = options;
	if (!window.google?.picker) {
		console.error("Google Picker API is not available");
		return;
	}

	const pickerBuilder = new window.google.picker.PickerBuilder()
		.addView(
			config.viewId
				? window.google.picker.ViewId[config.viewId]
				: window.google.picker.ViewId.DOCS,
		)
		.setOAuthToken(oauthToken)
		.setDeveloperKey(apiKey)
		.setCallback((data: PickerCallbackData) => {
			if (data.action === window.google?.picker?.Action?.PICKED) {
				const files = data.docs.map(
					(doc): GoogleDriveFile => ({
						id: doc.id,
						serviceId: doc.serviceId,
						mimeType: doc.mimeType,
						name: doc.name,
						description: doc.description || "",
						type: doc.type,
						lastEditedUtc: doc.lastEditedUtc,
						iconUrl: doc.iconUrl,
						url: doc.url,
						embedUrl: doc.embedUrl,
						sizeBytes: doc.sizeBytes,
						isShared: doc.isShared,
					}),
				);
				setSelectedFiles(files);
			}
		});

	if (config.allowMultiSelect) {
		pickerBuilder.enableFeature(
			window.google.picker.Feature.MULTISELECT_ENABLED,
		);
	}

	pickerBuilder.build().setVisible(true);
};

export { createPicker, type CreatePickerOptions };
