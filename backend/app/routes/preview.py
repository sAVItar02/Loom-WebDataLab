from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.services.preview import get_rendered_html

router = APIRouter(prefix="/preview", tags=["preview"])

@router.get("/", response_class=HTMLResponse)
def preview(url: str):
    try:
        html = get_rendered_html(url)

        picker = """
            <style>
                .__loom_tooltip {
                    position: fixed;
                    bottom: 8px;
                    left: 8px;
                    background: rgba(0,0,0,.82);
                    color: #fff;
                    font: 12px/1.4 monospace;
                    padding: 4px 8px;
                    border-radius: 4px;
                    z-index: 2147483647;
                    pointer-events: none;
                    max-width: 50vw;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            </style>
            <script>
            (function () {
                let _prev = null;
                let _prevOutline = "";

                const tooltip = document.createElement("div");
                tooltip.className = "__loom_tooltip";
                tooltip.style.display = "none";
                document.body.appendChild(tooltip);

                function getCssSelector(el) {
                    if (!(el instanceof Element)) return "";
                    const path = [];
                    while (el && el.nodeType === Node.ELEMENT_NODE) {
                        let selector = el.nodeName.toLowerCase();
                        if (el.id) {
                            selector += "#" + CSS.escape(el.id);
                            path.unshift(selector);
                            break;
                        }
                        const cls = (el.getAttribute("class") || "")
                            .trim().split(/\\s+/).filter(Boolean);
                        if (cls.length) {
                            selector += "." + cls.map(CSS.escape).join(".");
                        }
                        let sib = el, nth = 1;
                        while ((sib = sib.previousElementSibling)) {
                            if (sib.nodeName === el.nodeName) nth++;
                        }
                        selector += ":nth-of-type(" + nth + ")";
                        path.unshift(selector);
                        el = el.parentNode;
                    }
                    return path.join(" > ");
                }

                function getXPath(el) {
                    if (el.id) return '//*[@id="' + el.id + '"]';
                    const parts = [];
                    while (el && el.nodeType === Node.ELEMENT_NODE) {
                        let idx = 1, sib = el.previousSibling;
                        while (sib) {
                            if (sib.nodeType === 1 && sib.nodeName === el.nodeName) idx++;
                            sib = sib.previousSibling;
                        }
                        parts.unshift(el.nodeName.toLowerCase() + "[" + idx + "]");
                        el = el.parentNode;
                    }
                    return "/" + parts.join("/");
                }

                function getAttributes(el) {
                    const attrs = {};
                    for (const a of el.attributes) attrs[a.name] = a.value;
                    return attrs;
                }

                function shortSelector(el) {
                    const tag = el.tagName.toLowerCase();
                    if (el.id) return tag + "#" + el.id;
                    const cls = (el.getAttribute("class") || "")
                        .trim().split(/\\s+/).filter(Boolean);
                    if (cls.length) return tag + "." + cls.join(".");
                    return tag;
                }

                document.addEventListener("mouseover", function (e) {
                    const t = e.target;
                    if (t === tooltip) return;
                    if (_prev && _prev !== t) _prev.style.outline = _prevOutline;
                    _prevOutline = t.style.outline;
                    t.style.outline = "2px solid #e74c3c";
                    _prev = t;
                    tooltip.textContent = shortSelector(t);
                    tooltip.style.display = "block";
                }, true);

                document.addEventListener("mouseout", function (e) {
                    const t = e.target;
                    if (t === tooltip) return;
                    t.style.outline = _prevOutline;
                    _prev = null;
                    tooltip.style.display = "none";
                }, true);

                document.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    const el = e.target;
                    const text = (el.textContent || "").trim();

                    window.parent.postMessage({
                        type: "ELEMENT_SELECTED",
                        tag: el.tagName.toLowerCase(),
                        selector: shortSelector(el),
                        cssSelector: getCssSelector(el),
                        xpath: getXPath(el),
                        attributes: getAttributes(el),
                        textContent: text.length > 200 ? text.slice(0, 200) : text,
                        innerHtml: el.innerHTML.length > 500 ? el.innerHTML.slice(0, 500) : el.innerHTML
                    }, "*");
                }, true);
            })();
            </script>
        """ 

        html = html.replace("<head>", f'<head><base href="{url}">')
        html = html.replace("</body>", picker + "</body>")

        return HTMLResponse(content=html, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))