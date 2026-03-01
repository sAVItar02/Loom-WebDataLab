import { v4 as uuidv4 } from 'uuid';
export interface Session {
    id: typeof uuidv4;
    name: string;
    url: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: string;
    page_count: number;
    elements_extracted: number;
    last_scraped_at: string;
  }
  
  export interface Page {
    id: string;
    url: string;
    selector: string;
    mode: 'static' | 'dynamic';
    elements: Element[];
    created_at: string;
    raw_html: string;
    page_name: string;
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
  