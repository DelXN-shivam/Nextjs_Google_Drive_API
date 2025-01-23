import { google } from 'googleapis';
import oauth2Client from '../../utils/google-auth';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth'; // Install this package using `npm install mammoth`


async function getFolderId(drive, folderName, parentId = null) {
    try {
        const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}'${
            parentId ? ` and '${parentId}' in parents` : ''
        }`;

        const result = await drive.files.list({
            auth: oauth2Client,
            q: query,
            fields: 'files(id, name)',
        });

        console.log(`Folder search query: ${query}`);
        console.log('Folder search result:', result.data);  // Log the folder search result

        if (result.data.files.length === 0) {
            console.error(`Folder "${folderName}" not found.`);
            return null;
        }

        return result.data.files[0].id;
    } catch (error) {
        console.error(`Error fetching folder ID for "${folderName}":`, error.response?.data || error.message);
        throw new Error(`Failed to fetch folder ID: ${error.response?.data.error.message || error.message}`);
    }
}


export async function POST(req) {
    try {
        const { year, state, modelName } = await req.json();

        if (!year || !state || !modelName) {
            return new Response(
                JSON.stringify({ success: false, error: 'All fields are required.' }),
                { status: 400 }
            );
        }

        oauth2Client.setCredentials({
            access_token: req.cookies.get('google_access_token')?.value,
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Step 1: Get the ID of the "year" folder
        const yearFolderId = await getFolderId(drive, year, null);
        if (!yearFolderId) {
            return new Response(
                JSON.stringify({ success: false, error: `Year folder "${year}" not found.` }),
                { status: 404 }
            );
        }

        // Step 2: Get the ID of the "state" folder inside the "year" folder
        const stateFolderId = await getFolderId(drive, state, yearFolderId);
        if (!stateFolderId) {
            return new Response(
                JSON.stringify({ success: false, error: `State folder "${state}" not found in year folder "${year}".` }),
                { status: 404 }
            );
        }

        // Query files in the folder
        const query = `'${stateFolderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`;
        const result = await drive.files.list({
            q: query,
            fields: 'files(id, name, mimeType, webViewLink)',
        });

        const files = result.data.files || [];
        const matchingFiles = [];

        // Ensure the /tmp folder exists
        const tmpDir = path.join('D:', 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }

        // Step 3: Process files
        for (const file of files) {
            const { id, name, mimeType } = file;

            if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                try {
                    // Download DOCX file
                    const filePath = path.join(tmpDir, name);
                    const dest = fs.createWriteStream(filePath);

                    await new Promise((resolve, reject) => {
                        drive.files
                            .get({ fileId: id, alt: 'media' }, { responseType: 'stream' })
                            .then((res) => {
                                res.data
                                    .on('end', () => resolve())
                                    .on('error', (err) => reject(err))
                                    .pipe(dest);
                            });
                    });

                    // Read and search content using Mammoth
                    const content = await mammoth.extractRawText({ path: filePath });
                    if (content.value.includes(modelName)) {
                        matchingFiles.push(file);
                    }

                    // Clean up local file
                    fs.unlinkSync(filePath);
                } catch (error) {
                    console.error(`Error processing DOCX file "${name}":`, error.message);
                }
            } else {
                console.log(`Skipping unsupported file type: ${name} (${mimeType})`);
            }
        }

        return new Response(JSON.stringify({ success: true, files: matchingFiles }), { status: 200 });
    } catch (error) {
        console.error('Error during processing:', error.message);
        return new Response(
            JSON.stringify({ success: false, error: 'Something went wrong during the search.' }),
            { status: 500 }
        );
    }
}

