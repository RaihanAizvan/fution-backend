import { BlockType } from './block-type.enum';

type ListItem = {
  title?: string;
  description?: string;
  content?: string;
  text?: string;
};

export function normalizeBlockData(type: BlockType, data: any) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (type === BlockType.ACCORDION) {
    return {
      ...data,
      items: normalizeListItems(data.items, { requireDescription: true, allowDescription: true }),
    };
  }

  if (type === BlockType.CHECKLIST) {
    return {
      ...data,
      items: normalizeListItems(data.items, { requireDescription: false, allowDescription: true }),
    };
  }

  if (type === BlockType.PITFALLS) {
    return {
      ...data,
      items: normalizeListItems(data.items, { requireDescription: true, allowDescription: true }),
    };
  }

  return data;
}

function normalizeListItems(
  items: ListItem[],
  options: { requireDescription: boolean; allowDescription: boolean },
) {
  if (!Array.isArray(items)) {
    return items;
  }

  return items.map(item => {
    const title = item?.title ?? item?.text;
    const description = options.allowDescription
      ? item?.description ?? item?.content
      : undefined;

    const normalized: Record<string, string> = {};

    if (title !== undefined) {
      normalized.title = title;
    }

    if (options.allowDescription && description !== undefined) {
      normalized.description = description;
    }

    return normalized;
  });
}
