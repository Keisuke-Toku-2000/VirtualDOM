import { TEXT_NODE } from "./h";

// VNodeからrealNodeを作成
export const createRealNodeFromVNode = (VNode: VirtualNodeType) => {
  let realNode: ElementAttachedNeedAttr | TextAttachedDOM;
  if (VNode.nodeType === TEXT_NODE) {
    if (typeof VNode.name !== "string") {
      console.error(
        "Error! createRealNodeFromVNode does not work, because rendering nodeType is TEXT_NODE, but VNode.name is not string"
      );
      return null;
    }
    realNode = document.createTextNode(VNode.name);
    // NOTE: 要素を新しく作成する場合はchildrenに対してcreateRealNodeFromVNodeを再帰的に
    // 呼んでいる関係でここでVNodeとrealNodeの相互参照を作成する
    VNode.realNode = realNode;
    realNode.vdom = VNode;
  } else {
    realNode = document.createElement(VNode.name as string);
    for (const propName in VNode.props) {
      patchProperty(realNode, propName, null, VNode.props[propName]);
    }
    // NOTE: 要素を新しく作成する場合はchildrenに対してcreateRealNodeFromVNodeを再帰的に
    // 呼んでいる関係でここでVNodeとrealNodeの相互参照を作成する
    VNode.realNode = realNode;
    realNode.vdom = VNode;

    for (const child of VNode.children) {
      const realChildNode = createRealNodeFromVNode(child);
      if (realChildNode !== null) {
        realNode.append(realChildNode);
      }
    }
  }
  return realNode;
};

export const patchProperty = (
  realNode: ElementAttachedNeedAttr,
  propName: DOMAttributeName,
  oldPropValue: any,
  newPropValue: any
) => {
  // NOTE: key属性は一つのrealNodeに対して固有でないといけないから変更しない
  if (propName === "key") {
  }
  // イベントリスナー属性について
  else if (propName[0] === "o" && propName[1] === "n") {
    const eventName = propName.slice(2).toLowerCase();

    if (realNode.eventHandlers === undefined) {
      realNode.eventHandlers = {};
    }

    realNode.eventHandlers[eventName] = newPropValue;

    if (
      newPropValue === null ||
      newPropValue === undefined ||
      newPropValue === false
    ) {
      realNode.removeEventListener(eventName, listenerFunc);
    } else if (!oldPropValue) {
      realNode.addEventListener(eventName, listenerFunc);
    }
  }
  // 属性を削除する場合
  else if (newPropValue === null || newPropValue === undefined) {
    realNode.removeAttribute(propName);
  } else {
    realNode.setAttribute(propName, newPropValue);
  }
};

// NOTE: ElementAttachedNeedAttr.handlersに存在する関数を呼びだすだけの関数
// イベント追加時にこれをaddEventListenerする事でイベント変更時にElementAttachedNeedAttr.handlersの関数を変えるだけで良い
const listenerFunc = (event: Event) => {
  const realNode = event.currentTarget as ElementAttachedNeedAttr;
  if (realNode.eventHandlers !== undefined) {
    realNode.eventHandlers[event.type](event);
  }
};

export const mergeProperties = (
  oldProps: DOMAttributes,
  newProps: DOMAttributes
) => {
  const mergedProperties: DOMAttributes = {};

  for (const propName in oldProps) {
    mergedProperties[propName] = oldProps[propName];
  }

  for (const propName in newProps) {
    mergedProperties[propName] = newProps[propName];
  }

  return mergedProperties;
};
