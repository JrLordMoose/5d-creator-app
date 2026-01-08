'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ProjectCard } from '@/components/project';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Folder, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
    const { projects, characters, worlds, addProject, deleteProject, addCharacter, addWorld } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateDemo = () => {
        const pid = '#ECHO_PROJECT';

        addProject({
            id: pid,
            name: 'The Last Echo',
            genre: 'Sci-Fi Mystery',
            summary: 'A detective story set in a world where memories can be traded like currency.',
            progress: 25,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Add linked Character
        addCharacter({
            id: '#KAI_ECHO',
            name: 'Kai Valerius',
            role: 'Protagonist',
            genre: 'Sci-Fi Noir',
            projectId: pid,
            progress: 40,
            phase: 'Personality',
            coreConcept: 'A memory broker who lost his own past.',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Add linked World
        addWorld({
            id: '@ECHO_CITY',
            name: 'Mnemosyne City',
            genre: 'Cyberpunk',
            description: 'The city that never forgets, built on layers of server banks.',
            projectId: pid,
            progress: 60,
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
                        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-cyan-500 to-teal-500" />
                        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
                    </div>
                    <p className="text-muted-foreground text-base ml-5">
                        Organize your stories, campaigns, and universes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/chat?mode=project">
                        <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
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
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full premium-input pl-10 focus:border-cyan-500/50"
                    />
                </div>
                <Button variant="outline" className="glass gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            characterCount={characters.filter(c => c.projectId === project.id).length}
                            worldCount={worlds.filter(w => w.projectId === project.id).length}
                            onDelete={deleteProject}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6">
                        <Folder className="h-10 w-10 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        {searchQuery
                            ? `No results for "${searchQuery}". Try a different search term.`
                            : "Start by creating a new story project to organize your work."}
                    </p>
                    <div className="flex gap-4">
                        {searchQuery ? (
                            <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCreateDemo} className="glass">
                                    Load Demo Data
                                </Button>
                                <Link href="/chat?mode=project">
                                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
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
