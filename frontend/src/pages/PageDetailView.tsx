import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronLeft, ExternalLink, FileCode, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { usePage } from '../queries/page.queries';
import { formatHtmlForDisplay, parseApiDate } from '../utils/helpers';
import type { Element } from '../types';

export function PageDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: page, isLoading: isLoadingPage } = usePage(id ?? '');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedView = searchParams.get('view') ?? 'tags';
  const setViewInUrl = (view: 'tags' | 'html') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', view);
      return next;
    }, { replace: true });
  };

  // const tags = page?.elements.map((element: Element) => element.tag_name);
  // const uniqueTags = [...new Set(tags)];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight truncate max-w-2xl">
            {
              page?.page_name ? <div className="truncate max-w-2xl">{page?.page_name}</div> : <div className="w-80 h-10 animate-pulse bg-bg-tertiary rounded"></div>
            }
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
            <a href={page?.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
              {
                page?.url ? <div className="truncate max-w-2xl">{page?.url}</div> : <div className="w-80 h-4 animate-pulse bg-bg-tertiary rounded"></div>
              }
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>·</span>
            <span>Scraped {page?.created_at ? formatDistanceToNow(parseApiDate(page?.created_at), { addSuffix: true }) : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className={`border border-border-default rounded-full p-1 grid grid-cols-2 items-center justify-center w-fit relative before:content-[''] before:absolute before:w-[100px] before:h-[calc(100%-8px)] before:rounded-full before:bg-primary before:left-1 before:z-0 before:transition-all before:duration-300 ${selectedView !== 'tags' ? 'before:left-[calc(100px+4px)]' : ''}`}>
        <button onClick={() => setViewInUrl('tags')} className={`px-4 py-2 w-[100px] cursor-pointer rounded-full transition-colors flex items-center gap-2 text-sm relative z-2 ${selectedView === 'tags' ? 'text-text-on-primary' : ''}`}>
          <Tag className="h-4 w-4" />
          Tags
        </button>
        <button onClick={() => setViewInUrl('html')} className={`px-4 py-2 w-[100px] cursor-pointer rounded-full transition-colors flex items-center gap-2 text-sm relative z-2 ${selectedView === 'html' ? 'text-text-on-primary' : ''}`}>
          <FileCode className="h-4 w-4" />
          HTML
        </button>
      </div>

      {selectedView === 'tags' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Tag</TableHead>
              <TableHead className="w-1/2">Content</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          {isLoadingPage ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-text-muted animate-pulse space-y-4">
                  <div className="h-12 w-full bg-bg-tertiary rounded animate-pulse"></div>
                  <div className="h-12 w-full bg-bg-tertiary rounded animate-pulse"></div>
                  <div className="h-12 w-full bg-bg-tertiary rounded animate-pulse"></div>
                  <div className="h-12 w-full bg-bg-tertiary rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : ( 
          <TableBody>
            {!page?.elements || page?.elements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-text-muted">
                  No elements found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              page?.elements.map((element: Element) => (
                <TableRow key={element.id}>
                  <TableCell>
                    <Badge variant="default" className="font-mono text-[10px] tracking-wider">
                      {element.tag_name || ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md whitespace-pre-wrap break-all">
                    <div className="truncate text-text-secondary" title={element.text_content || ''}>
                      {formatHtmlForDisplay(element.text_content) || <span className="text-text-muted italic">No content found</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <pre className="text-xs text-text-muted">{element.detected_type || 'N/A'}</pre>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          )}
        </Table>
      )}

      {
        selectedView === 'html' && (
          <div className="rounded-xl border border-border-default overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border-default bg-bg-secondary px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <span className="ml-2 text-xs text-text-muted font-medium">{page?.page_name || 'Untitled'}.html</span>
            </div>
            <pre className="max-h-[65vh] overflow-auto bg-[#f6f8fa] text-[#24292f] dark:bg-[#0d1117] dark:text-[#c9d1d9] p-4 text-xs leading-6 font-mono whitespace-pre-wrap break-all">
              {formatHtmlForDisplay(page?.raw_html) || 'No HTML found'}
            </pre>
          </div>
        )
      }
    </div>
  );
}
