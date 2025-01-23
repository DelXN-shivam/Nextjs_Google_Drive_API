import React from 'react';
import oauth2Client from '../utils/google-auth';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import Link from 'next/link';

const DrivePage = async ({ params }) => {
    const folderId = params?.folderId || 'root'; // Default to the root folder if no folder ID is provided
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive('v3');
    let files;

    try {
        const result = await drive.files.list({
            auth: oauth2Client,
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType, webViewLink)',
            pageSize: 20,
        });
        files = result.data.files;
    } catch (error) {
        console.error(error);
        return (
            <div className="justify-center w-full flex text-center pt-10 font-bold">
                Something went wrong! Please login again!
            </div>
        );
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] justify-items-center pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-lg font-bold mb-4">Google Drive Files</h1>
            <div className="w-full flex flex-col gap-8">
                {files?.length > 0 ? (
                    files.map((file) => (
                        <div key={file.id} className="flex items-center mb-2">
                            {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                <Link
                                    href={`/drive/${file.id}`}
                                    className="text-blue-600 hover:underline font-semibold"
                                >
                                    📁 {file.name}
                                </Link>
                            ) : (
                                <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-semibold"
                                >
                                    📄 {file.name}
                                </a>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No files or folders found in this directory.</p>
                )}
            </div>
        </div>
    );
};

export default DrivePage;
