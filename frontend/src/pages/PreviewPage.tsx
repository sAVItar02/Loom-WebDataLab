import { useSearchParams } from 'react-router';
import { usePreview } from '../queries/preview.queries';
import { MousePointerClick, Loader2, Hash, Code, Route, Type, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../contexts/ThemeContext';
import { DetailRow, TextContentRow } from '../components/ui/ElementInspector';
import { useCreatePage } from '../queries/page.queries';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

interface Element {
    tag: string;
    selector: string;
    cssSelector: string;
    xpath: string;
    attributes: {
        class: string;
    };
    textContent: string;
    innerHtml: string;
}

const PreviewPage = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url');
    const pageName = searchParams.get('pageName') ?? 'Untitled Page';
    const sessionId = searchParams.get('sessionId');

    const { mutate: createPage, isPending: isCreatingPage } = useCreatePage();
    const navigate = useNavigate();

    const onClickScrape = (selector: string) => {
        createPage(
            { sessionId: sessionId ?? '', url: url ?? '', selector, pageName },
            {
                onSuccess: () => {
                    toast.success('Page created successfully');
                    navigate(`/sessions/${sessionId}`);
                },
            }
        );
    }

    const [selectedElement, setSelectedElement] = useState<Element | null>(null);
    
    const { theme } = useTheme();
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data.type === 'ELEMENT_SELECTED') {
                setSelectedElement(event.data);
                console.log(event.data);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const { data: previewData, isLoading: isLoadingPreview } = usePreview(url ?? '');

    if (isLoadingPreview) {
        return (
            <div className="flex items-center justify-center h-screen gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-text-secondary">Loading preview...</p>
            </div>
        );
    }

    if (!previewData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-sm text-text-secondary">No preview found</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden flex items-start gap-4 p-4">
            <div className="h-full flex-1 min-w-0 rounded-xl border border-border-default bg-bg-overlay shadow-sm overflow-hidden">
                <iframe srcDoc={previewData} className="w-full h-full" sandbox="allow-scripts allow-same-origin" />
            </div>

            <div className="w-[340px] shrink-0 flex flex-col rounded-xl border border-border-default bg-bg-overlay shadow-sm backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border-default bg-bg-secondary px-4 py-3">
                    <MousePointerClick className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-text-primary">Element Inspector</span>
                </div>

                {!selectedElement ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
                        <div className="h-10 w-10 rounded-full bg-bg-secondary border border-border-default flex items-center justify-center">
                            <MousePointerClick className="h-5 w-5 text-text-muted" />
                        </div>
                        <p className="text-sm text-text-muted text-center">
                            Click an element in the preview to inspect it
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                        <div className="flex items-center gap-2">
                            <Badge variant="info" className="font-mono text-[11px] tracking-wider">
                                &lt;{selectedElement.tag}&gt;
                            </Badge>
                        </div>

                        <TextContentRow
                            label="Selector"
                            icon={<Hash className="h-3 w-3" />}
                            value={selectedElement.selector}
                            allowScrape={true}
                            onClickScrape={() => onClickScrape(selectedElement.selector)}
                            isCreatingPage={isCreatingPage}
                        />
                        <TextContentRow
                            label="CSS Selector"
                            icon={<Code className="h-3 w-3" />}
                            value={selectedElement.cssSelector}
                            allowScrape={true}
                            isCreatingPage={isCreatingPage}
                            onClickScrape={() => onClickScrape(selectedElement.cssSelector)}
                        />
                        <DetailRow
                            theme={theme}
                            label="XPath"
                            icon={<Route className="h-3 w-3" />}
                            value={selectedElement.xpath}
                            mono
                        />
                        <TextContentRow
                            label="Text Content"
                            icon={<Type className="h-3 w-3" />}
                            value={selectedElement.textContent}
                        />
                        <TextContentRow
                            label="Classes"
                            icon={<List className="h-3 w-3" />}
                            value={selectedElement.attributes['class'] ?? 'No classes found'}
                            allowScrape={true}
                            isCreatingPage={isCreatingPage}
                            onClickScrape={() => onClickScrape(selectedElement.selector)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewPage;