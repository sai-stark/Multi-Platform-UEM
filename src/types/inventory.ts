export interface InventoryDevice {
    id?: string;
    serialNumber: string;
    manufacturer: string;
    modelNumber: string;
    location?: string;
    assetTag?: string;
    assignedUser?: string;
    userEmail?: string;
}

export interface InventoryBulkUpload {
    file: File;
}

export interface InventoryBulkUploadResponse {
    total: number;
    success: number;
    failed: number;
    errors?: string[];
}
