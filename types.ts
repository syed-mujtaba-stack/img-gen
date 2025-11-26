export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
}

export interface GenerationConfig {
  temperature: number;
  aspectRatio: string;
}
