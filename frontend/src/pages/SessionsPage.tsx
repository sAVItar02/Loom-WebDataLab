import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import type { Session } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useCreateSession, useSessions } from '../queries/session.queries';
import { Loader2 } from 'lucide-react';
import { parseApiDate } from '../utils/helpers'

export function SessionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: sessions, isLoading: isLoadingSessions, refetch } = useSessions();
  const { mutate: createSession, isPending: isCreatingSession } = useCreateSession();

  const filteredSessions = useMemo(() => sessions?.filter((session: Session) => session.name.toLowerCase().includes(search.toLowerCase())) ?? [], [sessions, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scraping Sessions</h2>
          <p className="text-text-secondary mt-1">Manage and monitor your web scraping tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoadingSessions}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoadingSessions ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)} disabled={isCreatingSession}>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filteredSessions || isLoadingSessions ? (
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
              <TableHead className="text-right">Pages</TableHead>
              <TableHead className="text-right">Elements Extracted</TableHead>
              <TableHead className="text-right">Last Scraped</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-text-muted">
                  No sessions found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session: Session) => (
                <TableRow key={session.id.toString()} onClick={() => navigate(`/sessions/${session.id.toString()}`)} className="group cursor-pointer">
                  <TableCell className="font-medium">
                      {session.name}
                  </TableCell>
                  <TableCell className="text-right">{session.page_count}</TableCell>
                  <TableCell className="text-right">{session.elements_extracted}</TableCell>
                  <TableCell className="text-right">{session.last_scraped_at ? formatDistanceToNow(parseApiDate(session.last_scraped_at), { addSuffix: true }) : 'N/A'}</TableCell>
                  <TableCell className="text-right text-text-secondary">
                    {session.created_at ? formatDistanceToNow(parseApiDate(session.created_at), { addSuffix: true }) : 'N/A'}
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
        <p className="text-sm text-text-secondary mb-4">
          This will create a new session and you can start scraping pages, and manage multiple pages within a session.
        </p>
        <form onSubmit={() => createSession(newSessionName)} className="space-y-4">
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
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingSession} isLoading={isCreatingSession}>
              {isCreatingSession ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Create Session'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
