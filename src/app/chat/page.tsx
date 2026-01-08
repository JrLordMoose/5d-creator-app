'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, Menu, Sparkles, User, Globe, FileText, ChevronRight, X, Command, RefreshCw, Trash2, MoreVertical, AlertCircle, Save, Settings, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChoiceChips, type Choice } from '@/components/chat/ChoiceModal';
import { CommandTutorialModal } from '@/components/chat/CommandTutorialModal';
import { useStore } from '@/lib/store';

import { ChatSession, Message } from '@/types/chat';

// Parse choices from AI response
function parseChoices(content: string): { cleanContent: string; choices: Choice[] } {
    const choices: Choice[] = [];
    let cleanContent = content;

    const choiceMatch = content.match(/\[CHOICES:\s*(.+?)\]/i);
    if (choiceMatch) {
        const options = choiceMatch[1].split('|').map(s => s.trim());
        options.forEach((opt, idx) => {
            choices.push({
                id: `choice-${idx}`,
                label: opt,
            });
        });
        cleanContent = content.replace(choiceMatch[0], '').trim();
    }

    const numberedPattern = /(?:Choose one|Select|Pick).*?:\s*\n((?:\d+\.\s*.+\n?)+)/i;
    const numberedMatch = content.match(numberedPattern);
    if (numberedMatch && !choices.length) {
        const lines = numberedMatch[1].split('\n').filter(l => /^\d+\./.test(l.trim()));
        lines.forEach((line, idx) => {
            const text = line.replace(/^\d+\.\s*/, '').trim();
            if (text) {
                choices.push({
                    id: `choice-${idx}`,
                    label: text,
                });
            }
        });
    }

    return { cleanContent, choices };
}

const AVAILABLE_COMMANDS = [
    { id: 'generate-basic', label: '/generate basic', description: 'Quick 5-7 question character', icon: User },
    { id: 'generate-advanced', label: '/generate advanced', description: 'Full 5-phase development', icon: User },
    { id: 'worldbio', label: '/worldbio', description: 'Create a world setting', icon: Globe },
    { id: 'menu', label: '/menu', description: 'See all commands', icon: Command },
    { id: 'help', label: '/help', description: 'Get usage details', icon: AlertCircle },
    { id: 'simulate', label: '/simulate', description: 'Stress-test in scenarios', icon: Sparkles },
    { id: 'analyze', label: '/analyze', description: 'Expert framework review', icon: Search },
];

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading chat...</div>}>
            <ChatContent />
        </Suspense>
    );
}

