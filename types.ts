export enum AppStep {
  UPLOAD = 'UPLOAD',
  EDIT = 'EDIT',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export interface ImageData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface EditResult {
  imageUrl: string; // Base64 data URI
  text?: string; // Optional text response from model
}
