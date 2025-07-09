import { create } from 'zustand';
import { AppStatus, ScreenCapture, AIResponse } from '../../shared/types';

interface AppStore {
  status: AppStatus;
  captures: ScreenCapture[];
  responses: AIResponse[];
  currentCapture: ScreenCapture | null;
  currentResponse: AIResponse | null;
  
  setStatus: (status: AppStatus) => void;
  addCapture: (capture: ScreenCapture) => void;
  updateCaptureOcr: (captureId: string, ocrText: string) => void;
  addAiResponse: (response: AIResponse) => void;
  clearHistory: () => void;
}

export const useStore = create<AppStore>((set) => ({
  status: 'idle',
  captures: [],
  responses: [],
  currentCapture: null,
  currentResponse: null,

  setStatus: (status) => set({ status }),

  addCapture: (capture) => set((state) => ({
    captures: [...state.captures, capture],
    currentCapture: capture,
  })),

  updateCaptureOcr: (captureId, ocrText) => set((state) => ({
    captures: state.captures.map((c) =>
      c.id === captureId ? { ...c, ocrText } : c
    ),
    currentCapture: state.currentCapture?.id === captureId
      ? { ...state.currentCapture, ocrText }
      : state.currentCapture,
  })),

  addAiResponse: (response) => set((state) => ({
    responses: [...state.responses, response],
    currentResponse: response,
  })),

  clearHistory: () => set({
    captures: [],
    responses: [],
    currentCapture: null,
    currentResponse: null,
  }),
}));