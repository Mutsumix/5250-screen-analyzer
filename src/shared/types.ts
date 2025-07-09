export interface CaptureArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIProvider {
  type: 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
}

export interface AppSettings {
  captureArea?: CaptureArea;
  aiProvider?: AIProvider;
  ocrLanguage: string;
}

export interface ScreenCapture {
  id: string;
  timestamp: Date;
  imageData: string; // base64
  ocrText?: string;
}

export interface AIResponse {
  id: string;
  captureId: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

export type AppStatus = 'idle' | 'capturing' | 'processing' | 'error';

export interface IpcChannels {
  // Main -> Renderer
  'capture:result': (capture: ScreenCapture) => void;
  'ocr:result': (result: { captureId: string; text: string }) => void;
  'ai:response': (response: AIResponse) => void;
  'status:update': (status: AppStatus) => void;
  'error:occurred': (error: { message: string; details?: any }) => void;
  
  // Renderer -> Main
  'capture:manual': () => void;
  'settings:update': (settings: Partial<AppSettings>) => void;
  'settings:get': () => AppSettings;
}