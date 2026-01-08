'use client';

import { Project } from '@/types/project';
import { cn } from '@/lib/utils';
import { Folder, MoreHorizontal, Edit, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
    project: Project;
    characterCount: number;
    worldCount: number;
    onDelete?: (id: string) => void;
}

export function ProjectCard({ project, characterCount, worldCount, onDelete }: ProjectCardProps) {
    const progressPercent = project.progress;
    const encodedId = encodeURIComponent(project.id);

    return (
        <div className="glass-card-interactive group relative rounded-2xl overflow-hidden shine border-cyan-500/10 hover:border-cyan-500/30">
            {/* Main Card Link Overlay */}
            <Link href={`/projects/view?id=${encodedId}`} className="absolute inset-0 z-0" aria-label={`View ${project.name}`} />

            {/* Background with Cyan Tint */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0A0A0F]/90 to-[#0A0A0F] pointer-events-none" />
            <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <div className="w-full h-full bg-[linear-gradient(45deg,rgba(6,182,212,0.1),transparent_70%)]" />
            </div>

            <div className="relative z-10 p-5 flex flex-col h-full pointer-events-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-medium uppercase tracking-wide">
                        {project.genre}
                    </div>
                    <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Folder className="h-4 w-4 text-cyan-500" />
                        <h3 className="text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                            {project.name}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {project.summary}
                    </p>

                    {/* Elements Preview */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs px-2 py-1 rounded-md bg-white/[0.03] text-muted-foreground border border-white/5">
                            {characterCount} Characters
                        </span>
                        <span className="text-xs px-2 py-1 rounded-md bg-white/[0.03] text-muted-foreground border border-white/5">
                            {worldCount} Worlds
                        </span>
                    </div>
                </div>

                {/* Footer / Progress */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                        <span>Overall Progress</span>
                        <span className="text-cyan-400 font-medium">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-teal-400 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Actions Hover */}
                    <div className="absolute bottom-5 right-5 flex gap-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto z-20">
                        <Link href={`/projects/view?id=${encodedId}`}>
                            <button className="p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20">
                                <Edit className="h-4 w-4" />
                            </button>
                        </Link>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(project.id);
                                }}
                                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
