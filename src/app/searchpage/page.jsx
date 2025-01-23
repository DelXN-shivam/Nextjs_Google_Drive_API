'use client';

import React, { useState } from 'react';

const SearchPage = () => {
    const [year, setYear] = useState('');
    const [state, setState] = useState('');
    const [modelName, setModelName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!year || !state || !modelName) {
            setError('Please fill out all fields before searching.');
            return;
        }

        setError('');
        try {
            // Call the backend API to perform the search
            const response = await fetch('/api/search-drive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ year, state, modelName }),
            });

            const result = await response.json();
            console.log('API Response:', result); // Log the result here

            if (result.success) {
                setSearchResults(result.files);
            } else {
                setError(result.error || 'No matching files found.');
            }
        } catch (err) {
            console.error('Search failed:', err);
            setError('Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 sm:p-20">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
                Google Drive Search
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block font-semibold mb-2">Year</label>
                    <input
                        type="text"
                        placeholder="Enter Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-2">State</label>
                    <input
                        type="text"
                        placeholder="Enter State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-2">Model Name</label>
                    <input
                        type="text"
                        placeholder="Enter Model Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>
            <div className="text-center">
                <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
                >
                    Search
                </button>
            </div>
            {error && <p className="text-red-600 text-center mt-4">{error}</p>}
            {searchResults.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Search Results</h2>
                    <ul className="space-y-4">
                        {searchResults.map((file) => (
                            <li key={file.id} className="flex items-center justify-between bg-white p-4 shadow-md rounded">
                                <span>{file.name}</span>
                                <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Open
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
