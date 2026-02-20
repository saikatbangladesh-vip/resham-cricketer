import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type Video } from '../types';
import VideoCard from './VideoCard';
import { Play, Zap, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

function SkeletonCard() {
    return (
        <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
            <div className="aspect-video skeleton" />
            <div className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="skeleton h-4 rounded-lg w-3/4" />
                    <div className="skeleton h-3 rounded-lg w-1/2" />
                </div>
            </div>
        </div>
    );
}

interface VideoFeedProps {
    maxVideos?: number;
    searchQuery?: string;
}

export default function VideoFeed({ maxVideos = 24, searchQuery = '' }: VideoFeedProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const q = query(
                    collection(db, 'videos'),
                    orderBy('createdAt', 'desc'),
                    limit(maxVideos)
                );
                const querySnapshot = await getDocs(q);
                const videoList: Video[] = [];
                querySnapshot.forEach((doc) => {
                    videoList.push({ id: doc.id, ...doc.data() } as Video);
                });
                setVideos(videoList);
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [maxVideos]);

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                    <Play className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">No Clips Yet</h3>
                <p className="text-muted-foreground max-w-xs mb-6">
                    Be the first to share your cricket highlights with the community!
                </p>
                <Link to="/upload" className="btn-primary flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Upload First Clip
                </Link>
            </div>
        );
    }

    if (filteredVideos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-heading font-bold">No results found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-1">
                    We couldn't find anything matching "{searchQuery}"
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
            ))}
        </div>
    );
}
