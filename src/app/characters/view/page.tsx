'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useCharacterStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Share2,
    Download,
    MessageSquare,
    Shield,
    Heart,
    Skull,
    Zap,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CharacterProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CharacterProfileContent />
        </Suspense>
    );
}

function CharacterProfileContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const character = useCharacterStore((state) =>
        state.characters.find(c => c.id === decodeURIComponent(id || ''))
    );

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-xl font-semibold mb-2">Character Not Found</h2>
                <Button onClick={() => router.push('/characters')} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    // Helper for phase sections
    const PhaseSection = ({
        title,
        phase,
        icon: Icon,
        color,
        onEdit,
        onWorkshop,
        children
    }: {
        title: string;
        phase: string;
        icon: any;
        color: string;
        onEdit: () => void;
        onWorkshop: () => void;
        children: React.ReactNode
    }) => (
        <div className="glass-card rounded-2xl p-6 mb-6 group/card transition-all hover:border-white/10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className={cn("p-2 rounded-lg", color.replace('text-', 'bg-').replace('400', '400/10'))}>
                    <Icon className={cn("h-5 w-5", color)} />
                </div>
                <h3 className="text-lg font-medium">{title}</h3>

                <div className="ml-auto flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Button onClick={onEdit} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </Button>
                    <Button onClick={onWorkshop} variant="ghost" size="sm" className={cn("h-7 px-2 text-[10px] font-medium gap-1.5", color.replace('text-', 'bg-').replace('400', '400/10'), color)}>
                        <Sparkles className="h-3 w-3" />
                        Refine
                    </Button>
                </div>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const handleExport = () => {
        if (!character) return;

        const content = `# ${character.name}
Role: ${character.role}
Genre: ${character.genre}
Archetype: ${character.archetype || 'N/A'}

## Core Concept
${character.coreConcept || 'N/A'}

## Personality (Phase 2)
Motivations: ${character.motivations?.join(', ') || 'N/A'}
Flaws: ${character.flaws?.join(', ') || 'N/A'}

## Backstory (Phase 3)
Origin: ${character.origin || 'N/A'}
Ghost/Trauma: ${character.ghost || 'N/A'}

## Relationships (Phase 4)
Allies: ${character.allies?.join(', ') || 'N/A'}
Enemies: ${character.enemies?.join(', ') || 'N/A'}

## Arc (Phase 5)
Type: ${character.arcType || 'N/A'}
Climax: ${character.climax || 'N/A'}
`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${character.name.replace(/\s+/g, '_')}_Profile.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleManualEdit = (section: string) => {
        alert(`Manual editing for ${section} coming soon!`);
    };

    const handleWorkshop = (section: string) => {
        router.push(`/chat?mode=workshop&id=${encodeURIComponent(character.id)}&focus=${section.toLowerCase()}`);
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 pb-32">
            {/* ... (Keep Navigation & Hero) ... */}

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
                    <Button onClick={handleExport} variant="outline" className="glass h-9 text-xs">
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Export MD
                    </Button>
                    <Link href={`/chat?mode=chat_with&id=${encodeURIComponent(character.id)}`}>
                        <Button className="premium-button h-9 text-xs">
                            <MessageSquare className="h-3.5 w-3.5 mr-2" />
                            Chat with {character.name.split(' ')[0]}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <div className="glass-card-interactive rounded-3xl p-8 mb-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Placeholder */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl flex items-center justify-center shrink-0">
                        <span className="text-4xl font-bold text-white/20">
                            {character.name.charAt(0)}
                        </span>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
                                {character.role}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-medium border border-white/10">
                                {character.genre}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold mb-2 text-gradient-ember inline-block">
                            {character.name}
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            {character.coreConcept || "A character waiting to be defined."}
                        </p>

                        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-emerald-400" />
                                {character.archetype || "Unknown Archetype"}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>CID: <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">{character.id}</code></span>
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                <circle
                                    cx="40" cy="40" r="36"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={226}
                                    strokeDashoffset={226 - (226 * character.progress) / 100}
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-lg font-bold">{character.progress}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Complete</span>
                    </div>
                </div>
            </div>

            {/* 2-Column Grid for details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Phase 2: Personality */}
                <PhaseSection
                    title="Personality Matrix"
                    phase="Phase 2"
                    icon={Heart}
                    color="text-blue-400"
                    onEdit={() => handleManualEdit('Personality')}
                    onWorkshop={() => handleWorkshop('Personality')}
                >
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Motivations</h4>
                            {character.motivations?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {character.motivations.map((m, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            ) : <span className="text-sm text-muted-foreground italic">Not defined yet</span>}
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Flaws & Shadows</h4>
                            {character.flaws?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {character.flaws.map((f, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 text-sm border border-red-500/20">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            ) : <span className="text-sm text-muted-foreground italic">Not defined yet</span>}
                        </div>
                    </div>
                </PhaseSection>

                {/* Phase 3: Backstory */}
                <PhaseSection
                    title="Backstory & Origin"
                    phase="Phase 3"
                    icon={Skull}
                    color="text-violet-400"
                    onEdit={() => handleManualEdit('Backstory')}
                    onWorkshop={() => handleWorkshop('Backstory')}
                >
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                            <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">The Ghost (Trauma)</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {character.ghost || "No psychological wound defined yet."}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Origin Story</h4>
                            <p className="text-sm leading-relaxed">
                                {character.origin || "The beginning of their journey remains a mystery."}
                            </p>
                        </div>
                    </div>
                </PhaseSection>

                {/* Phase 4: Relationships */}
                <PhaseSection
                    title="Relationship Web"
                    phase="Phase 4"
                    icon={Zap}
                    color="text-pink-400"
                    onEdit={() => handleManualEdit('Relationships')}
                    onWorkshop={() => handleWorkshop('Relationships')}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Allies</h4>
                            <ul className="space-y-2">
                                {character.allies?.length ? character.allies.map((a, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        {a}
                                    </li>
                                )) : <li className="text-sm text-muted-foreground italic">No allies listed</li>}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Enemies</h4>
                            <ul className="space-y-2">
                                {character.enemies?.length ? character.enemies.map((e, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        {e}
                                    </li>
                                )) : <li className="text-sm text-muted-foreground italic">No enemies listed</li>}
                            </ul>
                        </div>
                    </div>
                </PhaseSection>

                {/* Phase 5: Arc */}
                <PhaseSection
                    title="Narrative Arc"
                    phase="Phase 5"
                    icon={Sparkles}
                    color="text-orange-400"
                    onEdit={() => handleManualEdit('Arc')}
                    onWorkshop={() => handleWorkshop('Arc')}
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
                            <span className="text-sm text-muted-foreground">Arc Type</span>
                            <span className="font-medium text-orange-400">{character.arcType || "Undefined"}</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Climax Resolution</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {character.climax || "The final confrontation has not been written."}
                            </p>
                        </div>
                    </div>
                </PhaseSection>

            </div>
        </div>
    );
}
