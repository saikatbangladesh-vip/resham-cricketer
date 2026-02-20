import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type UserProfile, type Video } from '../types';
import VideoCard from '../components/VideoCard';
import { User, Calendar, Edit2, MapPin, Trophy, X, Check, Video as VideoIcon, Eye, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

function getJoinDate(createdAt: any): string {
    try {
        if (!createdAt) return 'Recently';
        const d = createdAt.toDate ? createdAt.toDate() : createdAt instanceof Date ? createdAt : new Date(createdAt);
        return format(d, 'MMMM yyyy');
    } catch { return 'Recently'; }
}

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editBio, setEditBio] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const userDoc = await getDoc(doc(db, 'users', id));
                if (userDoc.exists()) {
                    const data = userDoc.data() as UserProfile;
                    setProfile(data);
                    setEditName(data.displayName || '');
                    setEditUsername(data.username || '');
                    setEditAvatar(data.photoURL || '');
                    setEditBio(data.bio || '');
                }
                const q = query(collection(db, 'videos'), where('uploaderId', '==', id));
                const videoDocs = await getDocs(q);
                const videoList: Video[] = [];
                videoDocs.forEach((doc) => videoList.push({ id: doc.id, ...doc.data() } as Video));
                videoList.sort((a, b) => {
                    const tA = a.createdAt?.toMillis?.() || 0;
                    const tB = b.createdAt?.toMillis?.() || 0;
                    return tB - tA;
                });
                setVideos(videoList);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleUpdateProfile = async () => {
        if (!id || !currentUser || currentUser.uid !== id) return;
        setUpdating(true);
        try {
            const updateData = {
                displayName: editName,
                username: editUsername,
                photoURL: editAvatar,
                bio: editBio
            };

            // 1. Update User Document
            await updateDoc(doc(db, 'users', id), updateData);

            // 2. Update all videos by this user (Denormalized sync)
            const videosQuery = query(collection(db, 'videos'), where('uploaderId', '==', id));
            const videoSnap = await getDocs(videosQuery);

            if (!videoSnap.empty) {
                const batch = writeBatch(db);
                videoSnap.forEach((videoDoc) => {
                    batch.update(videoDoc.ref, {
                        uploaderName: editName,
                        uploaderAvatar: editAvatar
                    });
                });
                await batch.commit();
            }

            setProfile(prev => prev ? { ...prev, ...updateData } : null);
            setIsEditing(false);
            toast.success('Profile updated! ✨');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const isOwnProfile = currentUser?.uid === id;
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

    if (loading) return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="h-48 skeleton rounded-3xl" />
            <div className="flex gap-4">
                <div className="w-28 h-28 skeleton rounded-2xl" />
                <div className="flex-1 space-y-3 py-2">
                    <div className="skeleton h-6 rounded-lg w-1/3" />
                    <div className="skeleton h-4 rounded-lg w-1/4" />
                </div>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">User not found</h2>
            <Link to="/" className="text-primary hover:underline">Go home</Link>
        </div>
    );

    return (
        <div className="min-h-screen">
            <SEO
                title={profile.displayName ? `${profile.displayName} (@${profile.username || 'player'})` : 'Player Profile'}
                description={profile.bio || `Check out ${profile.displayName}'s cricket highlights on Resham Cricketer.`}
                ogImage={profile.photoURL || '/og-image.jpg'}
            />
            {/* Banner */}
            <div className="relative h-48 md:h-64 bg-brand-gradient overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d1f12 0%, #0A0F1E 60%, #1a0d20 100%)' }} />
                <div className="absolute inset-0 bg-glow-gradient" />
                <div className="absolute top-0 left-0 w-full h-full opacity-5 flex flex-wrap gap-16 p-8 select-none pointer-events-none">
                    {[...Array(12)].map((_, i) => <Trophy key={i} className="w-12 h-12" />)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6">
                {/* Profile Header */}
                <div className="relative -mt-16 mb-8 flex flex-col md:flex-row md:items-end gap-4">
                    {/* Avatar */}
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl border-4 border-background bg-card overflow-hidden shadow-2xl shrink-0">
                        {profile.photoURL ? (
                            <img src={profile.photoURL} alt={profile.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <User className="w-12 h-12 text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                                <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
                                    {profile.displayName || 'Anonymous Player'}
                                    {videos.length > 0 && (
                                        <BadgeCheck className="w-5 h-5 text-primary fill-primary/10" />
                                    )}
                                </h1>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    @{profile.username || (profile.displayName || 'player').toLowerCase().replace(/\s+/g, '')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isOwnProfile ? (
                                    <>
                                        <Link to="/manage-videos" className="btn-ghost text-sm border border-white/10 flex items-center gap-1.5">
                                            <VideoIcon className="w-4 h-4" />
                                            Manage Clips
                                        </Link>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn-primary px-6 py-2.5 text-sm">Follow</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats + Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stats */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="glass rounded-2xl p-5 border border-white/5 space-y-5">
                            {/* Stat Grid */}
                            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                                {[
                                    { label: 'Uploads', value: videos.length, icon: VideoIcon },
                                    { label: 'Total Views', value: totalViews, icon: Eye },
                                    { label: 'Followers', value: 0, icon: User },
                                ].map((s) => (
                                    <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center lg:text-left lg:flex lg:items-center lg:gap-3">
                                        <s.icon className="w-4 h-4 text-primary hidden lg:block shrink-0" />
                                        <div>
                                            <div className="font-heading font-bold text-lg leading-none">{s.value}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/5 pt-4 space-y-3">
                                {profile.bio && (
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Joined {getJoinDate(profile.createdAt)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Bangladesh
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Videos */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-5">
                            <h2 className="font-heading text-xl font-bold">Highlights</h2>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                                {videos.length}
                            </span>
                        </div>

                        {videos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {videos.map((video) => <VideoCard key={video.id} video={video} />)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border border-dashed border-white/10 text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                                    <Trophy className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-heading text-lg font-bold">No highlights yet</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mt-2 mb-6">
                                    Start your journey by uploading your first cricket clip!
                                </p>
                                {isOwnProfile && (
                                    <Link to="/upload" className="btn-primary">Upload Now</Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {
                isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !updating && setIsEditing(false)} />
                        <div className="relative bg-card w-full max-w-md rounded-3xl border border-white/10 shadow-2xl animate-scale-in overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="font-heading text-xl font-bold">Edit Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Username</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                                        <input
                                            type="text"
                                            value={editUsername}
                                            onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                                            className="input-dark pl-8"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Profile Picture Link</label>
                                    <input
                                        type="text"
                                        value={editAvatar}
                                        onChange={e => setEditAvatar(e.target.value)}
                                        className="input-dark"
                                        placeholder="https://... image link"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="input-dark"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio</label>
                                    <textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        className="input-dark resize-none h-28"
                                        placeholder="Tell others about your playing style..."
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/5 flex gap-3">
                                <button onClick={() => setIsEditing(false)} disabled={updating} className="flex-1 py-3 rounded-xl font-semibold hover:bg-white/5 transition-colors text-muted-foreground">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={updating}
                                    className="flex-[2] btn-primary flex items-center justify-center gap-2"
                                >
                                    {updating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
