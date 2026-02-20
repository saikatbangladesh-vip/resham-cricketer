import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link2, Image, FileText, Zap, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

async function createNotification(data: {
    type: 'upload' | 'like';
    actorId: string;
    actorName: string;
    actorAvatar: string | null;
    videoId: string;
    videoTitle: string;
    targetUserId: string; // 'all' for global
}) {
    await addDoc(collection(db, 'notifications'), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60';

function validateGdriveLink(url: string): boolean {
    return url.includes('drive.google.com');
}

const STEPS = [
    { label: 'Video Link', icon: Link2 },
    { label: 'Details', icon: FileText },
    { label: 'Publish', icon: Zap },
];

export default function Upload() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    const handlePublish = async () => {
        if (!user) { toast.error('You must be logged in'); return; }
        if (!validateGdriveLink(videoUrl)) { toast.error('Please enter a valid Google Drive link'); return; }
        if (!title.trim()) { toast.error('Please add a title'); return; }

        setUploading(true);
        const loadingToast = toast.loading('Publishing your clip...');
        try {
            const videoRef = await addDoc(collection(db, 'videos'), {
                title: title.trim(),
                description: description.trim(),
                url: videoUrl,
                thumbnailUrl: thumbnailUrl || DEFAULT_THUMBNAIL,
                uploaderId: user.uid,
                uploaderName: user.displayName || user.email || 'Player',
                uploaderAvatar: user.photoURL || null,
                views: 0,
                likes: 0,
                status: 'live',
                createdAt: serverTimestamp(),
            });
            // Notify everyone about the new upload
            await createNotification({
                type: 'upload',
                actorId: user.uid,
                actorName: user.displayName || user.email || 'A player',
                actorAvatar: user.photoURL || null,
                videoId: videoRef.id,
                videoTitle: title.trim(),
                targetUserId: 'all',
            });
            toast.dismiss(loadingToast);
            toast.success('Clip published! 🏏');
            navigate('/');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to publish. Please try again.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const canNext = () => {
        if (step === 0) return validateGdriveLink(videoUrl);
        if (step === 1) return title.trim().length > 0;
        return true;
    };

    return (
        <div className="min-h-screen bg-brand-gradient">
            <div className="relative max-w-2xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Share Your Moment</span>
                    </div>
                    <h1 className="font-heading text-3xl font-bold">Upload a Clip</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Share your cricket highlights with the world</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-0 mb-10">
                    {STEPS.map((s, i) => (
                        <div key={s.label} className="flex items-center">
                            <button
                                onClick={() => i < step && setStep(i)}
                                className={`flex flex-col items-center gap-1 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${i === step ? 'bg-primary border-primary text-white'
                                    : i < step ? 'bg-primary/20 border-primary/40 text-primary'
                                        : 'bg-white/5 border-white/10 text-muted-foreground'
                                    }`}>
                                    {i < step ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {s.label}
                                </span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`w-16 h-0.5 mx-2 mb-4 transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="glass rounded-3xl border border-white/5 p-6 md:p-8 animate-fade-in">
                    {step === 0 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-heading text-xl font-bold mb-1">Paste your video link</h2>
                                <p className="text-muted-foreground text-sm">Share a Google Drive video link (make sure it's accessible to "Anyone with the link")</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                    Google Drive Video URL *
                                </label>
                                <div className="relative">
                                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        className="input-dark pl-11"
                                        placeholder="https://drive.google.com/file/d/..."
                                        value={videoUrl}
                                        onChange={e => setVideoUrl(e.target.value)}
                                    />
                                </div>
                                {videoUrl && !validateGdriveLink(videoUrl) && (
                                    <p className="text-red-400 text-xs mt-2">⚠️ Please enter a valid Google Drive link.</p>
                                )}
                                {videoUrl && validateGdriveLink(videoUrl) && (
                                    <p className="text-primary text-xs mt-2 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Valid Google Drive link!
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                    Thumbnail URL <span className="normal-case font-normal text-muted-foreground">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        className="input-dark pl-11"
                                        placeholder="https://... (leave blank for default)"
                                        value={thumbnailUrl}
                                        onChange={e => setThumbnailUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="rounded-2xl overflow-hidden border border-white/5 bg-muted aspect-video flex items-center justify-center">
                                {thumbnailUrl ? (
                                    <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" onError={() => setThumbnailUrl('')} />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Thumbnail preview</p>
                                    </div>
                                )}
                            </div>

                            {/* GDrive tutorial */}
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-xs text-blue-300 leading-relaxed">
                                <p className="font-bold mb-1">📖 How to get a shareable Google Drive link:</p>
                                <ol className="list-decimal list-inside space-y-1 text-blue-300/80">
                                    <li>Upload your video to Google Drive</li>
                                    <li>Right-click → Share → Change access to "Anyone with the link"</li>
                                    <li>Click "Copy link" and paste it above</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-heading text-xl font-bold mb-1">Add clip details</h2>
                                <p className="text-muted-foreground text-sm">Help others discover your highlight</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title *</label>
                                <input
                                    type="text"
                                    className="input-dark"
                                    placeholder="e.g. Perfect Cover Drive — Practice Session"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    maxLength={100}
                                />
                                <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/100</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description <span className="normal-case font-normal">(optional)</span></label>
                                <textarea
                                    className="input-dark resize-none h-32"
                                    placeholder="Describe the shot, the context, the tournament..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-heading text-xl font-bold mb-1">Ready to publish!</h2>
                                <p className="text-muted-foreground text-sm">Review your clip before going live</p>
                            </div>

                            {/* Preview Card */}
                            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                                <div className="aspect-video bg-muted">
                                    <img
                                        src={thumbnailUrl || DEFAULT_THUMBNAIL}
                                        alt="thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-base">{title}</h3>
                                    {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="w-6 h-6 rounded-lg bg-primary/20 overflow-hidden">
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary text-[10px] font-bold">
                                                    {(user?.displayName || 'U')[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{user?.displayName || 'You'}</span>
                                        <span className="ml-auto text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">Live</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePublish}
                                disabled={uploading}
                                className="btn-primary w-full h-13 flex items-center justify-center gap-2 text-base font-bold"
                            >
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-current" />
                                        Publish Clip
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className={`flex gap-3 mt-8 ${step === 0 ? 'justify-end' : 'justify-between'}`}>
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}
                        {step < STEPS.length - 1 && (
                            <button
                                onClick={() => canNext() && setStep(s => s + 1)}
                                disabled={!canNext()}
                                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
