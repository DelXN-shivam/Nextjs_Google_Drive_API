import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import oauth2Client from '@/app/utils/google-auth';

export async function POST(request) {
    try {
        const { fileName, fileContent, mimeType } = await request.json();

        // Retrieve the access token from cookies or headers
        const accessToken = request.cookies.get("google_access_token")?.value;
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Create file metadata
        const fileMetadata = { name: fileName };

        // Convert Base64 file content into a readable stream
        const buffer = Buffer.from(fileContent, 'base64');
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null); // Signal the end of the stream

        // Define media with the readable stream
        const media = {
            mimeType: mimeType,
            body: readableStream,
        };

        // Upload file to Google Drive
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id', // Return only the file ID
        });

        return NextResponse.json({ success: true, fileId: response.data.id });
    } catch (error) {
        console.error('Error uploading file:', error.response?.data || error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}
