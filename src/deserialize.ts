import { parse } from "./parser.ts";
import { setLock } from "./constructor-lock.ts";
import { Node, NodeType, Text, Comment } from "./dom/node.ts";
import { Element } from "./dom/element.ts";

export function nodesFromString(html: string): Node {
  setLock(false);
  const parsed = JSON.parse(parse(html));
  const node = nodeFromArray(parsed, null);
  setLock(true);

  return node;
}

function nodeFromArray(data: any, parentNode: Node | null): Node {
  // data: [NodeType, [nodeName, attributes, childNodes] | [characterData]]
  const elm = new Element(data[1], parentNode, data[2]);
  const childNodes = elm.childNodes;
  let childNode: Node;

  for (const child of data.slice(3)) {
    switch (child[0]) {
      case NodeType.TEXT_NODE:
        childNode = new Text(child[1]);
        childNode.parentNode = childNode.parentElement = <Element> parentNode;
        childNodes.push(childNode);
        break;

      case NodeType.COMMENT_NODE:
        childNode = new Comment(child[1]);
        childNode.parentNode = childNode.parentElement = <Element> parentNode;
        childNodes.push(childNode);
        break;

      case NodeType.ELEMENT_NODE:
        childNodes.push(nodeFromArray(child, elm));
        break;
    }
  }

  return elm;
}

