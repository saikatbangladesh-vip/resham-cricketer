import { useState } from 'react';
import { Search as SearchIcon, Hash } from 'lucide-react';
import VideoFeed from '../components/VideoFeed';
import SEO from '../components/SEO';

export default function Explore() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen">
            <SEO title="Explore Cricket Highlights" description="Search and discover the best cricket moments, shots, and players in our community." />
            {/* Hero Search */}
            <div className="relative bg-brand-gradient border-b border-white/5 py-10 px-4 md:px-6">
                <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                        <SearchIcon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Discover Cricket</span>
                    </div>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                        Find Your Favourite <span className="text-gradient">Shots</span>
                    </h1>

                    <div className="relative max-w-xl mx-auto">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search players, shots, or moments..."
                            className="input-dark pl-12 pr-4 h-12 text-base rounded-2xl w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Feed */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Hash className="w-5 h-5 text-primary" />
                        <h2 className="font-heading text-xl font-bold">
                            All Clips
                        </h2>
                        {searchQuery && (
                            <span className="text-sm text-muted-foreground">
                                for "<span className="text-foreground font-medium">{searchQuery}</span>"
                            </span>
                        )}
                    </div>
                    <VideoFeed searchQuery={searchQuery} />
                </div>
            </div>
        </div>
    );
}
