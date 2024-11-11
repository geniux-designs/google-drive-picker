import type { GoogleTokenClient, GoogleTokenClientConfig } from "./identity";

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
		};
	}
}
