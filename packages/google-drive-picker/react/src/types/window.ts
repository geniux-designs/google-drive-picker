declare global {
	interface Window {
		gapi?: {
			load: (name: string, callback: () => void) => void;
			client: {
				init: (args: {
					apiKey: string;
					clientId: string;
					scope: string;
				}) => Promise<void>;
			};
		};
	}
}
