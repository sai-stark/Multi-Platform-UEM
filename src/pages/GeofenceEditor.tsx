
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { mockGeofences } from "@/data/mockGeofences";
import { Geofence } from "@/types/models";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Loader2, Save, Trash, Undo } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Circle, MapContainer, Marker, Polygon, TileLayer, useMapEvents } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";

// Fix Leaflet marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const GeofenceEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<'CIRCLE' | 'POLYGON'>('CIRCLE');

    // Circle State
    const [radius, setRadius] = useState<number>(100);
    const [latitude, setLatitude] = useState<number>(28.6139); // Default to New Delhi
    const [longitude, setLongitude] = useState<number>(77.2090);

    // Polygon State
    const [polygonPoints, setPolygonPoints] = useState<Array<{ lat: number, lng: number }>>([]);

    useEffect(() => {
        if (isEditing) {
            // Mock fetch logic
            const mockData = mockGeofences.find(g => g.id === id);
            if (mockData) {
                setGeofenceData(mockData);
                toast({
                    title: "Demo Mode",
                    description: "Loaded mock data for demonstration.",
                });
            } else {
                toast({
                    title: "Not Found",
                    description: "Geofence not found in mock data.",
                    variant: "destructive",
                });
            }
        } else {
            // Get current location if creating new
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                });
            }
        }
    }, [id]);

    const setGeofenceData = (data: Geofence) => {
        setName(data.name);
        setDescription(data.description || "");
        setType(data.type || 'CIRCLE');

        if (data.type === 'POLYGON') {
            setPolygonPoints(data.coordinates || []);
            if (data.coordinates && data.coordinates.length > 0) {
                setLatitude(data.coordinates[0].lat);
                setLongitude(data.coordinates[0].lng);
            }
        } else {
            setLatitude(data.latitude || 28.6139);
            setLongitude(data.longitude || 77.2090);
            setRadius(data.radius || 100);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
            return;
        }

        if (type === 'POLYGON' && polygonPoints.length < 3) {
            toast({ title: "Validation Error", description: "A polygon must have at least 3 points", variant: "destructive" });
            return;
        }

        try {
            setSubmitting(true);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Log payload for demo
            const payload: Geofence = {
                name,
                description,
                type,
                ...(isEditing && { id }),
            };

            if (type === 'CIRCLE') {
                payload.latitude = latitude;
                payload.longitude = longitude;
                payload.radius = radius;
            } else {
                payload.coordinates = polygonPoints;
                // Set lat/long to first point or centroid for reference
                if (polygonPoints.length > 0) {
                    payload.latitude = polygonPoints[0].lat;
                    payload.longitude = polygonPoints[0].lng;
                }
                payload.radius = 0;
            }

            console.log("Mock Save Payload:", payload);

            toast({
                title: isEditing ? "Updated (Mock)" : "Created (Mock)",
                description: "Geofence data saved successfully (Simulation)",
            });
            navigate("/geofences");
        } catch (error) {
            // Should not happen in mock mode
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        if (type === 'CIRCLE') {
            setLatitude(lat);
            setLongitude(lng);
        } else {
            setPolygonPoints(prev => [...prev, { lat, lng }]);
        }
    };

    const removeLastPoint = () => {
        setPolygonPoints(prev => prev.slice(0, -1));
    };

    const clearPoints = () => {
        setPolygonPoints([]);
    };

    if (loading) {
        return (
            <MainLayout>
                <LoadingAnimation message="Loading geofence data..." />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/geofences")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? "Edit Geofence" : "Create Geofence"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? `Updating ${name}` : "Define a new geographical boundary"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Office Campus"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Main HQ Location"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Geofence Type</Label>
                                    <RadioGroup
                                        defaultValue="CIRCLE"
                                        value={type}
                                        onValueChange={(val) => setType(val as 'CIRCLE' | 'POLYGON')}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="CIRCLE" id="r-circle" />
                                            <Label htmlFor="r-circle">Circle</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="POLYGON" id="r-polygon" />
                                            <Label htmlFor="r-polygon">Polygon</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {type === 'CIRCLE' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="radius">Radius (meters)</Label>
                                            <Input
                                                id="radius"
                                                type="number"
                                                min="10"
                                                value={radius}
                                                onChange={(e) => setRadius(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Center Coordinates</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={latitude}
                                                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                                                    placeholder="Lat"
                                                />
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={longitude}
                                                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                                                    placeholder="Lng"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Click map to set center.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Polygon Points: {polygonPoints.length}</Label>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={removeLastPoint} disabled={polygonPoints.length === 0}>
                                                <Undo className="h-4 w-4 mr-1" /> Undo
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={clearPoints} disabled={polygonPoints.length === 0}>
                                                <Trash className="h-4 w-4 mr-1" /> Clear
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Click map to add points. At least 3 points required.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-2">
                                    <Button type="submit" disabled={submitting} className="w-full">
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" /> Save
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Right Column: Map */}
                    <Card className="lg:col-span-2 overflow-hidden h-[600px] relative">
                        <MapContainer
                            center={[latitude, longitude]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <MapEvents onMapClick={handleMapClick} />

                            {type === 'CIRCLE' ? (
                                <>
                                    <Marker position={[latitude, longitude]} />
                                    <Circle
                                        center={[latitude, longitude]}
                                        radius={radius}
                                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                                    />
                                </>
                            ) : (
                                <>
                                    {polygonPoints.map((p, i) => (
                                        <Marker key={i} position={[p.lat, p.lng]} />
                                    ))}
                                    {polygonPoints.length > 0 && (
                                        <Polygon
                                            positions={polygonPoints.map(p => [p.lat, p.lng])}
                                            pathOptions={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.2 }}
                                        />
                                    )}
                                </>
                            )}
                        </MapContainer>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default GeofenceEditor;
