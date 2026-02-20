import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { type Video } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import VideoFeed from '../components/VideoFeed';
import SEO from '../components/SEO';

function getTimeAgo(createdAt: any): string {
    try {
        const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
        return formatDistanceToNow(d, { addSuffix: true });
    } catch { return 'Just now'; }
}

function getFullDate(createdAt: any): string {
    try {
        const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
        return format(d, 'MMM d, yyyy');
    } catch { return ''; }
}

const renderDescription = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export default function Watch() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchVideo = async () => {
            try {
                const docRef = doc(db, 'videos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as Video;
                    setVideo(data);
                    setLikeCount(data.likes || 0);
                    // Increment view count
                    await updateDoc(docRef, { views: increment(1) });
                }
            } catch (error) {
                console.error("Error getting video:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    const handleLike = async () => {
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
        toast.success(newLiked ? '❤️ Liked!' : 'Removed like', { duration: 1500 });

        if (newLiked && video && currentUser && currentUser.uid !== video.uploaderId) {
            try {
                await addDoc(collection(db, 'notifications'), {
                    type: 'like',
                    actorId: currentUser.uid,
                    actorName: currentUser.displayName || currentUser.email || 'Someone',
                    actorAvatar: currentUser.photoURL || null,
                    videoId: video.id,
                    videoTitle: video.title,
                    targetUserId: video.uploaderId,
                    createdAt: serverTimestamp(),
                });
            } catch (e) {
                console.error('Notification write failed', e);
            }
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success('🔗 Link copied!');
        }).catch(() => toast.error('Could not copy link'));
    };

    if (loading) return (
        <div className="flex flex-col h-screen bg-background">
            <div className="h-12 glass border-b border-white/5 skeleton" />
            <div className="aspect-video bg-black skeleton" />
            <div className="p-6 space-y-4">
                <div className="skeleton h-6 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-1/2 rounded-lg" />
            </div>
        </div>
    );

    if (!video) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Video Not Found</h2>
                <Link to="/" className="text-primary hover:underline">Go Home</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={video.title}
                description={video.description || `Watch ${video.title} by ${video.uploaderName} on Resham Cricketer.`}
                ogType="video.other"
                ogImage={video.thumbnailUrl}
            />

            {/* Top Bar / Header */}
            <div className="sticky top-0 z-30 glass border-b border-white/5 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-sm line-clamp-1 flex-1">{video.title}</h2>
                <button onClick={handleShare} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-0 md:px-6 py-0 md:py-6 space-y-6">
                {/* Player */}
                <div className="md:rounded-2xl overflow-hidden border-y md:border border-white/5 shadow-2xl bg-black">
                    <VideoPlayer src={video.url} poster={video.thumbnailUrl} autoPlay />
                </div>

                {/* Video Info */}
                <div className="px-4 md:px-0">
                    <h1 className="font-heading text-2xl font-bold leading-tight mb-4">{video.title}</h1>

                    {/* Uploader + Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                        <Link to={`/profile/${video.uploaderId}`} className="flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted">
                                {video.uploaderAvatar ? (
                                    <img src={video.uploaderAvatar} alt={video.uploaderName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/20 font-bold text-primary text-base">
                                        {video.uploaderName?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold group-hover:text-primary transition-colors">{video.uploaderName}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Eye className="w-3 h-3" />
                                    {video.views || 0} views
                                    <span className="opacity-40">·</span>
                                    <Calendar className="w-3 h-3" />
                                    {getFullDate(video.createdAt)}
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all duration-200 ${liked
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : 'glass border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-400/30'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 transition-transform ${liked ? 'fill-current scale-125' : ''}`} />
                                {likeCount}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 text-sm font-medium transition-all duration-200"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <a
                                href={video.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl glass border border-white/10 text-muted-foreground hover:text-foreground transition-all duration-200"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Description */}
                    {video.description && (
                        <div className="glass rounded-2xl p-5 mb-6 border border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">About this clip</h3>
                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                {renderDescription(video.description)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-3">{getTimeAgo(video.createdAt)}</p>
                        </div>
                    )}

                    {/* Comments Placeholder */}
                    <div className="glass rounded-2xl p-5 border border-white/5 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <h3 className="font-heading font-bold">Comments</h3>
                        </div>
                        <div className="flex items-center gap-3 py-6 text-center justify-center">
                            <div className="text-muted-foreground text-sm">
                                💬 Comments coming soon! Stay tuned.
                            </div>
                        </div>
                    </div>
                </div>

                {/* More Videos Section */}
                <div className="px-4 md:px-0 pb-8">
                    <h2 className="font-heading text-xl font-bold mb-4">More Highlights</h2>
                    <VideoFeed maxVideos={6} />
                </div>
            </div>
        </div>
    );
}
