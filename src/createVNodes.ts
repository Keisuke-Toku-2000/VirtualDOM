import { TEXT_NODE } from "./h";

// 引数を受け取り、実際にVNodeを作成
export const createVNode = (
  name: VirtualNodeType["name"],
  props: VirtualNodeType["props"],
  children: VirtualNodeType["children"],
  realNode?: VirtualNodeType["realNode"],
  nodeType?: VirtualNodeType["nodeType"],
  key?: KeyAttribute
): VirtualNodeType => {
  return {
    name,
    props,
    children,
    realNode: realNode === undefined ? null : realNode,
    nodeType: nodeType === undefined ? null : nodeType,
    key: key === undefined ? null : key,
  };
};

// createVNodeのTEXTときバージョン
export const createTextVNode = (
  name: string,
  realNode?: VirtualNodeType["realNode"]
) => {
  return createVNode(name, {}, [], realNode, TEXT_NODE);
};

// 本物のElementからVNodeを作成するための関数
export const createVNodeFromRealElement = (
  realElement: HTMLElement
): VirtualNodeType => {
  if (realElement.nodeType === TEXT_NODE) {
    return createTextVNode(realElement.nodeName, realElement);
  }
  const VNodeChidren: VirtualNodeType[] = [];
  const childrenLength = realElement.childNodes.length;
  for (let i = 0; i < childrenLength; i++) {
    const child = realElement.childNodes.item(i);
    if (child === null) {
      continue;
    }
    VNodeChidren.push(createVNodeFromRealElement(child as HTMLElement));
  }

  const props: VirtualNodeType["props"] = {};
  if (realElement.hasAttributes()) {
    const attributes = realElement.attributes;
    const attrLength = realElement.attributes.length;
    for (let i = 0; i < attrLength; i++) {
      const { name, value } = attributes[i];
      props[name] = value;
    }
  }

  return createVNode(
    realElement.nodeName.toLowerCase(),
    props,
    VNodeChidren,
    realElement,
    null
  );
};
