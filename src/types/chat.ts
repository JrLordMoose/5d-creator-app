
export interface Choice {
    id: string;
    label: string;
    description?: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    choices?: Choice[];
}

export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: Date;
    createdAt: Date;
    messages: Message[];
    mode: 'chat' | 'character' | 'world' | 'project' | 'lore' | 'scene';
    relatedId?: string; // ID of the character/world/project if applicable
}
