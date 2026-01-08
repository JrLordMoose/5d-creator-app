export interface Project {
    id: string; // SID like #STORY_101
    name: string;
    genre: string;
    summary: string;

    // Relations (optional, could be computed)
    characterIds?: string[];
    worldIds?: string[];

    progress: number;
    createdAt: Date;
    updatedAt: Date;
}
