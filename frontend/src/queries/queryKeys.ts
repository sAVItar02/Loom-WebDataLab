export const queryKeys = {
    sessions: ["sessions"],
    session: (id: number) => ["session", id],
    pages: (sessionId: string) => ["pages", sessionId],
    page: (id: number) => ["page", id],
};