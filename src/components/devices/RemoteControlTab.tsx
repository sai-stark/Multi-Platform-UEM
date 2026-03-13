import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    isTrackReference,
    LiveKitRoom,
    useLocalParticipant,
    useRoomContext,
    useTracks,
    VideoTrack
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export interface RemoteControlTabProps {
    roomToken: string;
    serverUrl: string;
    onDisconnect?: () => void;
}

export function RemoteControlTab({ roomToken, serverUrl, onDisconnect }: RemoteControlTabProps) {
    if (!roomToken || !serverUrl) {
        return (
            <Alert variant="destructive" className="max-w-md mx-auto mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Connection Details</AlertTitle>
                <AlertDescription>
                    Requires both a Room Token and Server URL to begin the session.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <LiveKitRoom
            video={false}
            audio={false}
            token={roomToken}
            serverUrl={serverUrl}
            connect={true}
            options={{ adaptiveStream: true }}
            connectOptions={{ autoSubscribe: true }}
            className="flex flex-col h-full w-full border rounded-lg overflow-hidden bg-card"
        >
            <RemoteControlInner onDisconnect={onDisconnect} />
        </LiveKitRoom>
    );
}

function RemoteControlInner({ onDisconnect }: { onDisconnect?: () => void }) {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();

    // Find any video track from the device (it might publish as ScreenShare, Camera, or Unknown)
    const tracks = useTracks([
        { source: Track.Source.ScreenShare, withPlaceholder: false },
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.Unknown, withPlaceholder: false }
    ]);

    // Filter to only remote actual tracks, skipping placeholders
    const remoteVideoTracks = tracks.filter(isTrackReference).filter(t => t.publication?.kind === 'video');
    const screenTrack = (remoteVideoTracks.length > 0 ? remoteVideoTracks[0] : null) as any;

    const [isDragging, setIsDragging] = useState(false);

    // Verify room connection state
    const isConnected = room.state === 'connected';

    const handlePointerEvent = (e: React.PointerEvent<HTMLVideoElement>, action: 'DOWN' | 'MOVE' | 'UP') => {
        if (!localParticipant) return;

        const video = e.currentTarget;
        const rect = video.getBoundingClientRect();

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Skip events if video has no dimensions loaded
        if (videoWidth === 0 || videoHeight === 0) return;

        // Calculate aspect ratio scale factors based on object-fit: contain logic
        const scale = Math.min(rect.width / videoWidth, rect.height / videoHeight);
        const renderedWidth = videoWidth * scale;
        const renderedHeight = videoHeight * scale;

        // The video is centered in the tag, so determine the black bar offsets
        const xOffset = (rect.width - renderedWidth) / 2;
        const yOffset = (rect.height - renderedHeight) / 2;

        const rawX = e.clientX - rect.left - xOffset;
        const rawY = e.clientY - rect.top - yOffset;

        let xPercent = rawX / renderedWidth;
        let yPercent = rawY / renderedHeight;

        // Ignore clicks that originated significantly outside the rendered area on DOWN
        if (action === 'DOWN' && (xPercent < 0 || xPercent > 1 || yPercent < 0 || yPercent > 1)) {
            return;
        }

        // Clamp values to remain between 0 and 1 so that we don't send coordinates completely off-screen
        xPercent = Math.max(0, Math.min(1, xPercent));
        yPercent = Math.max(0, Math.min(1, yPercent));

        // Prepare JSON payload: Format the action and coordinates into a JSON string
        const payload = JSON.stringify({
            action,
            coordinates: {
                x: Number(xPercent.toFixed(4)),
                y: Number(yPercent.toFixed(4))
            }
        });

        // Encode and send via LiveKit Data Channel
        const data = new TextEncoder().encode(payload);
        const isReliable = action !== 'MOVE'; // Use reliable UDP for discrete actions, lossy for continuous drags

        if (import.meta.env.DEV) { console.log(`Sending pointer event: ${payload}`); }

        try {
            room.localParticipant.publishData(data, { reliable: isReliable });
        } catch (err) {
            if (import.meta.env.DEV) { console.error('Failed to send control payload:', err); }
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLVideoElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        handlePointerEvent(e, 'DOWN');
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLVideoElement>) => {
        if (!isDragging) return;
        handlePointerEvent(e, 'MOVE');
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLVideoElement>) => {
        setIsDragging(false);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        handlePointerEvent(e, 'UP');
    };

    // Prevent default drag behaviors overlapping with pointer actions
    const preventDrag = (e: React.DragEvent<HTMLVideoElement>) => {
        e.preventDefault();
    };

    return (
        <div className="flex flex-col h-full w-full max-h-[800px]">
            <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        {isConnected ? (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </>
                        ) : (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        )}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        Live Session
                    </h3>
                </div>
                <Button variant="destructive" size="sm" onClick={() => {
                    room.disconnect();
                    onDisconnect?.();
                }}>
                    Disconnect Session
                </Button>
            </div>

            <div className="flex-1 bg-black overflow-hidden relative min-h-[500px] flex items-center justify-center relative touch-none select-none">
                {!isConnected ? (
                    <div className="text-white flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-slate-400" />
                        <p className="text-sm text-slate-300 font-medium">Establishing connection to device...</p>
                    </div>
                ) : !screenTrack ? (
                    <Alert className="max-w-md mx-auto bg-slate-800 border-slate-700 text-slate-200">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <AlertTitle className="text-amber-500 font-medium tracking-wide">Awaiting Video Stream</AlertTitle>
                        <AlertDescription className="text-slate-300/80">
                            Connected to room, but waiting for the device to begin casting its screen...
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="w-full h-full absolute inset-0 cursor-crosshair">
                        <VideoTrack
                            trackRef={screenTrack}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            onDragStart={preventDrag}
                            draggable={false}
                            className="w-full h-full object-contain pointer-events-auto shadow-xl touch-none max-h-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
