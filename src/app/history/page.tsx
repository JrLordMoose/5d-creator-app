'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Search, MessageSquare, Calendar, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSession } from '@/types/chat';

export default function HistoryPage() {
    const router = useRouter();
    const { chatSessions, deleteChatSession } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSessions = useMemo(() => {
        if (!searchQuery) return chatSessions;
        const q = searchQuery.toLowerCase();
        return chatSessions.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.lastMessage.toLowerCase().includes(q)
        );
    }, [chatSessions, searchQuery]);

    const groupedSessions = useMemo(() => {
        const groups: Record<string, ChatSession[]> = {
            'Today': [],
            'Yesterday': [],
            'Last 7 Days': [],
            'Older': []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;
        const last7Days = today - 86400000 * 7;

        filteredSessions.forEach(session => {
            const date = new Date(session.updatedAt).getTime();
            if (date >= today) {
                groups['Today'].push(session);
            } else if (date >= yesterday) {
                groups['Yesterday'].push(session);
            } else if (date >= last7Days) {
                groups['Last 7 Days'].push(session);
            } else {
                groups['Older'].push(session);
            }
        });

        return groups;
    }, [filteredSessions]);

    const handleSessionClick = (id: string) => {
        router.push(`/chat?sessionId=${id}`);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
            deleteChatSession(id);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-foreground p-6 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] opacity-20" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[128px] opacity-20" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        <Clock className="w-8 h-8 text-primary" />
                        Chat History
                    </h1>
                    <p className="text-muted-foreground mt-1 ml-11 text-sm">Resume your previous creative sessions</p>
                </div>

                <div className="relative w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm 
                                   focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 
                                   transition-all placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-10">
                {Object.entries(groupedSessions).map(([group, sessions]) => (
                    sessions.length > 0 && (
                        <div key={group} className="mb-10">
                            <h2 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                {group}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSessionClick(session.id)}
                                        className="group relative bg-zinc-900/40 hover:bg-zinc-900/60 backdrop-blur-sm border border-white/5 hover:border-primary/30 
                                                   rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 
                                                   cursor-pointer flex flex-col h-[200px] overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-2 flex-shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg bg-gradient-to-br ${session.mode === 'world' ? 'from-purple-500/20 to-blue-500/20 text-purple-400' :
                                                        session.mode === 'character' ? 'from-orange-500/20 to-red-500/20 text-orange-400' :
                                                            'from-emerald-500/20 to-teal-500/20 text-emerald-400'
                                                    }`}>
                                                    {session.mode === 'world' ? <Calendar className="w-4 h-4" /> :
                                                        session.mode === 'character' ? <MessageSquare className="w-4 h-4" /> :
                                                            <MessageSquare className="w-4 h-4" />}
                                                </div>
                                                <span className="text-xs font-semibold px-2 py-1 bg-white/5 rounded-md capitalize text-zinc-400 border border-white/5">
                                                    {session.mode}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200"
                                                title="Delete Chat"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="font-bold text-lg text-white/90 line-clamp-1 mb-2 group-hover:text-primary transition-colors flex-shrink-0 pb-1">
                                            {session.title || 'Untitled Conversation'}
                                        </h3>

                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-auto leading-relaxed">
                                            {session.lastMessage}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-zinc-500 mt-3 pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors flex-shrink-0">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDate(session.updatedAt)}
                                            </span>
                                            <div className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                Resume
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>

                                        {/* Hover Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}

                {filteredSessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No history found</h3>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            Start a new conversation to see it listed here. Your creative journey begins with a single prompt.
                        </p>
                        <Button
                            onClick={() => router.push('/chat')}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        >
                            Start New Chat
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
