'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Choice {
    id: string;
    label: string;
    description?: string;
    icon?: string;
}

interface ChoiceModalProps {
    title: string;
    choices: Choice[];
    onSelect: (choice: Choice) => void;
    onClose: () => void;
    allowCustom?: boolean;
    customPlaceholder?: string;
}

export function ChoiceModal({
    title,
    choices,
    onSelect,
    onClose,
    allowCustom = true,
    customPlaceholder = "Or type your own...",
}: ChoiceModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Choices Grid */}
                <div className="grid gap-3 mb-4">
                    {choices.map((choice) => (
                        <button
                            key={choice.id}
                            onClick={() => onSelect(choice)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl",
                                "bg-white/[0.03] hover:bg-white/[0.08]",
                                "border border-white/5 hover:border-primary/30",
                                "transition-all duration-200",
                                "group"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {choice.icon && (
                                    <span className="text-2xl">{choice.icon}</span>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                        {choice.label}
                                    </p>
                                    {choice.description && (
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {choice.description}
                                        </p>
                                    )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-primary">Select →</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Custom Input Option */}
                {allowCustom && (
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-xs text-muted-foreground mb-2">Or enter your own:</p>
                        <input
                            type="text"
                            placeholder={customPlaceholder}
                            className="w-full premium-input text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    onSelect({
                                        id: 'custom',
                                        label: e.currentTarget.value.trim(),
                                    });
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Inline choice chips (for within messages)
interface ChoiceChipsProps {
    choices: Choice[];
    onSelect: (choice: Choice) => void;
}

export function ChoiceChips({ choices, onSelect }: ChoiceChipsProps) {
    return (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            {choices.map((choice) => (
                <button
                    key={choice.id}
                    onClick={() => onSelect(choice)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium",
                        "bg-white/[0.03] hover:bg-primary/20",
                        "border border-white/10 hover:border-primary/40",
                        "text-muted-foreground hover:text-primary",
                        "transition-all duration-200"
                    )}
                >
                    {choice.icon && <span className="mr-2">{choice.icon}</span>}
                    {choice.label}
                </button>
            ))}
        </div>
    );
}
