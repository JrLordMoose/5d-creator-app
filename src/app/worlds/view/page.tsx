'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Share2,
    Download,
    MessageSquare,
    Map,
    BookOpen,
    Users,
    Scroll,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Client-side wrapper to access decoded params safely
export default function WorldProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WorldProfileContentWrapper />
        </Suspense>
    );
}

function WorldProfileContentWrapper() {
    const searchParams = useSearchParams();
    const [decodedId, setDecodedId] = useState<string>('');

    const id = searchParams.get('id');

    useEffect(() => {
        if (id) {
            setDecodedId(decodeURIComponent(id));
        }
    }, [id]);

    if (!decodedId) return null; // Wait for hydration

    return <WorldProfileContent id={decodedId} />;
}

function WorldProfileContent({ id }: { id: string }) {
    const router = useRouter();
    const world = useStore((state) => state.getWorld(id));

    if (!world) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-xl font-semibold mb-2">World Not Found</h2>
                <Button onClick={() => router.push('/worlds')} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    // Helper for content sections
    const ContentSection = ({
        title,
        icon: Icon,
        color,
        children
    }: {
        title: string;
        icon: any;
        color: string;
        children: React.ReactNode
    }) => (
        <div className="glass-card rounded-2xl p-6 mb-6 border-white/5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className={cn("p-2 rounded-lg", color.replace('text-', 'bg-').replace('500', '500/10'))}>
                    <Icon className={cn("h-5 w-5", color)} />
                </div>
                <h3 className="text-lg font-medium">{title}</h3>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );



    const handleExport = () => {
        if (!world) return;

        const content = `# ${world.name}
Genre: ${world.genre}
Tone: ${world.tone || 'N/A'}

## Description
${world.description}

## Rules & Systems
${world.rules?.map(r => `- ${r}`).join('\n') || 'N/A'}

## Societies
${world.societies?.map(s => `- ${s}`).join('\n') || 'N/A'}

## History
${world.history || 'N/A'}

## Geography
${world.geography || 'N/A'}
`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${world.name.replace(/\s+/g, '_')}_Lore.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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
                    <Button onClick={handleExport} variant="outline" className="glass h-9 text-xs">
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Export MD
                    </Button>
                    <Link href={`/chat?resume=${world.id}`}>
                        <Button className="bg-violet-600 hover:bg-violet-500 text-white h-9 text-xs">
                            <MessageSquare className="h-3.5 w-3.5 mr-2" />
                            Build with AI
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <div className="glass-card-interactive rounded-3xl p-8 mb-8 relative overflow-hidden group border-violet-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Placeholder */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 shadow-2xl shadow-violet-900/20 flex items-center justify-center shrink-0">
                        <Globe className="h-12 w-12 text-violet-400" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider border border-violet-500/20">
                                {world.genre}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-medium border border-white/10">
                                {world.tone || 'Undefined Tone'}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold mb-2 text-white inline-block">
                            {world.name}
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            {world.description || "A world waiting to be discovered."}
                        </p>

                        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Scroll className="h-4 w-4 text-violet-400" />
                                {world.rules?.length || 0} Core Rules
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>WID: <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">{world.id}</code></span>
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
                                    strokeDashoffset={226 - (226 * world.progress) / 100}
                                    className="text-violet-500 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-lg font-bold">{world.progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2-Column Grid for details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Core Rules / Magic System */}
                <ContentSection title="Rules & Systems" icon={BookOpen} color="text-violet-400">
                    <div className="space-y-4">
                        {world.rules?.length ? (
                            <ul className="space-y-3">
                                {world.rules.map((rule, i) => (
                                    <li key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <span className="h-6 w-6 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-6 italic">No rules defined.</div>
                        )}
                    </div>
                </ContentSection>

                {/* Societies / Factions */}
                <ContentSection title="Societies & Factions" icon={Users} color="text-fuchsia-400">
                    <div className="space-y-4">
                        {world.societies?.length ? (
                            <div className="grid gap-3">
                                {world.societies.map((society, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                                        <span className="text-sm font-medium">{society}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-6 italic">No societies recorded.</div>
                        )}
                    </div>
                </ContentSection>

                {/* Introduction / History */}
                <ContentSection title="History & Lore" icon={Scroll} color="text-amber-400">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {world.history || "The history of this world has been lost to time... or not yet written."}
                        </p>
                    </div>
                </ContentSection>

                {/* Geography */}
                <ContentSection title="Geography" icon={Map} color="text-emerald-400">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {world.geography || "The map is currently blank."}
                        </p>
                    </div>
                </ContentSection>

            </div>
        </div>
    );
}
