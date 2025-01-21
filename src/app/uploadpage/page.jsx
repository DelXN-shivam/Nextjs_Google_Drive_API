'use client';

import React, { useState } from 'react';

const UploadPage = () => {
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('');

        const reader = new FileReader();
        reader.onload = async () => {
            const base64Data = reader.result.split(',')[1];

            try {
                const response = await fetch('/api/upload-to-drive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileContent: base64Data,
                        mimeType: file.type,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    window.location.reload();
                    setUploadStatus(
                        `✅ File uploaded successfully! File ID: ${result.fileId}`
                    );
                } else {
                    setUploadStatus(`❌ Error uploading file: ${result.error}`);
                }
            } catch (error) {
                setUploadStatus(`❌ An error occurred: ${error.message}`);
            } finally {
                setIsUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Upload File to Google Drive
            </h1>
            <label
                htmlFor="file-upload"
                className="cursor-pointer px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition mb-4"
            >
                {isUploading ? 'Uploading...' : 'Choose File'}
            </label>
            <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                className="hidden"
            />
            {uploadStatus && (
                <p
                    className={`mt-4 text-center ${
                        uploadStatus.startsWith('✅')
                            ? 'text-green-600'
                            : 'text-red-600'
                    }`}
                >
                    {uploadStatus}
                </p>
            )}
        </div>
    );
};

export default UploadPage;



// 'use client';

// import React, { useState } from 'react';

// const Uploadpage = () => {
//     const [files, setFiles] = useState([]);
//     const [uploadStatus, setUploadStatus] = useState('');

//     const handleFileUpload = async (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = async () => {
//             const base64Data = reader.result.split(',')[1];

//             const response = await fetch('/api/upload-to-drive', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     fileName: file.name,
//                     fileContent: base64Data,
//                     mimeType: file.type,
//                 }),
//             });

//             const result = await response.json();
//             if (result.success) {
//                 setUploadStatus(`File uploaded successfully! File ID: ${result.fileId}`);
//             } else {
//                 setUploadStatus(`Failed to upload file: ${result.error}`);
//             }
//         };

//         reader.readAsDataURL(file);
//     };

//     return (
//         <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
//             <h1 className="text-lg font-bold">Google Drive Files</h1>
//             <ul>
//                 {files?.map((file) => (
//                     <li key={file.id}>{file.name}</li>
//                 ))}
//             </ul>

//             <div>
//                 <input type="file" onChange={handleFileUpload} />
//                 {uploadStatus && <p className="text-green-600 mt-2">{uploadStatus}</p>}
//             </div>
//         </div>
//     );
// };

// export default Uploadpage;

