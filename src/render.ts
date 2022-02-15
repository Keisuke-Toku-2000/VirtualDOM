import {
  createRealNodeFromVNode,
  mergeProperties,
  patchProperty,
} from "./createRealNode";
import { createVNodeFromRealElement } from "./createVNodes";
import { TEXT_NODE } from "./h";

export const render = (
  realNode: ElementAttachedNeedAttr,
  newVNode: VirtualNodeType
): void => {
  if (realNode.parentElement === null) {
    console.error(
      "Error! render func does not work, because the realNode does not have parentNode attribute."
    );
    return;
  }

  // realNodeごと追加更新削除処理にかける
  const vnodeFromRealElement = createVNodeFromRealElement(realNode);

  let oldVNode: VirtualNodeType | null;
  if (realNode.vdom === undefined) {
    oldVNode = { ...vnodeFromRealElement };
  } else {
    oldVNode = realNode.vdom;
  }

  // 新しいvnodeを元々のノードのvnodeのchildrenに格納し、それをnewVNodeに代入。
  vnodeFromRealElement.children = [newVNode];
  newVNode = vnodeFromRealElement;

  renderNode(realNode.parentElement, realNode, oldVNode, newVNode);
};

// 渡された要素は更新するがそのchildrenは更新しない
const updateThisNodeProperty = (
  realNode: VirtualNodeType["realNode"],
  oldVNode: VirtualNodeType,
  newVNode: VirtualNodeType
) => {
  if (realNode !== null) {
    for (const propName in mergeProperties(oldVNode.props, newVNode.props)) {
      let compareValue;
      // inputやcheckbox等の入力系
      if (propName === "value" || propName === "checked") {
        compareValue = (realNode as HTMLInputElement)[propName];
      } else if (propName === "selected") {
        //型の関係でselectedだけvalue,checkedと別で比較
        compareValue = (realNode as HTMLOptionElement)[propName];
      } else {
        compareValue = oldVNode.props[propName];
      }
      if (compareValue !== newVNode.props) {
        patchProperty(
          realNode as ElementAttachedNeedAttr,
          propName,
          oldVNode.props[propName],
          newVNode.props[propName]
        );
      }
    }
  } else {
    console.error(
      `Error! updateThisNodeProperty does not work, because realNode is null.\n
      [info]: oldVNode.name: ${oldVNode.name}, newVNode.name: ${newVNode.name}
      `
    );
  }
  return realNode;
};

const renderTextNode = (
  realNode: VirtualNodeType["realNode"],
  newVNode: VirtualNodeType
): VirtualNodeType["realNode"] => {
  if (realNode === null) {
    console.error(
      "Error! renderTextNode does not work, because redering nodeType is TEXT_NODE, but realNode is null. can't add text to node"
    );
    return realNode;
  }
  if (typeof newVNode.name !== "string") {
    console.error(
      "Error! renderTextNode does not work, because rendering nodeType is TEXT_NODE, but newNode.name is not string."
    );
    return realNode;
  }
  realNode.nodeValue = newVNode.name;
  return realNode;
};

