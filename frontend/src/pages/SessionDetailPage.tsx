import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useNavigate } from 'react-router';
import { ChevronLeft, FileCode, Loader2, Plus, RefreshCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useSession } from '../queries/session.queries';
import { useCreatePage, usePages } from '../queries/page.queries';
import type { Page } from '../types';
import { parseApiDate } from '../utils/helpers';

const formatHtmlForDisplay = (html: string) =>
  html
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [pageName, setPageName] = useState('');

  const { data: session, isLoading: isLoadingSession, refetch } = useSession(id ?? '0');
  const { data: pages, isLoading: isLoadingPages, refetch: refetchPages } = usePages(id ?? '');
  const { mutate: createPage, isPending: isCreatingPage } = useCreatePage();

  if (isLoadingSession || isLoadingPages) {
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

  if (!pages) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-secondary">No pages found</h2>
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
              <span>Created {formatDistanceToNow(parseApiDate(session.created_at), { addSuffix: true })}</span>
              <span>·</span>
              <span>Last Scraped {session.last_scraped_at ? formatDistanceToNow(parseApiDate(session.last_scraped_at), { addSuffix: true }) : 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Scrape
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Pages Scraped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Elements Extracted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pages.reduce((acc: number, page: Page) => acc + page.elements.length, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Scraped Pages</h3>
        <div className="space-y-4">
          {pages.length === 0 ? (
            <div className="text-center py-12 border border-border-default border-dashed rounded-xl bg-bg-secondary/30 flex flex-col items-center justify-center gap-8">
              <p className="text-text-muted">No pages scraped yet.</p>
              <Button variant="primary" className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Scrape
              </Button>
            </div>
          ) : (
            pages.map((page: Page) => (
              <Card key={page.id} className="hover:border-border-strong transition-colors">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <Link to={`/pages/${page.id}`} className="text-lg font-medium hover:text-primary transition-colors truncate">
                        {page.page_name || page.url.split('/').pop() || 'Untitled'}
                      </Link>
                      <Badge variant={page.elements.length != 0 ? 'success' :   'danger'}>
                        {page.elements.length != 0 ? 'Scraped' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-sm text-text-muted truncate flex items-center gap-2">
                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary hover:underline">
                        {page.url}
                      </a>
                      <span>·</span>
                      <span>{page.elements.length} elements</span>
                      <span>·</span>
                      <span>{page.created_at ? formatDistanceToNow(parseApiDate(page.created_at), { addSuffix: true }) : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {page.elements.length != 0 && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedHtml(page.raw_html)}>
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
            {selectedHtml ? formatHtmlForDisplay(selectedHtml) : ''}
          </pre>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setSelectedHtml(null)}>Close</Button>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start New Scrape">
        <p className="text-sm text-text-secondary mb-4">
          This will start a new scrape for the session.
        </p>
        <form onSubmit={() => {}} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="page_name" className="text-sm font-medium text-text-secondary">
              Page Name <span className="text-error">*</span>
            </label>
            <input
              id="page_name"
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="e.g., Product Page"
              className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-text-secondary">
              URL <span className="text-error">*</span>
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://www.example.com"
              className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="selector" className="text-sm font-medium text-text-secondary">
              Selector <span className="text-error">*</span>
            </label>
            <input
              id="selector"
              type="text"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder="e.g., .product-card"
              className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
            <p className="text-xs text-text-muted">
              Selector is only used for element scraping. Link Graph uses only the URL.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                navigate(`/pagerank-graph?url=${encodeURIComponent(url)}&hop=2&topK=200`);
              }}
              disabled={!url}
            >
              Generate PageRank Link Graph
            </Button>

            <Button
              type="button"
              disabled={isCreatingPage}
              isLoading={isCreatingPage}
              onClick={() =>
                createPage(
                  { sessionId: id ?? '', url, selector, pageName },
                  {
                    onSuccess: async () => {
                      setIsModalOpen(false);
                      setUrl('');
                      setSelector('');
                      setPageName('');
                      await refetchPages();
                    },
                  }
                )
              }
            >
              {isCreatingPage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Start Scrape'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
