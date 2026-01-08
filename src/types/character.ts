export interface Character {
    id: string; // CID like #ELARA_902
    name: string;
    role: string; // Protagonist, Antagonist, etc.
    genre: string;
    projectId?: string; // Link to Project
    progress: number; // 0-100
    phase: 'Foundation' | 'Personality' | 'Backstory' | 'Relationships' | 'Arc';
    // Phase 1: Foundation
    coreConcept?: string;
    archetype?: string;
    // Phase 2: Personality
    motivations?: string[];
    flaws?: string[];
    // Phase 3: Backstory
    origin?: string;
    ghost?: string; // Past trauma
    // Phase 4: Relationships
    allies?: string[];
    enemies?: string[];
    // Phase 5: Arc
    arcType?: string;
    climax?: string;

    imageUrl?: string; // Generated avatar
    createdAt: Date;
    updatedAt: Date;
}

export type OperationalMode = 'Basic' | 'Advanced' | 'Simulation' | 'Analysis' | 'Worldbuilding' | 'Export';
