import { AxiosError } from 'axios';

/**
 * Extracts error message from API error response
 * @param error - The error object (usually from catch block)
 * @param fallbackMessage - Default message if error message cannot be extracted
 * @returns The error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
    if (error instanceof AxiosError) {
        // Check for backend error message in response data
        const responseData = error.response?.data;

        if (responseData) {
            // Common error response formats
            if (typeof responseData === 'string') {
                return responseData;
            }
            if (responseData.message) {
                return responseData.message;
            }
            if (responseData.error) {
                return responseData.error;
            }
            if (responseData.errorMessage) {
                return responseData.errorMessage;
            }
            if (responseData.detail) {
                return responseData.detail;
            }
            // For validation errors that return an object with field-specific errors
            if (responseData.errors && typeof responseData.errors === 'object') {
                const errorMessages = Object.values(responseData.errors).flat();
                if (errorMessages.length > 0) {
                    return errorMessages.join(', ');
                }
            }
        }

        // Use status text as fallback
        if (error.response?.statusText) {
            return `${error.response.status}: ${error.response.statusText}`;
        }

        // Use error message if available
        if (error.message) {
            return error.message;
        }
    }

    // For non-Axios errors
    if (error instanceof Error) {
        return error.message;
    }

    // If error is a string
    if (typeof error === 'string') {
        return error;
    }

    return fallbackMessage;
}
