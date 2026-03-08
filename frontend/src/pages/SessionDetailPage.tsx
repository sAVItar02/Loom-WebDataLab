import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Globe, ChevronLeft, FileIcon, Plus, RefreshCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useSession } from '../queries/session.queries';
import { useCreatePage, usePages } from '../queries/page.queries';
import type { Page } from '../types';
import { parseApiDate } from '../utils/helpers';
import { containerVariants, horizontalItemVariants } from '../utils/animations';
import { AnimatePresence, motion } from 'framer-motion';
import StaticForm from '../components/forms/StaticForm';
import { cn } from '../utils/helpers';
import SeleniumForm from '../components/forms/SeleniumForm';

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [pageName, setPageName] = useState('');
  const [scrapeType, setScrapeType] = useState<'static' | 'selenium'>('static');

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

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-3">
        <motion.div variants={horizontalItemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Pages Scraped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pages.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={horizontalItemVariants}>
          <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Elements Extracted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pages.reduce((acc: number, page: Page) => acc + page.elements.length, 0)}</div>
          </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Scraped Pages</h3>
        <div className="space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {pages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center py-12 border border-border-default border-dashed rounded-xl bg-bg-secondary/30 flex flex-col items-center justify-center gap-8">
                  <p className="text-text-muted">No pages scraped yet.</p>
                  <Button variant="primary" className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Scrape
                  </Button>
                </div>
              </motion.div>
            ) : (
              pages.map((page: Page) => (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-border-default/75 rounded-xl"
                >
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
                      <Link to={`/pages/${page.id}`}>
                        <Button variant="secondary" size="sm">
                          View Elements
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start New Scrape">
        <p className="text-sm text-text-secondary mb-4">
          This will start a new scrape for the session.
        </p>
        <div className={`my-4 relative w-fit bg-bg-tertiary rounded-lg p-1 before:content=[""] before:transition-all before:duration-300 before:ease-in-out before:z-0 before:absolute before:top-1 ${scrapeType === 'static' ? 'before:left-1' : 'before:left-[152px]'} before:w-[140px] before:h-[calc(100%-8px)] before:bg-primary before:rounded-lg flex items-center gap-2`}>
            <button onClick={() => setScrapeType('static')} className={ cn('relative z-1 w-[140px] rounded-md cursor-pointer flex items-center justify-center px-4 py-2', scrapeType === 'static' ? 'text-text-on-primary' : 'bg-transparent')}>
              <FileIcon className="h-4 w-4 mr-2" />
              <span>Static</span>
            </button>
            <button onClick={() => setScrapeType('selenium')} className={cn('relative z-1 w-[140px] rounded-md cursor-pointer flex items-center justify-center px-4 py-2', scrapeType === 'selenium' ? 'text-text-on-primary' : 'bg-transparent')}>
              <Globe className="h-4 w-4 mr-2" />
              <span>Selenium</span>
            </button>
        </div>

        {
          scrapeType === 'static' && (
            <StaticForm
              pageName={pageName}
              setPageName={setPageName}
              url={url}
              setUrl={setUrl}
              selector={selector}
              setSelector={setSelector}
              setIsModalOpen={setIsModalOpen}
              isCreatingPage={isCreatingPage}
              createPage={createPage}
              refetchPages={refetchPages}
              id={id ?? ''}
            />
          )
        }
        {
          scrapeType === 'selenium' && (
            <SeleniumForm
              pageName={pageName}
              setPageName={setPageName}
              url={url}
              setUrl={setUrl}
              setIsModalOpen={setIsModalOpen}
              sessionId={id ?? ''}
            />
          )
        }
      </Modal>
    </div>
  );
}
