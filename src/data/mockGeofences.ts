import { Geofence } from "@/types/models";

export const mockGeofences: Geofence[] = [
    {
        id: "1",
        name: "Main Headquarters",
        description: "Primary corporate office campus in New Delhi.",
        latitude: 28.6139,
        longitude: 77.2090,
        radius: 500,
        type: 'CIRCLE'
    },
    {
        id: "2",
        name: "Northern Warehouse",
        description: "Logistics and distribution center for the northern region.",
        latitude: 28.6500,
        longitude: 77.2500,
        radius: 300,
        type: 'CIRCLE'
    },
    {
        id: "3",
        name: "Restricted Zone - Downtown",
        description: "High-security government area. No-fly zone for drones.",
        latitude: 28.6300,
        longitude: 77.2100,
        radius: 0,
        type: 'POLYGON',
        coordinates: [
            { lat: 28.6300, lng: 77.2100 },
            { lat: 28.6320, lng: 77.2150 },
            { lat: 28.6280, lng: 77.2180 },
            { lat: 28.6250, lng: 77.2120 }
        ]
    },
    {
        id: "4",
        name: "Tech Park South",
        description: "R&D facility and server rooms.",
        latitude: 28.5355,
        longitude: 77.3910,
        radius: 750,
        type: 'CIRCLE'
    },
    {
        id: "5",
        name: "Connaught Place Hub",
        description: "Central sales office.",
        latitude: 28.6315,
        longitude: 77.2167,
        radius: 200,
        type: 'CIRCLE'
    },
    {
        id: "6",
        name: "Inventory Yard",
        description: "Outdoor storage yard.",
        latitude: 28.6400,
        longitude: 77.2300,
        radius: 0,
        type: 'POLYGON',
        coordinates: [
            { lat: 28.6400, lng: 77.2300 },
            { lat: 28.6410, lng: 77.2320 },
            { lat: 28.6420, lng: 77.2310 },
            { lat: 28.6405, lng: 77.2290 }
        ]
    }
];
