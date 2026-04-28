import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { createHighlighter, Highlighter } from 'shiki';
import { visit } from 'unist-util-visit';

let highlighter: Highlighter | null = null;

/**
 * Initializes the Shiki highlighter singleton.
 */
async function getHighlighter(): Promise<Highlighter> {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-dark'],
            langs: [
                'javascript',
                'typescript',
                'python',
                'html',
                'css',
                'json',
                'yaml',
                'markdown',
                'bash',
                'sql',
            ],
        });
    }
    return highlighter;
}

/**
 * Custom rehype plugin to use Shiki for syntax highlighting.
 */
function rehypeShiki(highlighter: Highlighter) {
    return (tree: any) => {
        visit(tree, 'element', (node: any) => {
            if (
                node.tagName === 'pre' &&
                node.children &&
                node.children.length === 1 &&
                node.children[0].tagName === 'code'
            ) {
                const codeNode = node.children[0];
                const className = codeNode.properties?.className || [];
                const lang =
                    className
                        .find((c: string) => c.startsWith('language-'))
                        ?.replace('language-', '') || 'text';

                const codeContent =
                    codeNode.children.map((child: any) => child.value).join('') || '';

                // Use Shiki to generate HAST
                const hast = highlighter.codeToHast(codeContent, {
                    lang,
                    theme: 'github-dark',
                });

                // The hast returned by Shiki is a root node. The actual 'pre' is in its children.
                const shikiPre = (hast as any).children[0];

                // Transfer Shiki's properties and children to the current node
                node.tagName = shikiPre.tagName;
                node.properties = shikiPre.properties;
                node.children = shikiPre.children;
            }
        });
    };
}

/**
 * Renders raw markdown string to sanitized HTML string.
 * Supports GitHub Flavored Markdown (GFM) and high-quality syntax highlighting via Shiki.
 *
 * @param markdown - The raw markdown content to render.
 * @returns A promise that resolves to the rendered HTML string.
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
    const h = await getHighlighter();

    const result = await remark()
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeShiki, h)
        .use(rehypeStringify)
        .process(markdown);

    return result.toString();
}
