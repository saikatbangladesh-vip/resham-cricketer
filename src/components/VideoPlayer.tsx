import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean;
}

export default function VideoPlayer({ src, poster, autoPlay = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Check if the source is from Google Drive
    const isGdrive = src.includes('drive.google.com');

    // Convert sharing link to embed link for Google Drive
    const getGdriveEmbedUrl = (url: string) => {
        try {
            const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    useEffect(() => {
        if (!isGdrive && videoRef.current && autoPlay) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay prevented:", error);
            });
        }
    }, [autoPlay, src, isGdrive]);

    if (isGdrive) {
        return (
            <div className="relative w-full h-0 pb-[56.25%] bg-black">
                <iframe
                    src={getGdriveEmbedUrl(src)}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="autoplay"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                controls
                className="max-h-full max-w-full"
                playsInline
            />
        </div>
    );
}
