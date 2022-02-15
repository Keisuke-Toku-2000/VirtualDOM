import { createTextVNode, createVNode } from "./createVNodes";

export const TEXT_NODE = 3;

// createVNodeとcreateTextVNodeを使用してVNodeを返す関数
export const h = (
  name: VirtualNodeType["name"],
  props: VirtualNodeType["props"],
  children: (VirtualNodeType | string)[],
  realNode?: VirtualNodeType["realNode"]
) => {
  const VNodeChidren: VirtualNodeType[] = [];
  for (const child of children) {
    if (typeof child === "string") {
      const textNode = createTextVNode(child);
      VNodeChidren.push(textNode);
      continue;
    }
    VNodeChidren.push(child);
  }
  return createVNode(name, props, VNodeChidren, realNode, null, props.key);
};
