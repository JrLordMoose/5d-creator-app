export interface World {
    id: string; // WID like @VIRELITH_501
    name: string;
    genre: string;
    description: string;
    projectId?: string; // Link to Project
    progress: number; // 0-100

    // Core Elements
    tone?: string;
    rules?: string[]; // Magic/Tech rules

    // Lore Sections
    history?: string;
    geography?: string;
    societies?: string[];

    // Visuals
    imageUrl?: string;

    createdAt: Date;
    updatedAt: Date;
}
