/**
 * iTunes Search API Service
 * Fetches iOS app metadata from Apple's iTunes Search API
 */

export interface ITunesSearchResult {
    trackId: number;
    trackName: string;
    bundleId: string;
    artworkUrl60?: string;
    artworkUrl100?: string;
    sellerName?: string;
    description?: string;
    averageUserRating?: number;
    userRatingCount?: number;
    price?: number;
    formattedPrice?: string;
    genres?: string[];
    primaryGenreName?: string;
    version?: string;
    fileSizeBytes?: string;
    minimumOsVersion?: string;
}

export interface ITunesSearchResponse {
    resultCount: number;
    results: ITunesSearchResult[];
}

const ITUNES_SEARCH_BASE_URL = 'https://itunes.apple.com/search';

export const ITunesSearchService = {
    /**
     * Search for iOS apps on the iTunes Store
     * @param term - Search query
     * @param country - Country code (default: IN)
     * @param limit - Maximum number of results (default: 100)
     */
    searchApps: async (
        term: string,
        country: string = 'IN',
        limit: number = 100
    ): Promise<ITunesSearchResult[]> => {
        if (!term || term.trim().length < 2) {
            return [];
        }

        const params = new URLSearchParams({
            term: term.trim(),
            country,
            limit: String(limit),
            media: 'software',
            entity: 'software',
            lang: 'en-us',
        });

        try {
            const response = await fetch(`${ITUNES_SEARCH_BASE_URL}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`iTunes Search API error: ${response.status}`);
            }

            const data: ITunesSearchResponse = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('iTunes Search API error:', error);
            throw error;
        }
    },

    /**
     * Lookup a specific app by bundle ID
     * @param bundleId - iOS app bundle identifier
     * @param country - Country code (default: IN)
     */
    lookupByBundleId: async (
        bundleId: string,
        country: string = 'IN'
    ): Promise<ITunesSearchResult | null> => {
        const params = new URLSearchParams({
            bundleId,
            country,
            lang: 'en-us',
        });

        try {
            const response = await fetch(`https://itunes.apple.com/lookup?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`iTunes Lookup API error: ${response.status}`);
            }

            const data: ITunesSearchResponse = await response.json();
            return data.results[0] || null;
        } catch (error) {
            console.error('iTunes Lookup API error:', error);
            return null;
        }
    },
};
