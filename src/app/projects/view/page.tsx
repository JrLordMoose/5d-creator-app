'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/character';
import { WorldCard } from '@/components/world';
import {
    ArrowLeft,
    Share2,
    Download,
    Settings,
    Plus,
    Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectProfileContent />
        </Suspense>
    );
}

function ProjectProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [decodedId, setDecodedId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'worlds'>('overview');

    const id = searchParams.get('id');

    useEffect(() => {
        if (id) {
            setDecodedId(decodeURIComponent(id));
        }
    }, [id]);

    const { getProject, characters, worlds, deleteProject } = useStore();

    if (!decodedId) return null;

    const project = getProject(decodedId);

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                <Button onClick={() => router.push('/projects')} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const projectCharacters = characters.filter(c => c.projectId === project.id);
    const projectWorlds = worlds.filter(w => w.projectId === project.id);

    return (
        <div className="min-h-screen p-8 lg:p-12 pb-32">
            {/* Navigation */}
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                </button>

                <div className="flex gap-3">
                    <Button variant="outline" className="glass h-9 text-xs">
                        <Share2 className="h-3.5 w-3.5 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" className="glass h-9 text-xs">
                        <Settings className="h-3.5 w-3.5 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Folder className="h-12 w-12 text-cyan-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/20">
                            {project.genre}
                        </span>
                        <span className="text-sm text-muted-foreground">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 text-white">{project.name}</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        {project.summary}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/5 mb-8">
                {(['overview', 'characters', 'worlds'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "pb-4 text-sm font-medium capitalize transition-colors relative",
                            activeTab === tab ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Stats Card */}
                        <div className="glass-card rounded-2xl p-6 border-cyan-500/10">
                            <h3 className="text-lg font-medium mb-4">Project Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/[0.03]">
                                    <span className="text-2xl font-bold text-white block mb-1">{projectCharacters.length}</span>
                                    <span className="text-sm text-muted-foreground">Characters</span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03]">
                                    <span className="text-2xl font-bold text-white block mb-1">{projectWorlds.length}</span>
                                    <span className="text-sm text-muted-foreground">Worlds</span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03]">
                                    <span className="text-2xl font-bold text-cyan-400 block mb-1">{project.progress}%</span>
                                    <span className="text-sm text-muted-foreground">Completion</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'characters' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Cast of Characters</h3>
                            <Link href="/chat?mode=character">
                                <Button className="premium-button h-8 text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-2" />
                                    Add Character
                                </Button>
                            </Link>
                        </div>

                        {projectCharacters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projectCharacters.map(char => (
                                    <CharacterCard
                                        key={char.id}
                                        character={char}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground glass-card rounded-2xl">
                                No characters assigned to this project yet.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'worlds' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Worlds & Settings</h3>
                            <Link href="/chat?mode=world">
                                <Button className="bg-violet-600 hover:bg-violet-500 text-white h-8 text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-2" />
                                    Add World
                                </Button>
                            </Link>
                        </div>

                        {projectWorlds.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projectWorlds.map(world => (
                                    <WorldCard
                                        key={world.id}
                                        world={world}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground glass-card rounded-2xl">
                                No worlds assigned to this project yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
