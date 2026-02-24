import { Link } from 'react-router';
import { ChevronLeft, ExternalLink, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

export function PageDetailView() {


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to={`/sessions`} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight truncate max-w-2xl">Page Title</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
            <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 hover:underline flex items-center gap-1">
              https://example.com
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <span>Scraped {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search content or attributes..."
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div className="relative flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none pr-8"
            >
              <option value="">All Tags</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-zinc-400 font-medium">
          Showing 0 of 0 elements
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Tag</TableHead>
            <TableHead className="w-1/2">Content</TableHead>
            <TableHead>Attributes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray([]) && [].length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-zinc-500">
                No elements found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            Array.isArray([]) && [].map((element: { id: string; tag: string; text_content: string }) => (
              <TableRow key={element.id}>
                <TableCell>
                  <Badge variant="default" className="font-mono text-[10px] tracking-wider">
                    {element.tag || ''}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate text-zinc-300" title={element.text_content || ''}>
                    {element.text_content || <span className="text-zinc-600 italic">Empty</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
