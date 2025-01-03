import { createTag } from "./lib/createTag";
import { createValue } from "./lib/createValue";
import {
  remainingItemsFactory,
  todoListFactory,
  todoListHandlers,
  totalItemsFactory,
} from "./todos/store";

export const TodoApp = () => {
  const [inputFactory] = createValue("");

  const Input = inputFactory({
    tag: "input",
    options: { model: "value" },
    attributes: {
      onKeydown(e, el) {
        const { value } = e.target as HTMLInputElement;
        if (e.code === "Enter") {
          todoListHandlers.append({ title: value, completed: false });
          (el as HTMLInputElement).value = "";
        }
      },
    },
  });

  const RemainingItemsCount = remainingItemsFactory("p");

  const TotalItemsCount = totalItemsFactory("p");

  const TodoList = todoListFactory({
    tag: "ul",
    itemsDefinition: {
      attributes: (data) => ({
        class: data.completed ? "completed" : "pending",
        styles: {
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "12px",
          textAlign: "left",
          backgroundColor: data.completed ? "maroon" : "indianred",
          color: data.completed ? "palevioletred" : "mistyrose",
        },
      }),
      slots: ({ index }) => {
        return [
          {
            name: "index",
            fieldMap: (data, index) => `${index + 1} - ${data.title}`,
            tag: "span",
            attributes: (data) =>
              data.completed
                ? { className: "completed" }
                : { className: "not-completed" },
          },
          {
            name: "title",
            fieldMap: "title",
            tag: "span",
          },
          {
            name: "checked",
            model: "checked",
            fieldMap: "completed",
            attributes: {
              type: "checkbox",
              onClick: () => {
                const currentValue = todoListHandlers.getItemValue(index);
                todoListHandlers.setItemValue(index, {
                  ...currentValue,
                  completed: !currentValue.completed,
                });
              },
            },
            tag: "input",
          },
        ];
      },
      options: {
        keyMap: (item) => item.title.toString(),
      },
    },
    attributes: (data) => {
      return {
        className: data.every((item) => item.completed)
          ? "completed list-attributes"
          : "not-completed listAttributes",
        styles: {
          padding: "8px",
          margin: "50px auto",
          maxWidth: "800px",
          borderRadius: "12px",
          border: "2px solid palevioletred",
        },
      };
    },
  });

  return createTag(
    "div",
    {
      styles: {
        padding: "0",
        margin: "0",
      },
    },
    createTag("h1", {}, "Todo App"),
    Input,
    TodoList,
    createTag("p", null, "Completed Items: ", TotalItemsCount),
    createTag("p", null, "Remaining Items: ", RemainingItemsCount),
    createTag(
      "button",
      {
        onClick: () => {
          console.log("Total Items", todoListHandlers.getValues());
        },
      },
      "print items",
    ),
  );
};

