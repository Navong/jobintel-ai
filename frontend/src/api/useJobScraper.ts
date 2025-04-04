import { useQuery, QueryClient } from "@tanstack/react-query";

export interface JobDescription {
    job_title: string;
    responsibilities: string[];
    requirements: string[];
    preferred_qualifications?: string[];
    benefits?: string[];
    how_to_apply: string;
}

const fetchJobDescription = async (url: string, model: string): Promise<JobDescription> => {
    const response = await fetch(`https://jobintel.navong.cloud/api/scrape-job?url=${encodeURIComponent(url)}&model=${model}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch job details (HTTP ${response.status})`);
    }
    
    const result = await response.json();
    
    if (result.status !== "success") {
        throw new Error(result.message || "AI processing failed");
    }
    
    return result.data; // Extract job description data
};

export function useJobScraper(jobUrl: string, model: string) {
    const queryClient = new QueryClient();

    const queryKey = ["jobDescription", jobUrl, model];

    return {
        ...useQuery({
            queryKey,
            queryFn: () => fetchJobDescription(jobUrl, model),
            enabled: !!jobUrl, // Only fetch if the URL is provided
            staleTime: 10 * 60 * 1000, // Data is considered fresh for 10 minutes
            refetchOnWindowFocus: false, // Disable refetching when switching tabs
            refetchOnMount: false, // Disable refetching when the component mounts
        }),
        queryKey,
        queryClient,
    };
}