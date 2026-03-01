import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Database, FileText, LayoutList } from 'lucide-react';
import { useSessions } from '../queries/session.queries';
import type { Session } from '../types';

export function DashboardOverview() {

  const { data: sessions, isLoading: isLoadingSessions } = useSessions();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-text-secondary mt-1">Monitor your web scraping activity and performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Sessions</CardTitle>
            <LayoutList className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? (
              <div className="h-8 w-24 bg-bg-tertiary rounded-lg animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold">{sessions?.length ?? 0}</div>
            )}
            <p className="text-xs text-text-muted mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Pages Scraped</CardTitle>
            <FileText className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? (
              <div className="h-8 w-24 bg-bg-tertiary rounded-lg animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold">{sessions && (sessions.reduce((acc: number, session: Session) => acc + session.page_count, 0)) || 0}</div>
            )}
            <p className="text-xs text-text-muted mt-1">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Elements Extracted</CardTitle>
            <Database className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? (
              <div className="h-8 w-24 bg-bg-tertiary rounded-lg animate-pulse"></div>
            ) : (
              <div className="text-3xl font-bold">{sessions && (sessions.reduce((acc: number, session: Session) => acc + session.elements_extracted, 0)) || 0}</div>
            )}
            <p className="text-xs text-text-muted mt-1">Data points collected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
