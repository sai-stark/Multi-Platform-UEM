export interface Geofence {
    id?: string;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    type?: 'CIRCLE' | 'POLYGON';
    coordinates?: Array<{ lat: number; lng: number }>;
}

export interface GeofencePolicy {
    id?: string;
    name: string;
    geofenceIds: string[];
    actions?: {
        onEnter?: string;
        onExit?: string;
    };
}

export interface GeofenceAlert {
    id: string;
    deviceId: string;
    geofenceId: string;
    eventType: 'ENTER' | 'EXIT';
    timestamp: string;
}

export interface GeofenceMapping {
    geofenceId: string;
    entityId: string; // deviceId or groupId
    entityType: 'DEVICE' | 'GROUP';
}

export interface GeoFenceWholeMappingDetails {
    mappings: GeofenceMapping[];
}
