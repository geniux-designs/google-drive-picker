/**
 * Type representing a selected Google Drive file.
 */
export type GoogleDriveFile = {
	id: string;
	serviceId: string;
	mimeType: string;
	name: string;
	description?: string;
	type: string;
	lastEditedUtc: number;
	iconUrl: string;
	url: string;
	embedUrl: string;
	sizeBytes: number;
	isShared: boolean;
};

/**
 * Configuration for initializing the Google Drive Picker, with options for view type and multi-select.
 */
export type GoogleDrivePickerConfig = {
	allowMultiSelect?: boolean;
	viewId?: GoogleDrivePickerViewId;
	scopes?: GoogleDriveScope[];
};

/**
 * Available view types for the Google Drive Picker.
 */
export type GoogleDrivePickerViewId =
	| "DOCS"
	| "DOCS_IMAGES"
	| "DOCS_VIDEOS"
	| "SPREADSHEETS"
	| "PRESENTATIONS"
	| "FORMS"
	| "FOLDERS"
	| "PDFS";

/**
 * Enum representing the available scopes for the Google Drive API. (v3)
 */
export type GoogleDriveScope =
	| "https://www.googleapis.com/auth/drive" // Full access to all Google Drive files
	| "https://www.googleapis.com/auth/drive.appdata" // Access to app-specific configuration data in Google Drive
	| "https://www.googleapis.com/auth/drive.apps.readonly" // View Google Drive apps
	| "https://www.googleapis.com/auth/drive.file" // Limited access to the files the app uses or creates
	| "https://www.googleapis.com/auth/drive.meet.readonly" // Access to files created or edited by Google Meet
	| "https://www.googleapis.com/auth/drive.metadata" // Manage metadata for files in Google Drive
	| "https://www.googleapis.com/auth/drive.metadata.readonly" // Read-only access to file metadata in Google Drive
	| "https://www.googleapis.com/auth/drive.photos.readonly" // Read-only access to photos, videos, and albums in Google Photos
	| "https://www.googleapis.com/auth/drive.readonly" // Read-only access to all Google Drive files
	| "https://www.googleapis.com/auth/drive.scripts"; // Manage Google Apps Script

// Interface representing the PickerBuilder instance
export interface PickerBuilder {
	addView: (viewId: string) => PickerBuilder;
	setOAuthToken: (token: string) => PickerBuilder;
	setDeveloperKey: (apiKey: string) => PickerBuilder;
	setCallback: (
		callback: (data: PickerCallbackData) => void,
	) => PickerBuilder;
	enableFeature: (feature: string) => PickerBuilder;
	build: () => {
		setVisible: (visible: boolean) => void;
	};
}

export type PickerCallbackData = {
	action?: string; // This remains string-typed until further refinement
	docs: Array<GoogleDriveFile>;
};

// Type for the PickerBuilder constructor
export type PickerBuilderConstructor = new () => PickerBuilder;
