export interface DashboardStats {
    totalDevices: number;
    activeDevices: number;
    totalApplications: number;
    compliantDevices: number;
}

export interface DateWiseCounts {
    dates: string[];
    counts: number[];
}
