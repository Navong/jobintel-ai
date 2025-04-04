import { useState } from "react";
import { useJobScraper } from "../api/useJobScraper";

const SkeletonLoader = () => (
    <div className="mt-6 p-4 border rounded bg-gray-100 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>

        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <ul className="space-y-2">
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
        </ul>

        <div className="h-4 bg-gray-300 rounded w-1/2 mt-4 mb-2"></div>
        <ul className="space-y-2">
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
        </ul>

        <div className="h-4 bg-gray-300 rounded w-1/2 mt-4 mb-2"></div>
        <ul className="space-y-2">
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
        </ul>

        <div className="h-4 bg-gray-300 rounded w-1/2 mt-4 mb-2"></div>
        <ul className="space-y-2">
            <li className="h-4 bg-gray-300 rounded w-full"></li>
            <li className="h-4 bg-gray-300 rounded w-full"></li>
        </ul>

        <div className="h-4 bg-gray-300 rounded w-1/2 mt-4 mb-2"></div>
    </div>
);

const JobScraper = () => {
    const [url, setUrl] = useState("");
    const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile"); // Default model
    const [isFetching, setIsFetching] = useState(false); // Custom loading state

    const { data: jobData, isLoading, error, refetch, queryKey, queryClient } = useJobScraper(url, selectedModel);

    const handleFetchJob = async () => {
        if (url) {
            setIsFetching(true); // Start custom loading state
            try {
                // Check if the query is already cached and fresh
                const cachedData = queryClient.getQueryData(queryKey);
                if (!cachedData) {
                    await refetch(); // Only refetch if there's no cached data
                }
            } finally {
                setIsFetching(false); // Reset custom loading state
            }
        }
    };

    const handleModelChange = (e: any) => {
        setSelectedModel(e.target.value);
    };

    // Determine the overall loading state
    const isOverallLoading = isLoading || isFetching;

    // Check if the query is already cached
    const isCached = queryClient.getQueryData(queryKey);

    // Determine if the fetch button should be disabled
    const isFetchButtonDisabled = !url || isOverallLoading || !!isCached;

    return (
        <div className="max-w-2xl mx-auto p-6 border rounded shadow-lg">
            <input
                type="text"
                placeholder="Enter job posting URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            />

            <select
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full p-2 border rounded mb-4"
            >
                <option value="qwen-qwq-32b">qwen-qwq-32b</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
            </select>

            <button
                onClick={handleFetchJob}
                disabled={isFetchButtonDisabled} // Disable button if URL is empty, loading, or cached
                className={`w-full p-2 text-white rounded ${
                    isFetchButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {isOverallLoading ? "Fetching..." : "Fetch Job Details"}
            </button>

            {error && <p className="text-red-500 mt-4">Error: {error.message}</p>}

            {isOverallLoading ? (
                <SkeletonLoader />
            ) : jobData ? (
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

                    <p className="mt-4">
                        <strong>How to Apply:</strong>
                        <a href={jobData.how_to_apply} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            Apply Here
                        </a>
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default JobScraper;