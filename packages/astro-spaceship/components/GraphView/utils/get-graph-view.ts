
import { getCollection } from "astro:content";

import type { Document, GraphViewNode, GraphViewLink } from "../../../types";
import { DOCUMENTS_COLLECTION_NAME } from "../../../constants";

export const getGraphView = async (slug?: string, collectionName = DOCUMENTS_COLLECTION_NAME) => {
  const allDocuments = await getCollection(collectionName) as Document[];
  const nodes = new Map<string, GraphViewNode>();
  const links: GraphViewLink[] = [];

  const addToNodes = (id: string, title?: string, href?: string, group?: string) => {
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        href,
        title,
        radius: 5,
        group,
      })
    } else {
      const node = nodes.get(id) as GraphViewNode;

      node.radius = node.radius + .3;
      node.title = node.title ?? title;
      node.group = node.group ?? group;
      node.href = node.href ?? href;
    }
  };

  const addToLinks = (source: string, target: string, value: number) => {
    links.push({
      source,
      target,
      value,
    })
  };

  for (const doc of allDocuments) {
    const matchesSlug = !slug || doc.id === slug || doc.data.links?.some(l => l.id === slug);

    if (!matchesSlug) {
      continue;
    }

    addToNodes(doc.id, doc.data.title, doc.data.permalink, doc.id.split('/')[0]);

    for (const link of doc.data.links ?? []) {
      const isSlugLink = !slug || doc.id === slug || link.id === slug;

      if (link.id && link.href && isSlugLink) {
        addToLinks(doc.id, link.id, 1);
        const linkedNode = allDocuments.find(d => d.id === link.id);
        addToNodes(link.id, linkedNode?.data.title ?? link.title, link.href, link.id.split('/')[0]);
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
  };
}