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
import { AlertCircle, Loader2, Power, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

/* ─── Side button component for volume / power ─── */
function SideButton({ onClick, disabled, title, children, className = '' }: {
    onClick: () => void;
    disabled: boolean;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`
                flex items-center justify-center
                bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500
                disabled:opacity-40 disabled:cursor-not-allowed
                text-zinc-300 hover:text-white
                transition-all duration-150
                shadow-md hover:shadow-lg active:shadow-sm
                active:scale-95
                ${className}
            `}
        >
            {children}
        </button>
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
    const [isOutOfBounds, setIsOutOfBounds] = useState(false);

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

        // Ignore clicks/drags that fall outside the rendered video area
        const outOfBounds = xPercent < 0 || xPercent > 1 || yPercent < 0 || yPercent > 1;
        if (action === 'DOWN' && outOfBounds) {
            setIsOutOfBounds(true);
            return;
        }
        if (action === 'UP') {
            if (isOutOfBounds || outOfBounds) {
                setIsOutOfBounds(false);
                return;
            }
            setIsOutOfBounds(false);
        }
        if ((action === 'MOVE') && (isOutOfBounds || outOfBounds)) {
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

    // Send physical button / keyboard key events via data channel
    const sendButtonAction = useCallback((keyCode: string) => {
        if (!localParticipant || !isConnected) return;

        const payload = JSON.stringify({
            action: 'KEY_EVENT',
            keyCode,
        });

        const data = new TextEncoder().encode(payload);
        if (import.meta.env.DEV) { console.log(`Sending key event: ${payload}`); }

        try {
            room.localParticipant.publishData(data, { reliable: true });
        } catch (err) {
            if (import.meta.env.DEV) { console.error('Failed to send key event:', err); }
        }
    }, [localParticipant, isConnected, room.localParticipant]);

    // Map of special browser key names to key codes sent to the device
    const SPECIAL_KEY_MAP: Record<string, string> = {
        'Backspace': 'BACKSPACE',
        'Enter': 'ENTER',
        ' ': 'SPACE',
        'Tab': 'TAB',
        'Escape': 'ESCAPE',
        'Delete': 'DELETE',
        'ArrowUp': 'ARROW_UP',
        'ArrowDown': 'ARROW_DOWN',
        'ArrowLeft': 'ARROW_LEFT',
        'ArrowRight': 'ARROW_RIGHT',
        'Home': 'HOME',
        'End': 'END',
        'CapsLock': 'CAPS_LOCK',
    };

    // Ref for the container div so we can check focus scope
    const containerRef = useRef<HTMLDivElement>(null);

    // Forward keyboard events to the remote device
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only forward events when the remote-control container (or a child) is focused
            if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== containerRef.current) {
                return;
            }

            // Ignore modifier-only presses and combos involving Ctrl/Meta (browser shortcuts)
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
            if (e.ctrlKey || e.metaKey) return;

            // Prevent default browser behavior for keys like Backspace, Space, Tab, arrows
            if (['Backspace', ' ', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            const keyCode = SPECIAL_KEY_MAP[e.key] || e.key;
            sendButtonAction(keyCode);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sendButtonAction]);

    return (
        <div ref={containerRef} tabIndex={0} className="flex flex-col h-full w-full outline-none">
            {/* ── Top toolbar: connection status + disconnect ── */}
            <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        {isConnected ? (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                            </>
                        ) : (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
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

            {/* ── Emulator body: side buttons + phone frame ── */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 overflow-hidden py-4 px-2">
                <div className="relative flex items-center justify-center" style={{ height: '100%', maxHeight: '720px' }}>

                    {/* ── Left side: Volume buttons ── */}
                    <div className="flex flex-col items-center gap-1 mr-1.5 self-center" style={{ marginTop: '-40px' }}>
                        <SideButton
                            onClick={() => sendButtonAction('VOLUME_UP')}
                            disabled={!isConnected}
                            title="Volume Up"
                            className="w-5 h-14 rounded-l-md rounded-r-none border-r-0"
                        >
                            <Volume2 className="w-3 h-3 -rotate-90" />
                        </SideButton>
                        <SideButton
                            onClick={() => sendButtonAction('VOLUME_DOWN')}
                            disabled={!isConnected}
                            title="Volume Down"
                            className="w-5 h-14 rounded-l-md rounded-r-none border-r-0"
                        >
                            <VolumeX className="w-3 h-3 -rotate-90" />
                        </SideButton>
                    </div>

                    {/* ── Phone frame ── */}
                    <div className="relative flex flex-col bg-zinc-900 dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl border-2 border-zinc-700 overflow-hidden"
                        style={{ width: '320px', height: '100%', maxHeight: '700px', minHeight: '480px' }}
                    >
                        {/* Notch / top bezel */}
                        <div className="flex items-center justify-center shrink-0 h-7 bg-zinc-900 dark:bg-zinc-950 relative">
                            <div className="w-24 h-5 bg-zinc-950 dark:bg-black rounded-b-2xl flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-900 border border-zinc-700" />
                            </div>
                        </div>

                        {/* Screen area */}
                        <div className="flex-1 bg-black overflow-hidden relative flex items-center justify-center touch-none select-none mx-1">
                            {!isConnected ? (
                                <div className="text-white flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-slate-400" />
                                    <p className="text-sm text-slate-300 font-medium">Connecting...</p>
                                </div>
                            ) : !screenTrack ? (
                                <div className="flex flex-col items-center gap-3 px-6 text-center">
                                    <AlertCircle className="h-8 w-8 text-amber-500" />
                                    <p className="text-amber-400 text-sm font-medium">Awaiting Video Stream</p>
                                    <p className="text-slate-500 text-xs">Waiting for the device to begin casting...</p>
                                </div>
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

                        {/* Bottom navigation bar (Android-style) */}
                        <div className="shrink-0 h-11 bg-zinc-900 dark:bg-zinc-950 flex items-center justify-around px-8">
                            {/* Back – triangle pointing left */}
                            <button
                                onClick={() => sendButtonAction('BACK')}
                                disabled={!isConnected}
                                title="Back"
                                className="group p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-zinc-400 group-hover:text-white transition-colors">
                                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            {/* Home – circle */}
                            <button
                                onClick={() => sendButtonAction('HOME')}
                                disabled={!isConnected}
                                title="Home"
                                className="group p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" className="text-zinc-400 group-hover:text-white transition-colors">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
                                </svg>
                            </button>
                            {/* Recent Apps – square */}
                            <button
                                onClick={() => sendButtonAction('RECENT_APPS')}
                                disabled={!isConnected}
                                title="Recent Apps"
                                className="group p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" className="text-zinc-400 group-hover:text-white transition-colors">
                                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
                                </svg>
                            </button>
                        </div>

                        {/* Bottom bezel / chin */}
                        <div className="shrink-0 h-4 bg-zinc-900 dark:bg-zinc-950" />
                    </div>

                    {/* ── Right side: Power button ── */}
                    <div className="flex flex-col items-center ml-1.5 self-center" style={{ marginTop: '-80px' }}>
                        <SideButton
                            onClick={() => sendButtonAction('POWER')}
                            disabled={!isConnected}
                            title="Power"
                            className="w-5 h-12 rounded-r-md rounded-l-none border-l-0"
                        >
                            <Power className="w-3 h-3 rotate-90" />
                        </SideButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

