import React from 'react';
import oauth2Client from '../../utils/google-auth';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

const FolderPage = async ({ params }) => {
    const { folderId } = await params; // Dynamic folder ID
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive('v3');
    let folderContents = [];

    try {
        // Fetch files and folders in the given folder
        const result = await drive.files.list({
            auth: oauth2Client,
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType, webViewLink)',
            pageSize: 50,
        });
        folderContents = result.data.files;
    } catch (error) {
        console.error('Error fetching folder contents:', error);
        return (
            <div className="flex justify-center w-full pt-10 font-bold text-red-600">
                Something went wrong! Please try again.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 sm:p-20">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
                Contents of Folder
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folderContents && folderContents.length > 0 ? (
                    folderContents.map((file) => (
                        <div
                            key={file.id}
                            className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500"
                        >
                            {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                <a
                                    href={`/drive/${file.id}`}
                                    className="text-lg font-semibold text-blue-600 hover:underline"
                                >
                                    📁 {file.name}
                                </a>
                            ) : (
                                <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-semibold text-gray-700 hover:text-blue-600 hover:underline transition"
                                >
                                    📄 {file.name}
                                </a>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600">No files or folders found in this folder.</p>
                )}
            </div>
        </div>
    );
};

export default FolderPage;

