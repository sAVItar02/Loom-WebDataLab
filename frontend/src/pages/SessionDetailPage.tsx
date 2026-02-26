import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, ExternalLink, FileCode, RefreshCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Session, Page } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [sessionData, pagesData] = await Promise.all([
        Promise.resolve({}),
        Promise.resolve([])
      ]);
      setSession(sessionData as Session);
      setPages(pagesData as Page[]);
    } catch (error) {
      console.error('Failed to fetch session details:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-bg-tertiary rounded"></div>
        <div className="h-32 bg-bg-tertiary rounded-xl"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-bg-tertiary rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-secondary">Session not found</h2>
        <Link to="/sessions" className="text-primary hover:underline mt-4 inline-block">
          Return to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sessions" className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{session.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
              <a href={session.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                {session.url}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span>·</span>
              <span>Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={session.status === 'completed' ? 'success' : session.status === 'running' ? 'info' : session.status === 'failed' ? 'danger' : 'warning'}>
            {session.status.toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Pages Scraped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{session.pages_scraped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Elements Extracted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{session.elements_extracted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {pages.length > 0 ? Math.round((pages.filter(p => p.status === 'scraped').length / pages.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Scraped Pages</h3>
        <div className="space-y-4">
          {pages.length === 0 ? (
            <div className="text-center py-12 border border-border-default border-dashed rounded-xl bg-bg-secondary/30">
              <p className="text-text-muted">No pages scraped yet.</p>
            </div>
          ) : (
            pages.map((page) => (
              <Card key={page.id} className="hover:border-border-strong transition-colors">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <Link to={`/pages/${page.id}`} className="text-lg font-medium hover:text-primary transition-colors truncate">
                        {page.title || page.url}
                      </Link>
                      <Badge variant={page.status === 'scraped' ? 'success' : page.status === 'failed' ? 'danger' : 'warning'}>
                        {page.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-text-muted truncate flex items-center gap-2">
                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary hover:underline">
                        {page.url}
                      </a>
                      <span>·</span>
                      <span>{page.elements_count} elements</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(page.scraped_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {page.raw_html && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedHtml(page.raw_html!)}>
                        <FileCode className="h-4 w-4 mr-2" />
                        View HTML
                      </Button>
                    )}
                    <Link to={`/pages/${page.id}`}>
                      <Button variant="secondary" size="sm">
                        View Elements
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedHtml}
        onClose={() => setSelectedHtml(null)}
        title="Raw HTML Content"
        className="max-w-4xl w-full"
      >
        <div className="mt-4 bg-bg-secondary rounded-lg p-4 overflow-auto max-h-[60vh] border border-border-default">
          <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-all">
            {selectedHtml}
          </pre>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setSelectedHtml(null)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}
