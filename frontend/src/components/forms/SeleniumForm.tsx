import { Button } from "../ui/Button";
import { useNavigate } from "react-router";

interface SeleniumFormProps {
    pageName: string;
    setPageName: (pageName: string) => void;
    url: string;
    setUrl: (url: string) => void;
    setIsModalOpen: (isModalOpen: boolean) => void;
    sessionId: string;
}


const SeleniumForm = ({ pageName, setPageName, url, setUrl, setIsModalOpen, sessionId }: SeleniumFormProps) => {
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
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate(`/preview?url=${encodeURIComponent(url)}&pageName=${encodeURIComponent(pageName)}&sessionId=${sessionId}`)
              }
            >
              Preview
            </Button>
          </div>
        </form>
    )
}

export default SeleniumForm