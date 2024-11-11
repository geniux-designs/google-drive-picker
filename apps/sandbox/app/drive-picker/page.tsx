import { GoogleDrivePickerProvider } from "@geniux/google-drive-picker-react";

import type { FC } from "react";
import { GoogleDriveClientTest } from "../../components/client/GoogleDrivePage";

const GoogleDrivePage: FC = () => {
	return (
		<GoogleDrivePickerProvider
			clientId={process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID!}
			apiKey={process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY!}
		>
			<GoogleDriveClientTest />
		</GoogleDrivePickerProvider>
	);
};

export default GoogleDrivePage;
