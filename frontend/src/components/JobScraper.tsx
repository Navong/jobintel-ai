import { useState } from "react";
import { useJobScraper } from "../api/useJobScraper";

const JobScraper = () => {
    const [url, setUrl] = useState("");
    const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile"); // Default model
    const { data: jobData, isLoading, error, refetch } = useJobScraper(url, selectedModel);

    const handleFetchJob = () => {
        if (url) refetch(); // Trigger the query with the selected model
    };

    return (
        <div className="max-w-2xl mx-auto p-6 border rounded shadow-lg">
            {/* <h2 className="text-xl font-bold mb-4">Job Scraper</h2> */}

            {/* Job Posting URL Input */}
            <input
                type="text"
                placeholder="Enter job posting URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            />

            {/* LLM Model Selector */}
            <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            >
                <option value="gemma2-9b-it">Gemma2-9B-IT</option>
                <option value="llama-3.3-70b-versatile">LLaMA 3.3 - 70B Versatile</option>
                <option value="llama3-70b-8192">LLaMA3-70B</option>
            </select>

            {/* Fetch Button */}
            <button
                onClick={handleFetchJob}
                disabled={!url}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {isLoading ? "Fetching..." : "Fetch Job Details"}
            </button>

            {/* Error Message */}
            {error && <p className="text-red-500 mt-4">Error: {error.message}</p>}

            {/* Display Job Details */}
            {jobData && (
                <div className="mt-6 p-4 border rounded bg-gray-100">
                    <h3 className="text-lg font-semibold">{jobData.job_title}</h3>

                    <p className="mt-2"><strong>Responsibilities:</strong></p>
                    <ul className="list-disc pl-6">
                        {jobData.responsibilities.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>

                    <p className="mt-2"><strong>Requirements:</strong></p>
                    <ul className="list-disc pl-6">
                        {jobData.requirements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>

                    {jobData.preferred_qualifications && (
                        <>
                            <p className="mt-2"><strong>Preferred Qualifications:</strong></p>
                            <ul className="list-disc pl-6">
                                {jobData.preferred_qualifications.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {jobData.benefits && (
                        <>
                            <p className="mt-2"><strong>Benefits:</strong></p>
                            <ul className="list-disc pl-6">
                                {jobData.benefits.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Apply Link */}
                    <p className="mt-4">
                        <strong>How to Apply:</strong> 
                        <a href={jobData.how_to_apply} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            Apply Here
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
};

export default JobScraper;