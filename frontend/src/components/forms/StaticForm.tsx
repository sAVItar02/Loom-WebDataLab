import { Button } from "../ui/Button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

interface StaticFormProps {
    pageName: string;
    setPageName: (pageName: string) => void;
    url: string;
    setUrl: (url: string) => void;
    selector: string;
    setSelector: (selector: string) => void;
    setIsModalOpen: (isModalOpen: boolean) => void;
    isCreatingPage: boolean;
    createPage: (variables: { sessionId: string, url: string, selector: string, pageName: string }, options: { onSuccess: () => void }) => void;
    refetchPages: () => void;
    id: string;
}

const StaticForm = ({ pageName, setPageName, url, setUrl, selector, setSelector, setIsModalOpen, isCreatingPage, createPage, refetchPages, id }: StaticFormProps) => {
    const navigate = useNavigate();
    return (
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
    )
}

export default StaticForm