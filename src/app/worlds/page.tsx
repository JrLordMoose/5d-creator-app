'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { WorldCard } from '@/components/world';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';

export default function WorldsPage() {
    const { worlds, deleteWorld, addWorld } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWorlds = worlds.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateDemo = () => {
        addWorld({
            id: '@VIRELITH_501',
            name: 'Virelith',
            genre: 'Dark Fantasy',
            description: 'A shattered world where islands float in an abyss of eternal twilight, connected only by skyships and ancient portals.',
            progress: 65,
            tone: 'Melancholic, Dangerous',
            rules: ['Gravity is variable', 'Magic consumes life force', 'Sunlight burns immediately'],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        addWorld({
            id: '@NEON_PRIME',
            name: 'Neon Prime',
            genre: 'Cyberpunk',
            description: 'A sprawling mega-city covering an entire moon, ruled by AI corporations and underground data-runners.',
            progress: 30,
            tone: 'High-Tech, Low-Life',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    };

    return (
        <div className="min-h-screen p-8 lg:p-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                        <h1 className="text-3xl font-semibold tracking-tight">Worlds</h1>
                    </div>
                    <p className="text-muted-foreground text-base ml-5">
                        Design your settings, lore, and magic systems
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/chat?mode=world">
                        <Button className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                            <Plus className="h-4 w-4 mr-2" />
                            New World
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search worlds by name or genre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full premium-input pl-10 focus:border-violet-500/50"
                    />
                </div>
                <Button variant="outline" className="glass gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Grid */}
            {filteredWorlds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWorlds.map((world) => (
                        <WorldCard
                            key={world.id}
                            world={world}
                            onDelete={deleteWorld}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mb-6">
                        <Globe className="h-10 w-10 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No worlds found</h3>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        {searchQuery
                            ? `No results for "${searchQuery}". Try a different search term.`
                            : "Start by creating a new world or generating one with AI."}
                    </p>
                    <div className="flex gap-4">
                        {searchQuery ? (
                            <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCreateDemo} className="glass">
                                    Load Demo Data
                                </Button>
                                <Link href="/chat?mode=world">
                                    <Button className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Create with AI
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
