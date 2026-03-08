import { BrowserRouter, Routes, Route } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { SessionsPage } from './pages/SessionsPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { PageDetailView } from './pages/PageDetailView';
import { PageRankGraph } from './pages/PageRankGraph';
import PreviewPage from './pages/PreviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/:id" element={<SessionDetailPage />} />
          <Route path="pages/:id" element={<PageDetailView />} />
          <Route path="pagerank-graph" element={<PageRankGraph />} />
        </Route>
      </Routes>
      <Routes>
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}