'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/store';
import { CharacterCard } from '@/components/character';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Sparkles, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function CharactersPage() {
    const { characters, deleteCharacter, addCharacter } = useCharacterStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCharacters = characters.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateDemo = () => {
        addCharacter({
            id: '#ELARA_902',
            name: 'Elara Vance',
            role: 'Protagonist',
            genre: 'Cyberpunk Noir',
            progress: 45,
            phase: 'Personality',
            coreConcept: 'A memory courier who can\'t forget her own past.',
            archetype: 'The Reluctant Hero',
            motivations: ['Find her sister', 'Expose the corporation', 'Survive'],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        addCharacter({
            id: '#KAEL_105',
            name: 'Kaelen Thorne',
            role: 'Antagonist',
            genre: 'High Fantasy',
            progress: 80,
            phase: 'Arc',
            coreConcept: 'A fallen paladin seeking redemption through chaos.',
            archetype: 'The Tragic Villain',
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
                        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-primary/40" />
                        <h1 className="text-3xl font-semibold tracking-tight">Characters</h1>
                    </div>
                    <p className="text-muted-foreground text-base ml-5">
                        Manage your cast and track their development arcs
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/chat?mode=character">
                        <Button className="premium-button">
                            <Plus className="h-4 w-4 mr-2" />
                            New Character
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
                        placeholder="Search characters by name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full premium-input pl-10"
                    />
                </div>
                <Button variant="outline" className="glass gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Grid */}
            {filteredCharacters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCharacters.map((character) => (
                        <CharacterCard
                            key={character.id}
                            character={character}
                            onDelete={deleteCharacter}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-6">
                        <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No characters found</h3>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        {searchQuery
                            ? `No results for "${searchQuery}". Try a different search term.`
                            : "Start your journey by creating your first character or generating one with AI."}
                    </p>
                    <div className="flex gap-4">
                        {searchQuery ? (
                            <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCreateDemo} className="glass">
                                    Load Demo Data
                                </Button>
                                <Link href="/chat?mode=character">
                                    <Button className="premium-button">
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
