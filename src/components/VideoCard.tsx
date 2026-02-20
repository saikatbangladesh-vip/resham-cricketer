import { Link } from 'react-router-dom';
import { type Video } from '../types';
import { Play, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
    video: Video;
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

function getTimeAgo(createdAt: any): string {
    try {
        const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
        return formatDistanceToNow(d, { addSuffix: true });
    } catch {
        return 'Just now';
    }
}

export default function VideoCard({ video }: VideoCardProps) {
    return (
        <Link to={`/watch/${video.id}`} className="block group card-hover animate-fade-in">
            <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-background">
                            <Play className="w-10 h-10 mb-2 opacity-30" />
                            <span className="text-xs opacity-50">No Preview</span>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                        {video.status === 'live' && (
                            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>

                    {/* Stats Overlay (bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-3 text-white/80 text-xs">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatCount(video.views || 0)}
                        </span>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                    <div className="flex gap-3">
                        {/* Uploader Avatar */}
                        <div className="shrink-0">
                            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted">
                                {video.uploaderAvatar ? (
                                    <img src={video.uploaderAvatar} alt={video.uploaderName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/20 font-bold text-primary text-xs">
                                        {video.uploaderName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200 mb-1">
                                {video.title}
                            </h3>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                                <div className="font-medium">{video.uploaderName}</div>
                                <div className="flex items-center gap-1.5">
                                    <span>{formatCount(video.views || 0)} views</span>
                                    <span className="opacity-40">·</span>
                                    <span>{getTimeAgo(video.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
