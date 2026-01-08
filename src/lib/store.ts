import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character } from '@/types/character';
import { World } from '@/types/world';
import { Project } from '@/types/project';
import { ChatSession } from '@/types/chat';

interface GlobalState {
    characters: Character[];
    worlds: World[];
    projects: Project[];
    chatSessions: ChatSession[];

    activeCharacterId: string | null;
    activeWorldId: string | null;
    activeProjectId: string | null;

    // UI State
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;

    // Character Actions
    addCharacter: (character: Character) => void;
    updateCharacter: (id: string, updates: Partial<Character>) => void;
    deleteCharacter: (id: string) => void;
    setActiveCharacter: (id: string | null) => void;
    getCharacter: (id: string) => Character | undefined;

    // World Actions
    addWorld: (world: World) => void;
    updateWorld: (id: string, updates: Partial<World>) => void;
    deleteWorld: (id: string) => void;
    setActiveWorld: (id: string | null) => void;
    getWorld: (id: string) => World | undefined;

    // Project Actions
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    setActiveProject: (id: string | null) => void;
    getProject: (id: string) => Project | undefined;

    // Chat Session Actions
    addChatSession: (session: ChatSession) => void;
    updateChatSession: (id: string, updates: Partial<ChatSession>) => void;
    deleteChatSession: (id: string) => void;
    getChatSession: (id: string) => ChatSession | undefined;
}

export const useStore = create<GlobalState>()(
    persist(
        (set, get) => ({
            characters: [],
            worlds: [],
            projects: [],
            chatSessions: [],

            activeCharacterId: null,
            activeWorldId: null,
            activeProjectId: null,

            // UI Implementation
            isSidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

            // Character Implementation
            addCharacter: (character) =>
                set((state) => ({
                    characters: [...state.characters, character],
                    activeCharacterId: character.id
                })),

            updateCharacter: (id, updates) =>
                set((state) => ({
                    characters: state.characters.map((char) =>
                        char.id === id
                            ? { ...char, ...updates, updatedAt: new Date() }
                            : char
                    ),
                })),

            deleteCharacter: (id) =>
                set((state) => ({
                    characters: state.characters.filter((char) => char.id !== id),
                    activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
                })),

            setActiveCharacter: (id) => set({ activeCharacterId: id }),
            getCharacter: (id) => get().characters.find((c) => c.id === id),

            // World Implementation
            addWorld: (world) =>
                set((state) => ({
                    worlds: [...state.worlds, world],
                    activeWorldId: world.id
                })),

            updateWorld: (id, updates) =>
                set((state) => ({
                    worlds: state.worlds.map((w) =>
                        w.id === id
                            ? { ...w, ...updates, updatedAt: new Date() }
                            : w
                    ),
                })),

            deleteWorld: (id) =>
                set((state) => ({
                    worlds: state.worlds.filter((w) => w.id !== id),
                    activeWorldId: state.activeWorldId === id ? null : state.activeWorldId,
                })),

            setActiveWorld: (id) => set({ activeWorldId: id }),
            getWorld: (id) => get().worlds.find((w) => w.id === id),

            // Project Implementation
            addProject: (project) =>
                set((state) => ({
                    projects: [...state.projects, project],
                    activeProjectId: project.id
                })),

            updateProject: (id, updates) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id
                            ? { ...p, ...updates, updatedAt: new Date() }
                            : p
                    ),
                })),

            deleteProject: (id) =>
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
                })),

            setActiveProject: (id) => set({ activeProjectId: id }),
            getProject: (id) => get().projects.find((p) => p.id === id),

            // Chat Session Implementation
            addChatSession: (session) =>
                set((state) => ({
                    chatSessions: [session, ...state.chatSessions] // Newest first
                })),

            updateChatSession: (id, updates) =>
                set((state) => ({
                    chatSessions: state.chatSessions.map((s) =>
                        s.id === id
                            ? { ...s, ...updates, updatedAt: new Date() }
                            : s
                    ),
                })),

            deleteChatSession: (id) =>
                set((state) => ({
                    chatSessions: state.chatSessions.filter((s) => s.id !== id),
                })),

            getChatSession: (id) => get().chatSessions.find((s) => s.id === id),
        }),
        {
            name: '5d-storage',
            partialize: (state) => ({
                characters: state.characters,
                worlds: state.worlds,
                projects: state.projects,
                chatSessions: state.chatSessions,
                isSidebarCollapsed: state.isSidebarCollapsed
            }),
        }
    )
);

// Alias for backward compatibility
export const useCharacterStore = useStore;
