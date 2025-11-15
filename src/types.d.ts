interface PuterAI {
  chat: (prompt: string, options?: { model?: string; stream?: boolean; tools?: any[] }) => Promise<any>;
}

declare global {
  interface Window {
    puter: {
      ai: PuterAI;
    };
  }
}

export {};
