import { createListValues } from "../lib/createListValue";
import { createValue } from "../lib/createValue";
import { createEffect } from "../lib/effect";

const items = [
  { title: "Buy Milk", completed: false },
  { title: "Feed the dog ", completed: true },
  { title: "Wash the car", completed: false },
];

export const [todoListFactory, todoListHandlers] = createListValues(items);

export const [totalItemsFactory, totalItemsHandlers] = createValue(
  items.filter((i) => !!i.completed).length,
);

export const [remainingItemsFactory, remainingItemsHandlers] = createValue(
  items.filter((i) => !i.completed).length,
);

createEffect(() => {
  const values = todoListHandlers.getValues();
  console.log("todoListHandlers", values);
  totalItemsHandlers.set(values.filter((i) => !!i.completed).length);
  remainingItemsHandlers.set(values.filter((i) => !i.completed).length);
});

