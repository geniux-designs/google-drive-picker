import type { GoogleOAuthScope } from "../types";

/**
 * Options for initializing the Google Identity Services client.
 */
type InitializeGoogleIdentityServiceOptions = {
	clientId: string;
	scopes: GoogleOAuthScope[];
	callback: (token: string) => void;
};

/**
 * Initializes the Google Identity Services client for OAuth token handling.
 * @param options - Configuration options for initializing GIS, including clientId, scopes, and a callback for the token.
 */
const initializeGoogleIdentityService = (
	options: InitializeGoogleIdentityServiceOptions,
) => {
	const { clientId, scopes, callback } = options;

	if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
		console.error("Google Identity Services (GIS) is not available.");
		return;
	}

	const client = window.google.accounts.oauth2.initTokenClient({
		client_id: clientId,
		scope: scopes.join(" "), // Convert array to space-separated string
		callback: (response) => {
			if (response.access_token) {
				callback(response.access_token);
			} else {
				console.error("Failed to obtain access token.");
			}
		},
	});

	client.requestAccessToken();
};

export {
	initializeGoogleIdentityService,
	type InitializeGoogleIdentityServiceOptions,
};
