export const queryKeys = {
    sessions: ["sessions"],
    session: (id: number) => ["session", id],
    pages: (sessionId: string) => ["pages", sessionId],
    page: (id: string) => ["page", id],
    preview: (url: string) => ["preview", url],
};