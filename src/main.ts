import { Counter } from "./counter.ts";
import { createListValues } from "./lib/createListValue.ts";
import { createTag } from "./lib/createTag.ts";
import { createValue } from "./lib/createValue.ts";
import { createRoot } from "./lib/dom.ts";
import { createEffect } from "./lib/effect.ts";
import "./style.css";

const [textTagFactory, textHandlers] = createValue("Initial value new");
const [listFactory, listHandlers] = createListValues(["a", "b"]);

createEffect(() => {
  console.log("Items in list", listHandlers.getValues().length);
});

const LI = listFactory({
  tag: "ol",
  attributes: {},
  dynamic: true,
  itemsDefinition: {
    // tag: "li",
    afterItemCreated: ({ useValue }) => {
      const [itemFactory, itemHandler] = useValue;

      // input
      const modifyInput = itemFactory({
        tag: "input",
        // options: { model: "value" },
        attributes: {
          onKeydown: (e) => {
            if (e.key === "Enter")
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
      createTag(
        "button",
        {
          onClick: () => listHandlers.setValues((prev) => [...prev, "new"]),
        },
        "Add new value",
      ),
      LI,
      createTag(
        "button",
        {
          onClick: () => {
            listHandlers.clear();
            console.log("****:values", listHandlers.getValues());
          },
        },
        "Clear List",
      ),
      createTag(
        "button",
        {
          onClick: () => {
            console.log("****:values", listHandlers.getValues());
          },
        },
        "Log values",
      ),
    ),
  ),
  Counter(),
);

createRoot("#app", html);

