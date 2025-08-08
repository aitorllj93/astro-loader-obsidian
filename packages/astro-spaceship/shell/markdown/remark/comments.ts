import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Text, PhrasingContent } from "mdast";

const remarkComments: Plugin<[], Root> = () => {
  return (tree: Root): void => {
    let inCommentBlock = false;

    visit(tree, "paragraph", (node, index, parent) => {
      const newChildren: PhrasingContent[] = [];

      for (const child of node.children) {
        if (child.type === "text") {
          const value = child.value;

          if (value.includes("%%")) {
            const parts = value.split(/(%%.*?%%)/g);
            for (const part of parts) {
              if (part.startsWith("%%") && part.endsWith("%%")) {
                // Comentario inline: se omite
                continue;
              }
              newChildren.push({
                ...child,
                value: part,
              });
            }
          } else {
            newChildren.push(child);
          }
        } else {
          newChildren.push(child);
        }
      }

      node.children = newChildren;

      if (
        node.children.length === 1 &&
        node.children[0]?.type === "text"
      ) {
        const text = (node.children[0] as Text).value.trim();

        if (text.startsWith("%%") && !text.endsWith("%%")) {
          inCommentBlock = true;
          if (index !== undefined && parent?.children) (parent.children[index] as unknown) = null;
          return;
        }

        if (inCommentBlock) {
          if (text.endsWith("%%")) {
            inCommentBlock = false;
          }
          if (index !== undefined && parent?.children) (parent.children[index] as unknown) = null;
          return;
        }
      }

      if (inCommentBlock && index !== undefined && parent?.children) {
        (parent.children[index] as unknown) = null;
      }
    });

    tree.children = tree.children.filter(Boolean);
  };
};

export default remarkComments;
