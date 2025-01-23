import React from 'react';
import oauth2Client from '../utils/google-auth';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import SearchPage from '../searchpage/page';

const page = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive('v3');
    let allFilesAndFolders = [];

    try {
        const result = await drive.files.list({
            auth: oauth2Client,
            q: "'root' in parents", // Fetch only files and folders in the root directory
            fields: 'files(id, name, mimeType, webViewLink)',
            pageSize: 20,
        });
        allFilesAndFolders = result.data.files;
    } catch (error) {
        console.error('Error fetching files:', error);
        return (
            <div className="flex justify-center w-full pt-10 font-bold text-red-600">
                Something went wrong! Please login again.
            </div>
        );
    }

    // Group files and folders by their type (extension for files)
    const groupedFiles = allFilesAndFolders.reduce((acc, file) => {
        const key = file.mimeType === 'application/vnd.google-apps.folder' ? 'folders' : file.name.split('.').pop().toLowerCase();
        if (!acc[key]) acc[key] = [];
        acc[key].push(file);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 p-8 sm:p-20">
            <SearchPage />
            <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
                Google Drive Files and Folders
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedFiles && Object.keys(groupedFiles).length > 0 ? (
                    Object.keys(groupedFiles).map((key) => (
                        <div
                            key={key}
                            className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500"
                        >
                            <h2 className="text-lg font-semibold text-blue-600 mb-4">
                                {key === 'folders' ? 'Folders' : `${key.toUpperCase()} Files`}
                            </h2>
                            <ul className="space-y-2">
                                {groupedFiles[key].map((file) => (
                                    <li key={file.id}>
                                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                            <a
                                                href={`/drive/${file.id}`}
                                                className="text-gray-700 hover:text-blue-600 hover:underline transition"
                                            >
                                                📁 {file.name}
                                            </a>
                                        ) : (
                                            <a
                                                href={file.webViewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-700 hover:text-blue-600 hover:underline transition"
                                            >
                                                📄 {file.name}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600">
                        No files or folders found in Google Drive.
                    </p>
                )}
            </div>
        </div>
    );
};

export default page;






// import React from 'react';
// import oauth2Client from '../utils/google-auth';
// import { cookies } from 'next/headers';
// import { google } from 'googleapis';

// const page = async () => {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("google_access_token")?.value;
//     oauth2Client.setCredentials({ access_token: accessToken });

//     let files;

//     const drive = google.drive('v3');

//     try {
//         const result = await drive.files.list({
//             auth: oauth2Client,
//             q: "'root' in parents", // Fetch only items in the root folder
//             fields: 'files(id, name, mimeType, webViewLink)',
//             pageSize: 20,
//         });
//         files = result.data.files;
//     } catch (error) {
//         console.log(error);
//         return (
//             <div className="flex justify-center w-full pt-10 font-bold text-red-600">
//                 Something went wrong! Please login again.
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 p-8 sm:p-20">
//             <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
//                 Google Drive Files and Folders
//             </h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {files && files.length > 0 ? (
//                     files.map((file) => (
//                         <div
//                             key={file.id}
//                             className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500"
//                         >
//                             {file.mimeType === 'application/vnd.google-apps.folder' ? (
//                                 <a
//                                     href={`/drive/${file.id}`} // Navigate to the folder page
//                                     className="text-gray-700 hover:text-blue-600 hover:underline transition"
//                                 >
//                                     📁 {file.name}
//                                 </a>
//                             ) : (
//                                 <a
//                                     href={file.webViewLink}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-gray-700 hover:text-blue-600 hover:underline transition"
//                                 >
//                                     📄 {file.name}
//                                 </a>
//                             )}
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-center text-gray-600">
//                         No files or folders found in Google Drive.
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default page;




// import React from 'react';
// import oauth2Client from '../utils/google-auth';
// import { cookies } from 'next/headers';
// import { google } from 'googleapis';
// import Uploadpage from '../uploadpage/page';
// import DrivePage from '../drivepage/page';
// import FolderPage from '../drive/[folderId]/page';

// const page = async () => {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("google_access_token")?.value;
//     oauth2Client.setCredentials({ access_token: accessToken });

//     let files;

//     const drive = google.drive('v3');

//     try {
//         const result = await drive.files.list({
//             auth: oauth2Client,
//             'fields': 'nextPageToken, files(id, name, mimeType, webViewLink)',
//             'pageSize': 20,
//         });
//         files = result.data.files;
//     } catch (error) {
//         console.log(error);
//         return (
//             <div className="flex justify-center w-full pt-10 font-bold text-red-600">
//                 Something went wrong! Please login again.
//             </div>
//         );
//     }

//     // Group files by extensions
//     const groupedFiles = files?.reduce((acc, file) => {
//         const extension = file.name.split('.').pop().toLowerCase();
//         if (!acc[extension]) acc[extension] = [];
//         acc[extension].push(file);
//         return acc;
//     }, {});

//     return (
        
//         <div className="min-h-screen bg-gray-50 p-8 sm:p-20">
//             {/* <div className="mb-10 flex justify-center">
//                 <Uploadpage />
//             </div> */}
//             <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
//                 Google Drive Files (Grouped by Extensions)
//             </h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {groupedFiles && Object.keys(groupedFiles).length > 0 ? (
//                     Object.keys(groupedFiles).map((extension) => (
//                         <div
//                             key={extension}
//                             className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500"
//                         >
//                             <h2 className="text-lg font-semibold text-blue-600 mb-4">
//                                 {extension.toUpperCase()} Files
//                             </h2>
//                             <ul className="space-y-2">
//                                 {groupedFiles[extension].map((file) => (
//                                     <li key={file.id}>
//                                         <a
//                                             href={file.webViewLink}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-gray-700 hover:text-blue-600 hover:underline transition"
//                                         >
//                                             {file.name}
//                                         </a>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-center text-gray-600">
//                         No files found in Google Drive.
//                     </p>
//                 )}
//             </div>
//             {/* <FolderPage /> */}
            
//         </div>
//     );
// };

// export default page;




// import React from 'react';
// import oauth2Client from '../utils/google-auth';
// import { cookies } from 'next/headers';
// import { google } from 'googleapis';
// import Uploadpage from '../uploadpage/page';

// const page = async () => {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("google_access_token")?.value;
//     oauth2Client.setCredentials({ access_token: accessToken });

//     let files;

//     const drive = google.drive('v3');

//     try {
//         const result = await drive.files.list({
//             auth: oauth2Client,
//             'fields': 'nextPageToken, files(id, name, mimeType)',
//             'pageSize': 20,
//         });
//         files = result.data.files;
//     } catch (error) {
//         console.log(error);
//         return (
//             <div className='justify-center w-full flex text-center pt-10 font-bold'>
//                 Something went wrong! Please login again!
//             </div>
//         );
//     }

//     // Group files by extensions
//     const groupedFiles = files?.reduce((acc, file) => {
//         const extension = file.name.split('.').pop().toLowerCase(); // Get the file extension
//         if (!acc[extension]) acc[extension] = []; // Initialize the group if not already present
//         acc[extension].push(file); // Add the file to the group
//         return acc;
//     }, {});

//     return (
//         <div className="grid grid-rows-[20px_1fr_20px] justify-items-center pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//             <h1 className="text-lg font-bold mb-4">Google Drive Files (Grouped by Extensions)</h1>
//             <div className="w-full flex flex-col gap-8">
//                 {groupedFiles && Object.keys(groupedFiles).length > 0 ? (
//                     Object.keys(groupedFiles).map((extension) => (
//                         <div key={extension} className="mb-4">
//                             <h2 className="text-md font-semibold mb-2">
//                                 {extension.toUpperCase()} Files
//                             </h2>
//                             <ul className="pl-4 list-disc">
//                                 {groupedFiles[extension].map((file) => (
//                                     <li key={file.id}>{file.name}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No files found in Google Drive.</p>
//                 )}
//             </div>
//             <div>
//                 <Uploadpage />
//             </div>
//         </div>
//     );
// };

// export default page;




// import React from 'react';
// import oauth2Client from '../utils/google-auth';
// import { cookies } from 'next/headers';
// import { google } from 'googleapis';
// import Uploadpage from '../uploadpage/page';

// const page = async () => {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("google_access_token")?.value;
//     oauth2Client.setCredentials({ access_token: accessToken });

//     let files;

//     const drive = google.drive('v3');

//     try {
//         const result = await drive.files.list({
//             auth: oauth2Client,
//             'fields': 'nextPageToken, files(id, name, mimeType)',
//             'pageSize': 5,
//         });
//         files = result.data.files;
//     } catch (error) {
//         console.log(error);
//         <div className='justify-center w-full flex text-center pt-10 font-bold'>
//             Something went wrong! Please login again!
//         </div>
//     }


//     return (
//         <div className="grid grid-rows-[20px_1fr_20px] justify-items-center pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//             <h1 className='text-lg font-bold'>Google Drive Files</h1>
//             <ul>
//                 {/* {files.map((file, index) => (
//                     <li key={index}></li>
//                 ))} */}
//                 {files?.map((file, index) => (
//                     <li key={file.id}>{file.name}</li>
//                 ))}
//             </ul>
//             <div>
//                 <Uploadpage />
//             </div>
//         </div>
//     )
// }

// export default page