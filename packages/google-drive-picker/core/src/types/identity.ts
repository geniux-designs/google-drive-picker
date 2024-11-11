/**
 * Configuration for initializing the Google OAuth token client.
 * Specifies the client ID, OAuth scope, and callback to handle the token response.
 */
export type GoogleTokenClientConfig = {
	/** The OAuth 2.0 client ID from Google Cloud Console */
	client_id: string;
	/** OAuth scope defining the access level for the token */
	scope: string;
	/** Callback function to handle the response, containing the access token if successful */
	callback: (response: { access_token?: string }) => void;
};

/**
 * Interface for the Google OAuth token client.
 * Provides a method to request an access token for the configured client and scope.
 */
export type GoogleTokenClient = {
	/** Requests an access token using the configuration provided in `GoogleTokenClientConfig` */
	requestAccessToken: () => void;
};

export type GoogleOAuthScope = string;
