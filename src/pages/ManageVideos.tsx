import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { type Video } from '../types';
import { Edit2, Trash2, ExternalLink, Play, Search, Zap, X, Check, Link2, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function SkeletonRow() {
    return (
        <div className="flex gap-4 p-4 rounded-2xl border border-white/5">
            <div className="w-40 aspect-video skeleton rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 py-2">
                <div className="skeleton h-4 rounded-lg w-3/4" />
                <div className="skeleton h-3 rounded-lg w-1/2" />
                <div className="skeleton h-3 rounded-lg w-1/3" />
            </div>
        </div>
    );
}

export default function ManageVideos() {
    const { user } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [editThumb, setEditThumb] = useState('');
    const [updating, setUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const fetchUserVideos = async () => {
            try {
                setLoading(true);
                const q = query(collection(db, 'videos'), where('uploaderId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const videoList: Video[] = [];
                querySnapshot.forEach((doc) => videoList.push({ id: doc.id, ...doc.data() } as Video));
                videoList.sort((a, b) => {
                    const tA = a.createdAt?.toMillis?.() || 0;
                    const tB = b.createdAt?.toMillis?.() || 0;
                    return tB - tA;
                });
                setVideos(videoList);
            } catch (error) {
                console.error("Error fetching videos:", error);
                toast.error("Failed to load your clips");
            } finally {
                setLoading(false);
            }
        };
        fetchUserVideos();
    }, [user]);

    const handleDelete = async (videoId: string) => {
        setDeletingId(videoId);
        try {
            await deleteDoc(doc(db, 'videos', videoId));
            setVideos(prev => prev.filter(v => v.id !== videoId));
            toast.success("Clip deleted");
        } catch {
            toast.error("Failed to delete clip");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditClick = (video: Video) => {
        setEditingVideo(video);
        setEditTitle(video.title);
        setEditDesc(video.description);
        setEditUrl(video.url);
        setEditThumb(video.thumbnailUrl);
    };

    const handleUpdate = async () => {
        if (!editingVideo) return;
        setUpdating(true);
        try {
            await updateDoc(doc(db, 'videos', editingVideo.id), {
                title: editTitle,
                description: editDesc,
                url: editUrl,
                thumbnailUrl: editThumb,
            });
            setVideos(prev => prev.map(v => v.id === editingVideo.id
                ? { ...v, title: editTitle, description: editDesc, url: editUrl, thumbnailUrl: editThumb }
                : v
            ));
            setEditingVideo(null);
            toast.success("Clip updated! ✨");
        } catch {
            toast.error("Update failed");
        } finally {
            setUpdating(false);
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/5 sticky top-0 z-10 px-4 md:px-6 py-4">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Manage Clips</h1>
                        <p className="text-muted-foreground text-sm">{videos.length} total clip{videos.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm shrink-0">
                        <Zap className="w-4 h-4" />
                        Add New Clip
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your clips..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-dark pl-11"
                    />
                </div>

                {/* Video List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                ) : filteredVideos.length > 0 ? (
                    <div className="space-y-3">
                        {filteredVideos.map((video) => (
                            <div key={video.id} className="group glass rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-200 flex flex-col sm:flex-row gap-4 p-4">
                                {/* Thumbnail */}
                                <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-muted shrink-0">
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                    <Link to={`/watch/${video.id}`} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
                                            <Play className="w-4 h-4 text-white fill-current" />
                                        </div>
                                    </Link>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{video.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{video.description || 'No description'}</p>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleEditClick(video)}
                                                className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(video.id)}
                                                disabled={deletingId === video.id}
                                                className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deletingId === video.id
                                                    ? <div className="w-4 h-4 border-2 border-muted border-t-red-400 rounded-full animate-spin" />
                                                    : <Trash2 className="w-4 h-4" />
                                                }
                                            </button>
                                            <Link to={`/watch/${video.id}`} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors" title="View">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Play className="w-3 h-3" />
                                            {video.views || 0} views
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${video.status === 'live' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'}`}>
                                            {video.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border border-dashed border-white/10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                            {searchTerm ? <Search className="w-8 h-8 text-primary" /> : <Zap className="w-8 h-8 text-primary" />}
                        </div>
                        <h3 className="font-heading text-lg font-bold mb-2">
                            {searchTerm ? 'No results found' : 'No clips yet'}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-xs mb-5">
                            {searchTerm ? `No clips matching "${searchTerm}"` : 'Upload your first cricket highlight to get started!'}
                        </p>
                        {!searchTerm && <Link to="/upload" className="btn-primary">Upload Now</Link>}
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="text-primary font-semibold hover:underline text-sm">Clear search</button>}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !updating && setEditingVideo(null)} />
                    <div className="relative bg-card w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-card p-5 border-b border-white/5 flex items-center justify-between z-10">
                            <h2 className="font-heading text-xl font-bold">Edit Clip</h2>
                            <button onClick={() => setEditingVideo(null)} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Thumbnail preview */}
                        <div className="px-5 pt-4">
                            <div className="aspect-video rounded-2xl overflow-hidden bg-muted mb-5">
                                <img src={editThumb || editingVideo.thumbnailUrl} alt="preview" className="w-full h-full object-cover" onError={() => { }} />
                            </div>
                        </div>

                        <div className="px-5 pb-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="input-dark" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Link2 className="w-3 h-3" />Video Link (Google Drive)
                                </label>
                                <input type="text" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="input-dark" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Image className="w-3 h-3" />Thumbnail URL
                                </label>
                                <input type="text" value={editThumb} onChange={e => setEditThumb(e.target.value)} className="input-dark" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="input-dark resize-none h-24" />
                            </div>
                        </div>

                        <div className="p-5 border-t border-white/5 flex gap-3">
                            <button onClick={() => setEditingVideo(null)} disabled={updating} className="flex-1 py-3 rounded-xl font-semibold text-muted-foreground hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleUpdate} disabled={updating} className="flex-[2] btn-primary flex items-center justify-center gap-2">
                                {updating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
