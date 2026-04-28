import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

/**
 * Renders raw markdown string to sanitized HTML string.
 * Supports GitHub Flavored Markdown (GFM) and syntax highlighting for code blocks.
 *
 * @param markdown - The raw markdown content to render.
 * @returns A promise that resolves to the rendered HTML string.
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {

    const result = await remark()
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdown);

    return result.toString();
}