function ChatContent() {
    const {
        characters,
        worlds,
        addChatSession,
        updateChatSession,
        getChatSession,
        chatSessions,
        addCharacter,
        updateCharacter,
        addWorld,
        updateWorld,
        activeCharacterId,
        activeWorldId,
        activeProjectId
    } = useStore();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const promptParam = searchParams.get('prompt');
    const sessionIdParam = searchParams.get('sessionId');
    const targetIdParam = searchParams.get('id'); // ID if editing/workshop



    // State
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Welcome to 5D Character Creator! 🎭

I'm your AI partner for building deep, psychologically rich characters.

**Quick Commands:**
• \`/generate basic\` — Quick 5-7 question character
• \`/generate advanced\` — Full 5-phase development
• \`/worldbio\` — Create a world setting
• \`/menu\` — See all commands

What would you like to create today?`,
            choices: [
                { id: 'basic', label: '🎭 Create Character', description: 'Quick 5-7 questions' },
                { id: 'world', label: '🌍 Build World', description: 'Create a setting' },
                { id: 'menu', label: '📋 See Commands', description: 'View all options' },
            ],
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [showCommandTutorial, setShowCommandTutorial] = useState(false);
    const [activePersona, setActivePersona] = useState<string | null>(null);

    const [apiConfig, setApiConfig] = useState<{
        provider: string;
        anthropicKey: string;
        openaiKey: string;
    } | null>(null);

    // Mention & Command State
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [commandQuery, setCommandQuery] = useState<string | null>(null);
    const [cursorIndex, setCursorIndex] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const autoStartRef = useRef(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Load API config from localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem('5d-api-config');
        if (savedConfig) {
            try {
                setApiConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Failed to parse config:', e);
            }
        }
    }, []);

    const currentApiKey = apiConfig?.provider === 'openai'
        ? apiConfig?.openaiKey
        : apiConfig?.anthropicKey;

    const hasApiKey = !!currentApiKey;

    // Restore Chat Session
    useEffect(() => {
        if (sessionIdParam) {
            // Check store (reactive to hydration updates)
            const session = chatSessions.find(s => s.id === sessionIdParam);
            if (session) {
                // Determine if we should restore (if messages are different or activeSessionId mismatch)
                if (activeSessionId !== session.id) {
                    // Only restore if we have valid messages, otherwise fallback to welcome is fine (default state)
                    if (session.messages && session.messages.length > 0) {
                        setMessages(session.messages);
                        setActiveSessionId(session.id);
                    }
                }
            }
        }
    }, [sessionIdParam, chatSessions, activeSessionId]);

    const scrollToBottom = (instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    };

    useEffect(() => {
        // If we just loaded a session (messages changed and we have an ID), scroll instantly
        const isSessionLoad = activeSessionId && messages.length > 1;
        scrollToBottom(isSessionLoad ? true : false);
    }, [messages, activeSessionId]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleRestartChat = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: `Welcome to 5D Character Creator! 🎭

I'm your AI partner for building deep, psychologically rich characters.

**Quick Commands:**
• \`/generate basic\` — Quick 5-7 question character
• \`/generate advanced\` — Full 5-phase development
• \`/worldbio\` — Create a world setting
• \`/menu\` — See all commands

What would you like to create today?`,
                choices: [
                    { id: 'basic', label: '🎭 Create Character', description: 'Quick 5-7 questions' },
                    { id: 'world', label: '🌍 Build World', description: 'Create a setting' },
                    { id: 'menu', label: '📋 See Commands', description: 'View all options' },
                ],
            },
        ]);
        setActiveSessionId(null);
        window.history.pushState({}, '', '/chat');
    };

    const handleDeleteChat = () => {
        handleRestartChat();
    };

    const handleCommandsClick = () => {
        setShowCommandTutorial(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        const newCursorIndex = e.target.selectionStart || 0;
        setInput(value);
        setCursorIndex(newCursorIndex);

        const textBeforeCursor = value.slice(0, newCursorIndex);

        // Detect Commands
        const lastSlash = textBeforeCursor.lastIndexOf('/');
        if (lastSlash !== -1) {
            const isStart = lastSlash === 0;
            const isPrecededBySpace = lastSlash > 0 && textBeforeCursor[lastSlash - 1] === ' ';

            if (isStart || isPrecededBySpace) {
                const query = textBeforeCursor.slice(lastSlash + 1);
                if (!query.includes(' ')) {
                    setCommandQuery(query);
                    setMentionQuery(null);
                    return;
                }
            }
        }
        setCommandQuery(null);

        // Detect Mentions
        const lastAt = textBeforeCursor.lastIndexOf('@');
        if (lastAt !== -1) {
            const isStart = lastAt === 0;
            const isPrecededBySpace = lastAt > 0 && textBeforeCursor[lastAt - 1] === ' ';

            if (isStart || isPrecededBySpace) {
                const query = textBeforeCursor.slice(lastAt + 1);
                if (!query.includes(' ')) {
                    setMentionQuery(query);
                    setCommandQuery(null);
                    return;
                }
            }
        }
        setMentionQuery(null);
    };

    const handleMentionSelect = (item: { id: string; name: string; type: 'Character' | 'World' }) => {
        if (mentionQuery === null) return;

        const textBeforeCursor = input.slice(0, cursorIndex);
        const textAfterCursor = input.slice(cursorIndex);

        const lastAt = textBeforeCursor.lastIndexOf('@');
        const prefix = textBeforeCursor.slice(0, lastAt);

        const newValue = `${prefix}@${item.name} ${textAfterCursor}`;
        setInput(newValue);
        setMentionQuery(null);

        // Focus back
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const getFilteredMentions = () => {
        if (mentionQuery === null) return [];
        const q = mentionQuery.toLowerCase();

        const chars = characters
            .filter(c => c.name.toLowerCase().includes(q))
            .map(c => ({ ...c, type: 'Character' as const }));

        const wrlds = worlds
            .filter(w => w.name.toLowerCase().includes(q))
            .map(w => ({ ...w, type: 'World' as const }));

        return [...chars, ...wrlds].slice(0, 5); // Limit to 5
    };

    const handleCommandSelect = (cmd: typeof AVAILABLE_COMMANDS[0]) => {
        if (commandQuery === null) return;

        const textBeforeCursor = input.slice(0, cursorIndex);
        const textAfterCursor = input.slice(cursorIndex);

        const lastSlash = textBeforeCursor.lastIndexOf('/');
        const prefix = textBeforeCursor.slice(0, lastSlash);

        const newValue = `${prefix}${cmd.label} ${textAfterCursor}`;
        setInput(newValue);
        setCommandQuery(null);

        if (inputRef.current) inputRef.current.focus();
    };

    const getFilteredCommands = () => {
        if (commandQuery === null) return [];
        const q = commandQuery.toLowerCase();
        return AVAILABLE_COMMANDS.filter(c =>
            c.label.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        );
    };

    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading || !hasApiKey) return;

        // Augment message with context if mentions found
        let payloadContent = messageContent;
        const mentionsMatch = messageContent.match(/@(\w+)/g);

        if (mentionsMatch) {
            const mentionedNames = mentionsMatch.map(m => m.slice(1));
            const contextData: any[] = [];

            mentionedNames.forEach(name => {
                const char = characters.find(c => c.name === name);
                if (char) contextData.push({ type: 'Character', ...char });

                const world = worlds.find(w => w.name === name);
                if (world) contextData.push({ type: 'World', ...world });
            });

            if (contextData.length > 0) {
                payloadContent += `\n\n[SYSTEM: The user referenced the following attached data. Use this context to answer.]\n${JSON.stringify(contextData, null, 2)}`;
            }
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageContent.trim(),
        };

        const systemInstruction = `
        You are the 5D Character Creator AI.
        
        CRITICAL: When you have finished generating a full Character or World profile, you MUST include a special JSON block at the end of your response so the user can save it.
        
        For Characters:
        \`\`\`json:save:character
        {
          "name": "Full Name",
          "role": "Protagonist",
          "genre": "Sci-Fi",
          "coreConcept": "The main concept or hook",
          "archetype": "The specific archetype",
          "motivations": ["Primary Motivation", "Secondary Motivation"],
          "flaws": ["Major Flaw", "Minor Flaw"],
          "ghost": "The trauma or past event haunting them",
          "origin": "Brief origin story",
          "allies": ["Ally Name 1"],
          "enemies": ["Enemy Name 1"],
          "arcType": "The type of arc (e.g. Redemption)",
          "climax": "Predicted climax resolution",
          "progress": 50
        }
        \`\`\`
        
        For Worlds:
        \`\`\`json:save:world
        {
          "name": "World Name",
          "description": "World description...",
          "genre": "Fantasy",
          "tone": "Dark"
        }
        \`\`\`
        
        Do not output this block until the content is finalized.
        `;

        let effectiveInstruction = activePersona || systemInstruction;

        if (messageContent.trim().toLowerCase() === '/save') {
            effectiveInstruction = systemInstruction + `\n\n[SYSTEM: URGENT] The user wants to save the current progress immediately. Summarize all known details about the character/world into the JSON Save Block defined above. If some fields are missing, make best guesses or leave them as "Undefined". Output the JSON block NOW.`;
        }

        const userMessageWithContext: Message = {
            ...userMessage,
            content: payloadContent + "\n\n" + effectiveInstruction
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setMentionQuery(null);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessageWithContext].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    provider: apiConfig?.provider || 'anthropic',
                    apiKey: currentApiKey,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
            };

            setMessages(prev => [...prev, assistantMessage]);

            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullContent += chunk;

                    const { cleanContent, choices } = parseChoices(fullContent);

                    setMessages(prev =>
                        prev.map(m =>
                            m.id === assistantMessage.id
                                ? { ...m, content: cleanContent, choices: choices.length > 0 ? choices : undefined }
                                : m
                        )
                    );
                }
            }

            // Persistence: Update Session
            // Actually, we need to capture the final state of messages. 
            // Since setMessages is async, let's reconstruct it.
            // But wait, the streaming loop updates state. 
            // We should save AFTER the loop or periodically.
            // Let's save at the end of generation.

            const now = new Date();
            const cleanContentFinal = fullContent.replace(/\[CHOICES:.*?\]/i, '').trim(); // Simplified clean for summary

            if (!activeSessionId) {
                const newId = Date.now().toString();
                setActiveSessionId(newId);
                const title = messageContent.slice(0, 40) + (messageContent.length > 40 ? '...' : '');

                addChatSession({
                    id: newId,
                    title,
                    lastMessage: cleanContentFinal.slice(0, 100),
                    messages: [...messages, userMessage, { ...assistantMessage, content: fullContent }], // Approximation, ideally use functional state update result
                    createdAt: now,
                    updatedAt: now,
                    mode: (mode as any) || 'chat',
                    relatedId: activeCharacterId || activeWorldId || activeProjectId || undefined
                });
            } else {
                updateChatSession(activeSessionId, {
                    lastMessage: cleanContentFinal.slice(0, 100),
                    messages: [...messages, userMessage, { ...assistantMessage, content: fullContent }],
                    updatedAt: now
                });
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-start effect
    useEffect(() => {
        if (!hasApiKey || autoStartRef.current || isLoading) return;

        if (promptParam) {
            autoStartRef.current = true;
            sendMessage(decodeURIComponent(promptParam));
            return;
        }

        if (mode === 'chat_with' && searchParams.get('id')) {
            const charId = searchParams.get('id');
            const char = characters.find(c => c.id === charId);
            if (char) {
                autoStartRef.current = true;

                // Set Persona Context
                const persona = `
                [SYSTEM: ACT AS CHARACTER]
                You are now embodying the character "${char.name}".
                
                PROFILE:
                - Role: ${char.role}
                - Archetype: ${char.archetype}
                - Concept: ${char.coreConcept}
                - Motivations: ${char.motivations?.join(', ')}
                - Flaws: ${char.flaws?.join(', ')}
                - Voice/Tone: Stay in character. Use their vocabulary. Reflect their worldview.
                
                SCENARIO:
                The user is talking to you directly. Do not break character unless asked to [Generate Scene].
                `;

                setActivePersona(persona);

                setMessages([{
                    id: 'intro',
                    role: 'assistant',
                    content: `*${char.name} looks at you.* \n\n"Hello. What brings you to me?"`,
                    choices: [
                        { id: 'talk', label: '🗣️ Talk Directly', description: 'Interview the character' },
                        { id: 'scene', label: '🎬 Generate Scene', description: 'Put them in a situation' }
                    ]
                }]);
                return;
            }
        }

        if (mode === 'workshop' && searchParams.get('id') && searchParams.get('focus')) {
            const charId = searchParams.get('id');
            const focus = searchParams.get('focus');
            const char = characters.find(c => c.id === charId);

            if (char) {
                autoStartRef.current = true;

                let focusPrompt = "";
                let subPersona = "";

                switch (focus) {
                    case 'personality':
                        subPersona = "You are a Character Psychologist. Focus on motivations, flaws, and conflicting traits.";
                        focusPrompt = `Let's refine ${char.name}'s personality. What core drive or fear do you want to explore?`;
                        break;
                    case 'backstory':
                        subPersona = "You are a Biographer and Trauma Expert. Focus on childhood events, ghosts, and formative memories.";
                        focusPrompt = `Let's dig into ${char.name}'s past. What is the one memory that haunts them?`;
                        break;
                    case 'relationships':
                        subPersona = "You are a Sociologist. Focus on dynamics, rivalries, and alliances.";
                        focusPrompt = `Let's map out ${char.name}'s web of connections. Who do they trust the least?`;
                        break;
                    case 'arc':
                        subPersona = "You are a Master Storyteller. Focus on change, climax, and resolution.";
                        focusPrompt = `Let's structure ${char.name}'s journey. What is the lie they believe at the start?`;
                        break;
                }

                const persona = `
                [SYSTEM: WORKSHOP MODE]
                Target Character: ${char.name}
                Focus Area: ${focus?.toUpperCase()}
                
                ROLE: ${subPersona}
                
                GOAL: Ask probing questions to help the user flesh out this specific aspect of the character.
                Once the user provides enough info, offer updates in a JSON save block.
                `;

                setActivePersona(persona);

                setMessages([{
                    id: 'intro',
                    role: 'assistant',
                    content: `📝 **Workshop: ${focus?.charAt(0).toUpperCase() + focus!.slice(1)}**\n\n${focusPrompt}`,
                    choices: [
                        { id: 'brainstorm', label: '🧠 Brainstorm Ideas', description: 'Generate concepts' },
                        { id: 'critique', label: '🔍 Critique Current', description: 'Analyze existing data' }
                    ]
                }]);
                return;
            }
        }

        if (mode) {
            let command = '';
            switch (mode) {
                case 'character': command = '/generate basic'; break;
                case 'world': command = '/worldbio'; break;
                case 'scene': command = 'Help me write a scene involving my characters.'; break;
                case 'lore': command = 'I want to explore the history and lore of my world.'; break;
            }

            if (command) {
                autoStartRef.current = true;
                sendMessage(command);
            }
        }
    }, [mode, promptParam, hasApiKey, characters]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendMessage(input);
    };

    const handleChoiceSelect = (choice: Choice) => {
        const commandMap: Record<string, string> = {
            'basic': '/generate basic',
            'world': '/worldbio',
            'menu': '/menu',
        };

        const message = commandMap[choice.id] || choice.label;
        sendMessage(message);
    };

    const handleReload = async () => {
        if (messages.length < 2) return;
        const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
        if (lastUserIndex === -1) return;

        const messagesUpToUser = messages.slice(0, lastUserIndex + 1);
        const lastUserMessage = messages[lastUserIndex];

        setMessages(messagesUpToUser);
        setInput(lastUserMessage.content);
    };

    // ... (rest of render helpers)
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const parseSaveData = (content: string) => {
        // Regex to find [SAVE:TYPE {JSON}]
        // Simplified: Search for a code block with a header like "Save Character" or specific tag
        // Actually, let's use a specific custom block: ```json:save:character

        const saveRegex = /```json:save:(character|world)\n([\s\S]*?)\n```/;
        const match = content.match(saveRegex);

        if (match) {
            try {
                const type = match[1] as 'character' | 'world';
                const data = JSON.parse(match[2]);
                return { type, data, cleanContent: content.replace(match[0], '').trim() };
            } catch (e) {
                console.error("Failed to parse save block", e);
            }
        }
        return null;
    };

    const handleSaveEntity = (type: 'character' | 'world', data: any) => {
        if (type === 'character') {
            const existingId = targetIdParam || (data.id && characters.find(c => c.id === data.id)?.id);

            if (existingId) {
                updateCharacter(existingId, {
                    ...data,
                    // Ensure arrays are arrays
                    motivations: Array.isArray(data.motivations) ? data.motivations : [],
                    flaws: Array.isArray(data.flaws) ? data.flaws : [],
                    allies: Array.isArray(data.allies) ? data.allies : [],
                    enemies: Array.isArray(data.enemies) ? data.enemies : [],
                    updatedAt: new Date()
                });
                alert('Character Updated Successfully!');
            } else {
                const id = Date.now().toString();
                addCharacter({
                    id,
                    role: 'Protagonist',
                    genre: 'General',
                    progress: 0,
                    phase: 'Foundation',
                    ...data,
                    updatedAt: new Date(),
                    createdAt: new Date()
                });
                alert('Character Created & Saved!');
            }
        } else {
            const existingId = targetIdParam || (data.id && worlds.find(w => w.id === data.id)?.id);

            if (existingId) {
                updateWorld(existingId, {
                    ...data,
                    updatedAt: new Date()
                });
                alert('World Updated Successfully!');
            } else {
                const id = Date.now().toString();
                addWorld({
                    id,
                    genre: 'General',
                    tone: 'Neutral',
                    ...data,
                    updatedAt: new Date(),
                    createdAt: new Date()
                });
                alert('World Created & Saved!');
            }
        }
    };

    const renderMessage = (content: string) => {
        const saveData = parseSaveData(content);
        const displayContent = saveData ? saveData.cleanContent : content;

        const lines = displayContent.split('\n');

        return (
            <div>
                {lines.map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold text-foreground mt-4 mb-2">{line.slice(2, -2)}</p>;
                    }
                    if (line.startsWith('## ')) {
                        return <h2 key={i} className="font-semibold text-foreground mt-4 mb-2 text-lg">{line.slice(3)}</h2>;
                    }
                    if (line.startsWith('# ')) {
                        return <h1 key={i} className="font-bold text-foreground mt-4 mb-2 text-xl">{line.slice(2)}</h1>;
                    }
                    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                        const text = line.slice(2);
                        return (
                            <div key={i} className="flex items-start gap-2 py-1">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="text-muted-foreground">{renderInlineCode(text)}</span>
                            </div>
                        );
                    }
                    if (/^\d+\.\s/.test(line)) {
                        const text = line.replace(/^\d+\.\s/, '');
                        return (
                            <div key={i} className="flex items-start gap-2 py-1">
                                <span className="text-primary mt-0.5 w-4">{line.match(/^\d+/)?.[0]}.</span>
                                <span className="text-muted-foreground">{renderInlineCode(text)}</span>
                            </div>
                        );
                    }
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    return <p key={i} className="text-muted-foreground py-0.5">{renderInlineCode(line)}</p>;
                })}

                {saveData && (
                    <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                {saveData.type === 'character' ? <User className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                Ready to Save: {saveData.data.name || 'Untitled'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {saveData.type === 'character' ? 'Character Profile' : 'World Setting'} generated successfully.
                            </p>
                        </div>
                        <Button
                            onClick={() => handleSaveEntity(saveData.type, saveData.data)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save to Library
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderInlineCode = (text: string) => {
        if (!text.includes('`')) return text;
        const parts = text.split('`');
        return parts.map((part, j) =>
            j % 2 === 1 ? (
                <code key={j} className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-sm font-mono">{part}</code>
            ) : <span key={j}>{part}</span>
        );
    };

    const suggestions = getFilteredMentions();
    const commandSuggestions = getFilteredCommands();

    return (
        <div className="flex flex-col h-screen">
            {/* Header ... */}
            <header className="h-14 border-b border-border px-6 flex items-center justify-between glass-strong shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", hasApiKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
                        <span className="font-medium text-sm">{hasApiKey ? 'Connected' : 'Setup Required'}</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {apiConfig?.provider === 'openai' ? 'GPT-4o' : 'Claude 3.5'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2 mr-1"
                        onClick={() => sendMessage('/save')}
                        title="Save Current Progress"
                    >
                        <Save className="h-4 w-4" />
                        <span className="text-xs hidden md:inline">Save</span>
                    </Button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-2"
                        onClick={handleCommandsClick}
                    >
                        <Command className="h-4 w-4" />
                        <span className="text-xs">Commands</span>
                        <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">/</kbd>
                    </Button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-black/90 border-white/10 backdrop-blur-xl">
                            <DropdownMenuItem onClick={handleRestartChat} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white">
                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                Restart Chat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={handleDeleteChat} className="text-xs text-red-400 focus:text-red-400 cursor-pointer focus:bg-red-500/10">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete Chat
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Warnings ... */}
            {!hasApiKey && (
                <div className="mx-6 mt-4 p-4 rounded-xl glass-card border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-1">API Key Required</p>
                            <p className="text-xs text-muted-foreground mb-3">Add your API key in Settings to start chatting with AI.</p>
                            <Link href="/settings">
                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                    <Settings className="h-3.5 w-3.5 mr-1.5" /> Open Settings
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <div className="mx-6 mt-4 p-4 rounded-xl glass-card border-red-500/20 bg-red-500/5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-1">Error</p>
                            <p className="text-xs text-muted-foreground">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((message, index) => (
                        <div key={message.id} className={cn("animate-fade-in", message.role === 'user' ? 'flex justify-end' : 'flex justify-start')} style={{ animationDelay: `${index * 50}ms` }}>
                            <div className={cn("max-w-[85%] rounded-2xl px-5 py-4", message.role === 'user' ? "message-user" : "message-assistant")}>
                                {message.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-foreground">5D Creator</span>
                                    </div>
                                )}
                                <div className="text-sm leading-relaxed">{renderMessage(message.content)}</div>
                                {message.role === 'assistant' && message.choices && message.choices.length > 0 && <ChoiceChips choices={message.choices} onSelect={handleChoiceSelect} />}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                    <span className="text-[10px] text-muted-foreground">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {message.role === 'assistant' && message.id !== 'welcome' && (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => copyToClipboard(message.content)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                                            <button onClick={handleReload} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="message-assistant rounded-2xl px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-border glass-strong relative z-20">
                <div className="max-w-3xl mx-auto p-4 relative">
                    {/* Mentions Popup */}
                    {mentionQuery !== null && (
                        <div className="absolute bottom-full left-4 mb-2 w-64 glass-card rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 fade-in divide-y divide-white/5">
                            <div className="px-3 py-2 bg-white/5 text-xs font-semibold text-muted-foreground">
                                Mention...
                            </div>
                            {suggestions.length > 0 ? (
                                suggestions.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMentionSelect(item)}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition-colors flex items-center gap-3 text-sm group"
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                            item.type === 'Character' ? "bg-emerald-500/10 text-emerald-500" : "bg-violet-500/10 text-violet-500"
                                        )}>
                                            {item.type === 'Character' ? <User className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <span className="text-foreground font-medium">{item.name}</span>
                                            <span className="ml-2 text-xs text-muted-foreground opacity-50">{item.type}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-2.5 text-xs text-muted-foreground italic">
                                    No matches found.
                                </div>
                            )}
                        </div>
                    )}


                    {/* Commands Popup */}
                    {commandQuery !== null && (
                        <div className="absolute bottom-full left-4 mb-2 w-72 glass-card rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 fade-in divide-y divide-white/5">
                            <div className="px-3 py-2 bg-white/5 text-xs font-semibold text-muted-foreground">Commands...</div>
                            {commandSuggestions.length > 0 ? (
                                commandSuggestions.map(cmd => (
                                    <button key={cmd.id} onClick={() => handleCommandSelect(cmd)} className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition-colors flex items-center gap-3 text-sm group">
                                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                            <cmd.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 truncate">
                                            <span className="text-foreground font-medium">{cmd.label}</span>
                                            <span className="ml-2 text-xs text-muted-foreground opacity-50 block">{cmd.description}</span>
                                        </div>
                                    </button>
                                ))
                            ) : <div className="px-3 py-2.5 text-xs text-muted-foreground italic">No commands found.</div>}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", showQuickActions ? "max-h-12 opacity-100 mb-3" : "max-h-0 opacity-0 mb-0")}>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mr-2">Quick Commands:</span>
                            {['/generate basic', '/worldbio', '/menu'].map((cmd) => (
                                <button key={cmd} onClick={() => setInput(cmd)} disabled={!hasApiKey} className="text-[10px] px-3 py-1.5 rounded-lg bg-white/[0.03] text-muted-foreground hover:text-primary hover:bg-primary/10 border border-white/5 hover:border-primary/20 transition-all disabled:opacity-50">
                                    {cmd}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                        <button type="button" onClick={() => setShowQuickActions(!showQuickActions)} className={cn("p-3 rounded-xl transition-all border border-transparent", showQuickActions ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")} title="Toggle Quick Actions">
                            <Sparkles className="h-5 w-5" />
                        </button>
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e as any);
                                    }
                                }}
                                rows={1}
                                placeholder={hasApiKey ? "Type / for commands, @ to mention..." : "Add API key in Settings first..."}
                                disabled={isLoading || !hasApiKey}
                                className="w-full premium-input pr-12 disabled:opacity-50 min-h-[46px] max-h-[200px] py-3 resize-none scroll-smooth"
                            />
                            <div className="absolute right-4 top-3">
                                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">/</kbd>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading || !input.trim() || !hasApiKey} className={cn("premium-button flex items-center justify-center translate-y-0", "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none")}>
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>

            <CommandTutorialModal open={showCommandTutorial} onOpenChange={setShowCommandTutorial} />
        </div>
    );
}
