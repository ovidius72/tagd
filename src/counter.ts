import { createTag } from "./lib/createTag";
import { createValue } from "./lib/createValue";

const Counter = () => {
  const [tagFactory, handlers] = createValue(1);

  const Text = tagFactory({
    tag: "span",
    attributes: {
      styles: {
        color: "blue",
        fontSize: "1.3rem",
        fontWeight: "bold",
      },
    },
  });

  return createTag(
    "div",
    { styles: { backgroundColor: "lightgray" } },
    createTag(
      "div",
      {
        styles: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          margin: "2rem",
          backgroundColor: "peachpuff",
          padding: "6px",
        },
      },
      createTag("h1", null, "Counter"),
      createTag("p", null, "Count is: ", Text),
      createTag(
        "button",
        {
          onClick: () => handlers.set((v) => v + 1),
        },
        "Increment",
      ),
      createTag(
        "button",
        {
          onClick: () => handlers.set((v) => v - 1),
        },
        "Decrement",
      ),
    ),
  );
};

export { Counter };

