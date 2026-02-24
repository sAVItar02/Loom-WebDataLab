export interface Session {
    id: string;
    name: string;
    url: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: string;
    pages_scraped: number;
    elements_extracted: number;
  }
  
  export interface Page {
    id: string;
    session_id: string;
    url: string;
    title: string;
    status: 'pending' | 'scraped' | 'failed';
    scraped_at: string;
    raw_html?: string;
    elements_count: number;
  }
  
  export interface Element {
    id: string;
    page_id: string;
    tag: string;
    text_content: string;
    attributes: Record<string, string>;
    extracted_at: string;
  }
  
  export interface DashboardStats {
    total_sessions: number;
    total_pages: number;
    total_elements: number;
    active_sessions: number;
  }
  