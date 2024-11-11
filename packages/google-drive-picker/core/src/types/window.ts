import type { GoogleTokenClient, GoogleTokenClientConfig } from "./identity";
import type { PickerBuilderConstructor } from "./picker";

declare global {
	interface Window {
		google?: {
			accounts?: {
				oauth2?: {
					initTokenClient: (
						config: GoogleTokenClientConfig,
					) => GoogleTokenClient;
				};
			};
			picker?: {
				PickerBuilder: PickerBuilderConstructor;
				Action: {
					PICKED: string;
					CANCEL: string;
				};
				ViewId: {
					DOCS: string;
					DOCS_IMAGES: string;
					DOCS_VIDEOS: string;
					SPREADSHEETS: string;
					PRESENTATIONS: string;
					FORMS: string;
					FOLDERS: string;
					PDFS: string;
				};
				Feature: {
					MULTISELECT_ENABLED: string;
					NAV_HIDDEN: string;
					SIMPLE_UPLOAD_ENABLED: string;
					MINE_ONLY: string;
					SELECTABLE_MIME_TYPES: string;
				};
			};
		};
	}
}
