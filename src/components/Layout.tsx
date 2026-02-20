import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Upload, User, Search, Bell, LogOut, Video, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

export default function Layout() {
    const { user, userProfile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/explore', label: 'Explore', icon: Search },
        { path: '/notifications', label: 'Alerts', icon: Bell },
        { path: '/manage-videos', label: 'My Clips', icon: Video },
        { path: `/profile/${user?.uid}`, label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
            {/* Mobile Top Bar */}
            <header className="md:hidden sticky top-0 z-50 glass border-b border-white/5 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="font-heading font-bold text-lg text-gradient">Resham</span>
                </div>
                <div className="flex items-center gap-1">
                    <Link to="/notifications" className={`p-2 rounded-xl transition-colors ${isActive('/notifications') ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                        <Bell className="w-5 h-5" />
                    </Link>
                    <button onClick={handleLogout} className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 fixed h-full z-40 glass border-r border-white/5">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg glow-primary">
                            <Zap className="w-5 h-5 text-white fill-current" />
                        </div>
                        <div>
                            <div className="font-heading font-bold text-xl text-gradient leading-none">Resham</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Cricketer v2</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${active
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                                <span>{item.label}</span>
                                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />}
                            </Link>
                        );
                    })}

                    {/* Upload CTA */}
                    <div className="pt-4">
                        <Link
                            to="/upload"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 bg-primary text-white hover:opacity-90 active:scale-95"
                            style={{ boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                        >
                            <Upload className="w-5 h-5" />
                            <span>Upload Clip</span>
                        </Link>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5">
                    {user && (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-muted overflow-hidden border border-white/10 shrink-0">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/20 font-bold text-primary text-sm">
                                        {(userProfile?.displayName || user.email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">{userProfile?.displayName || 'Player'}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-200 text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 flex items-center justify-around px-2 h-16 safe-area-bottom">
                {[
                    { path: '/', icon: Home },
                    { path: '/explore', icon: Search },
                    { path: '/upload', icon: Upload, special: true },
                    { path: '/manage-videos', icon: Video },
                    { path: user ? `/profile/${user.uid}` : '/login', icon: User },
                ].map((item) => {
                    if (item.special) {
                        return (
                            <Link key={item.path} to={item.path} className="relative -top-5 p-4 bg-primary rounded-2xl text-white shadow-lg glow-primary active:scale-95 transition-transform">
                                <item.icon className="w-5 h-5" />
                            </Link>
                        );
                    }
                    const active = isActive(item.path);
                    return (
                        <Link key={item.path} to={item.path} className={`p-3 rounded-xl transition-all duration-200 ${active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}>
                            <item.icon className="w-5 h-5" />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
