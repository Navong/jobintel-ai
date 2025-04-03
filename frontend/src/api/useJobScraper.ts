import { useQuery } from "@tanstack/react-query";

export interface JobDescription {
    job_title: string;
    responsibilities: string[];
    requirements: string[];
    preferred_qualifications?: string[];
    benefits?: string[];
    how_to_apply: string;
}

const fetchJobDescription = async (url: string, model: string): Promise<JobDescription> => {
    const response = await fetch(`/api/scrape-job?url=${encodeURIComponent(url)}&model=${model}`);
    
    if (!response.ok) {
        throw new Error("Failed to fetch job details");
    }
    
    const result = await response.json();
    
    if (result.status !== "success") {
        throw new Error("AI processing failed");
    }
    
    return result.data; // Extract job description data
};

export function useJobScraper(jobUrl: string, model: string) {
    return useQuery({
        queryKey: ["jobDescription", jobUrl, model],
        queryFn: () => fetchJobDescription(jobUrl, model),
        enabled: !!jobUrl, // Prevents fetching when URL is empty
        // retry: 2, // Retry twice if the request fails
    });
}