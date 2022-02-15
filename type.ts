// 型の定義

// https://developer.mozilla.org/ja/docs/Web/API/Nodeより
type TEXT_NODE = 3;

type KeyAttribute = string | number;

type DOMAttributeName = "key" | string;

// propにはkeyやonclick、class、id等のHTMLElementの属性の名前が入る
interface DOMAttributes {
  key?: DOMAttributeName;
  [prop: string]: any;
}
interface HandlersType {
  [eventName: string]: (event: Event) => void;
}

type TextAttachedDOM = Text & {
  vdom?: VirtualNodeType;
};

type ElementAttachedNeedAttr = HTMLElement & {
  vdom?: VirtualNodeType;
  eventHandlers?: HandlersType; //handlersにイベントを入れておいてoninput等のイベントを管理する
};

type ExpandElement = ElementAttachedNeedAttr | TextAttachedDOM;

interface VirtualNodeType {
  name: HTMLElementTagNameMap | string; // divやh1等の場合はHTMLElementTagNameMap、文字を表すVNodeの場合はstring型
  props: DOMAttributes; //HTML要素の属性
  children: VirtualNodeType[]; //子要素のVNodeのリスト
  realNode: ExpandElement | null; //実際の要素への参照
  nodeType: TEXT_NODE | null; // このVNodeのタイプ(文字を表すノードなのか要素を表すノードなのか)
  key: KeyAttribute | null; //keyを表す
}