const renderNode = (
  parentNode: HTMLElement,
  realNode: VirtualNodeType["realNode"],
  oldVNode: VirtualNodeType | null,
  newVNode: VirtualNodeType
) => {
  // 1. 以前と変わっていない場合何もしない
  if (newVNode === oldVNode) {
  }
  // 2. TEXTの要素だけ変化しているとき
  if (
    oldVNode !== null &&
    oldVNode.nodeType === TEXT_NODE &&
    newVNode.nodeType === TEXT_NODE
  ) {
    realNode = renderTextNode(realNode, newVNode);
  }

  // 3. 要素の追加、要素が変わったとき
  // ex: <div></div> -> <span></span>　みたいな変化
  else if (oldVNode === null || oldVNode.name !== newVNode.name) {
    const newRealNode = createRealNodeFromVNode(newVNode);
    if (newRealNode) {
      parentNode.insertBefore(newRealNode, realNode);
    }
    if (oldVNode && oldVNode.realNode && parentNode) {
      parentNode.removeChild(oldVNode.realNode);
    }
  }

  // 4. 要素の更新
  else {
    realNode = updateThisNodeProperty(realNode, oldVNode, newVNode);
    if (realNode !== null) {
      // 子要素作成、削除、更新処理
      let oldChildNowIndex = 0;
      let newChildNowIndex = 0;
      const oldChildrenLength = oldVNode.children.length;
      const newChildrenLength = newVNode.children.length;

      // 子要素の追加や削除処理の為にoldVNodeでkeyがある要素の連想配列が必要な為作成
      // keyを持つoldVNodeをすべて保存する(VirtualNodeType型のkey(string|number))
      let hasKeyOldNodeChildren: { [key in KeyAttribute]: VirtualNodeType } =
        {};
      for (const child in oldVNode.children) {
        const childrenKey = (child as unknown as VirtualNodeType).key;
        if (childrenKey !== null) {
          hasKeyOldNodeChildren[childrenKey] =
            child as unknown as VirtualNodeType;
        }
      }

      // 同様に子要素の追加や削除処理の為にoldVNodeでkeyがある要素の連想配列が必要な為作成
      // keyをもつnewVNodeで既に更新されたものを格納するオブジェクト
      const renderedNewChildren: { [key in KeyAttribute]: "isRendered" } = {};

      while (newChildNowIndex < newChildrenLength) {
        let oldChildVNode: VirtualNodeType | null;
        let oldKey!: KeyAttribute | null;
        if (oldVNode.children[oldChildNowIndex] === undefined) {
          oldChildVNode = null;
          oldKey = null;
        } else {
          oldChildVNode = oldVNode.children[oldChildNowIndex];
          oldKey = oldChildVNode.key;
        }

        const newChildVNode = newVNode.children[newChildNowIndex];
        const newKey = newVNode.key;

        // 既にrenderされたoldChildVNodeをスキップする
        if (oldKey !== null && renderedNewChildren[oldKey] === "isRendered") {
          oldChildNowIndex++;
          continue;
        }

        // NOTE: keyを持っていない削除するべき要素を削除する処理
        // ※keyを持っている削除するべきものは最後にまとめて処理する。
        if (
          newKey !== null &&
          oldChildVNode !== null &&
          oldChildVNode.children[oldChildNowIndex + 1] !== undefined &&
          newKey === oldChildVNode.children[oldChildNowIndex + 1].key
        ) {
          if (oldKey === null) {
            realNode.removeChild(
              oldChildVNode.realNode as ElementAttachedNeedAttr
            );
          }
          oldChildNowIndex++;
          continue;
        }

        if (newKey === null) {
          if (oldKey === null) {
            renderNode(
              realNode as ElementAttachedNeedAttr,
              oldChildVNode === null ? null : oldChildVNode.realNode,
              oldChildVNode,
              newChildVNode
            );
            newChildNowIndex++;
          }
          oldChildNowIndex++;
        } else {
          // 以前のrender時とkeyが変わっていなかった場合、更新
          if (oldChildVNode !== null && oldKey === newKey) {
            const childRealNode = oldChildVNode.realNode;
            renderNode(
              realNode as ElementAttachedNeedAttr,
              childRealNode,
              oldChildVNode,
              newChildVNode
            );
            renderedNewChildren[newKey] = "isRendered";
            oldChildNowIndex++;
          } else {
            const previousRenderValue = hasKeyOldNodeChildren[newKey];
            // 以前のrender時には既にこのkeyを持つ要素が存在していた場合
            if (
              previousRenderValue !== null &&
              previousRenderValue !== undefined
            ) {
              renderNode(
                realNode as ElementAttachedNeedAttr,
                previousRenderValue.realNode,
                previousRenderValue,
                newChildVNode
              );
              renderedNewChildren[newKey] = "isRendered";
            }
            // keyを持つ要素の追加処理
            else {
              renderNode(
                realNode as ElementAttachedNeedAttr,
                null,
                null,
                newChildVNode
              );
            }
            renderedNewChildren[newKey] = "isRendered";
          }
          newChildNowIndex++;
        }
      }
      // 前のwhile処理で利用されなかった到達しなかった子要素のindexのうちkeyを持っていないモノを削除
      while (oldChildNowIndex < oldChildrenLength) {
        const unreachOldVNode = oldVNode.children[oldChildNowIndex];
        if (unreachOldVNode.key === null || unreachOldVNode.key === undefined) {
          if (unreachOldVNode.realNode !== null) {
            realNode.removeChild(unreachOldVNode.realNode);
          }
        }
        oldChildNowIndex++;
      }
      // keyをもつoldVNodeの子要素の中で新しいVNodeでは削除されているものを削除
      for (const oldKey in hasKeyOldNodeChildren) {
        if (
          renderedNewChildren[oldKey] === null ||
          renderedNewChildren[oldKey] === undefined
        ) {
          const willRemoveNode = hasKeyOldNodeChildren[oldKey].realNode;
          if (willRemoveNode) {
            realNode.removeChild(willRemoveNode);
          }
        }
      }
    }
  }
  if (realNode !== null) {
    // NOTE newVNodeに対応する実際の要素を代入する。これを次の更新の際に使う
    newVNode.realNode = realNode;
    // NOTE 今後更新する際に差分を検出する為実際のHTML要素に対してvdomプロパティを加える
    // このvdomプロパティが次の更新の際のoldVNodeになる
    realNode.vdom = newVNode;
  }
  return realNode;
};
