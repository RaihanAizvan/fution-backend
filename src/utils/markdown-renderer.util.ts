import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
    const result = await remark()
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdown);

    return result.toString();
}
