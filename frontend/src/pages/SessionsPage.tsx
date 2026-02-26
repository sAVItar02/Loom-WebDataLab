import { useState } from 'react';
import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import type { Session } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

export function SessionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionUrl, setNewSessionUrl] = useState('');
  // const [newSessionClassName, setNewSessionClassName] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);


  const getStatusBadge = (status: Session['status']) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'running': return <Badge variant="info" className="animate-pulse">Running</Badge>;
      case 'failed': return <Badge variant="danger">Failed</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scraping Sessions</h2>
          <p className="text-text-secondary mt-1">Manage and monitor your web scraping tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => {}} disabled={false}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${!sessions ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search sessions..."
            className="h-10 w-full rounded-lg border border-border-default bg-bg-secondary pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {!sessions ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-bg-tertiary rounded-xl"></div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Pages</TableHead>
              <TableHead className="text-right">Elements</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray([]) && [].length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-text-muted">
                  No sessions found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              [].map((session: Session) => (
                <TableRow key={session.id} className="group cursor-pointer">
                  <TableCell className="font-medium">
                    <Link to={`/sessions/${session.id}`} className="hover:text-primary transition-colors block">
                      {session.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-text-secondary truncate max-w-[200px]">
                    {session.url}
                  </TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell className="text-right">{session.pages_scraped}</TableCell>
                  <TableCell className="text-right">{session.elements_extracted}</TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Session"
      >
        <form onSubmit={() => {}} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-text-secondary">
              Session Name <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="e.g., E-commerce Product Scrape"
              className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-text-secondary">
              Target URL <span className="text-error">*</span>
            </label>
            <input
              id="url"
              type="url"
              required
              value={newSessionUrl}
              onChange={(e) => setNewSessionUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          {/* <div className="space-y-2">
            <label htmlFor="className" className="text-sm font-medium text-text-secondary">
              Target Class Name
            </label>
            <input
              id="className"
              type="text"
              value={newSessionClassName}
              onChange={(e) => setNewSessionClassName(e.target.value)}
              placeholder="e.g., product-item"
              className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div> */}
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={false}>
              Create Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
