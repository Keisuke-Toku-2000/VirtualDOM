import { h } from "./src/h";
import { render } from "./src/render";

interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
}

const setState = (state: string) => {
  const node = document.getElementById("app-container");
  const createKeyList = () => {
    return state.split(" ").map((value: string) => {
      return h("p", { key: value }, [`key: ${value}`]);
    });
  };

  if (node !== null) {
    render(
      node,
      h("div", {}, [
        h("h1", {}, [state]),
        h(
          "input",
          {
            type: "text",
            value: state,
            oninput: (e: HTMLElementEvent<HTMLInputElement>) =>
              setState(e.target.value),
            autofocus: true,
          },
          []
        ),
        h(
          "button",
          {
            onclick: (e: HTMLElementEvent<HTMLOListElement>) => setState(""),
          },
          ["reset"]
        ),
        h("div", { id: "container" }, createKeyList()),
      ])
    );
  }
};

setState("Hey");
