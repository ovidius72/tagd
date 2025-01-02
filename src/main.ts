import { Counter } from "./counter.ts";
import { createListValues } from "./lib/createListValue.ts";
import { createTag } from "./lib/createTag.ts";
import { createValue } from "./lib/createValue.ts";
import { createRoot } from "./lib/dom.ts";
import "./style.css";

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

const [textTagFactory, textHandlers] = createValue("Initial value new");
const [listFactory, listHandlers] = createListValues(["a", "b"]);

const LI = listFactory({
  tag: "ol",
  attributes: {},
  itemsDefinition: {
    // tag: "li",
    afterItemCreated: (_el, _value, itemValue, _args, _index) => {
      const [itemFactory, itemHandler] = itemValue;
      // input
      const modifyInput = itemFactory({
        tag: "input",
        options: { model: "value" },
        attributes: {
          onInput: (e) => {
            console.log("*****: e", e);
            itemHandler.set((e.target as HTMLInputElement).value);
          },
        },
      });

      // value
      const itemValueSpan = itemFactory("span");

      // wrapper tag
      const tag = createTag(
        "li",
        null,
        itemValueSpan,
        modifyInput,
        createTag(
          "button",
          {
            onClick() {
              listHandlers.removeNode(tag);
            },
          },
          `Remove`,
        ),
      );
      return tag;
    },
  },
});

const Input = textTagFactory({
  tag: "input",
  options: { model: "value" },
  attributes: {
    onInput(e) {
      const { value } = e.target as HTMLInputElement;

      textHandlers.set(value);
    },
    onKeydown(e) {
      console.log("****:e", e);
      const { value } = e.target as HTMLInputElement;
      if (e.key === "2") {
        listHandlers.insertAt(2, `Second ${value}`);
      }
      if (e.key === "ArrowDown") {
        listHandlers.append(value);
      }
      if (e.key === "ArrowUp") {
        listHandlers.prepend(value);
      }
    },
  },
});

// createEffect(() => {
//   const newVal = getter();
//   console.log("****:newVal", newVal);
//   (Input as any).value = newVal;
// });

const html = createTag(
  "ul",
  { a: 2 },
  createTag("li", { class: "aclass" }, "uno"),
  createTag("li", null, "due"),
  createTag(
    "ul",
    null,
    createTag(
      "li",
      { id: "11", styles: { backgroundColor: "red" }, className: "className" },
      "due-uno",
    ),
    createTag(
      "li",
      {
        ariaLabel: "test",
        className: "inner",
      },
      Input,
      textTagFactory("span"),
      textTagFactory({
        tag: "p",
        attributes: {
          styles: {
            backgroundColor: "peachpuff",
            padding: "18px",
            borderRadius: "6px",
          },
        },
      }),
      LI,
    ),
  ),
  Counter(),
);

createRoot("#app", html);

