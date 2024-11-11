"use client";

import {
	useGoogleDrivePicker,
	useGoogleDrivePickerContext,
} from "@geniux/google-drive-picker-react";
import { useEffect } from "react";

const GoogleDriveClientTest = () => {
	const { openPicker, selectedFiles } = useGoogleDrivePicker({
		allowMultiSelect: true,
	});
	const { scriptsLoaded, loadError, reloadScripts } =
		useGoogleDrivePickerContext();

	useEffect(() => {
		console.log("selectedFiles", selectedFiles);
	}, [selectedFiles]);

	return (
		<div style={{ padding: "50px", textAlign: "center" }}>
			<h1>Google Drive Picker Integration</h1>

			{loadError && (
				<div style={{ color: "red", marginBottom: "20px" }}>
					<p>Error loading scripts: {loadError}</p>
					<button
						type="button"
						onClick={reloadScripts}
						style={{ padding: "10px 20px" }}
					>
						Retry
					</button>
				</div>
			)}

			{!scriptsLoaded && !loadError && <p>Loading Google scripts...</p>}

			{scriptsLoaded && !loadError && (
				<button
					type="button"
					onClick={openPicker}
					style={{ padding: "10px 20px" }}
				>
					Open Drive
				</button>
			)}

			{selectedFiles.length > 0 && (
				<div style={{ marginTop: "20px" }}>
					<h2>Selected Files:</h2>
					<ul>
						{selectedFiles.map((file, index) => (
							<li key={index}>
								<strong>{file.name}</strong> - ID: {file.id}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export { GoogleDriveClientTest };
