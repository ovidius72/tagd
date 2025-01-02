import { createValue } from "./createValue";
import { effectCallback } from "./effect";
import { Signal } from "./signal";
import {
  BuilderArgs,
  CreateListValueResult,
  ListBuilderArgs,
  ListDefinition,
  ListHandlers,
  ListItemsDefinition,
  ValueStoreType,
} from "./types";

import { buildAttributes, generateUUID, isElement } from "./utils";

const DEFAULT_LIST_ITEM_TAG = "li";
const DATA_TAGR_ID = "data-tagr-id";

export const createListValues = <T>(
  initialValue?: Array<T>,
): CreateListValueResult<T> => {
  const mainTags: ListDefinition<T>[] = [];

  let valueStore: ValueStoreType<T>[] = (initialValue || []).map((val) => ({
    id: generateUUID(),
    useValue: createValue(val),
    value: val,
  }));

  const valueStoreSignal = new Signal(valueStore);

  const handleOnListChanged = (list: ListDefinition<T>, event: string) => {
    const {
      definition: { debug },
    } = list;
    if (debug) {
      console.log("^^^^^^^^^^^^^^^^ ListChanged: ", list);
      console.log("*****: event", event);
    }
  };

  const handleOnItemChanged = (
    valueStore: ValueStoreType<T>,
    event: string,
    list?: ListDefinition<T>,
  ) => {
    if (list && list.definition?.debug) {
      console.log("&&&&&&&&&&&&&&&&& ItemChanged", valueStore);
      console.log("*****: event", event);
    }
  };

  const append: ListHandlers<T>["append"] = (value) => {
    const useValue = createValue(value);
    const id = generateUUID();
    const newValueStore: ValueStoreType<T> = {
      useValue,
      value,
      id,
    };

    valueStore.push(newValueStore);
    valueStoreSignal.setValue(valueStore);

    mainTags.forEach((list) => {
      const { definition } = list;
      const { itemsDefinition } = definition || {};

      const {
        tag: itemTag = DEFAULT_LIST_ITEM_TAG,
        attributes: itemAttributes,
      } = itemsDefinition || {};

      const item = buildItem(
        newValueStore,
        valueStore.length - 1,
        {
          tag: itemTag,
          attributes: { ...itemAttributes, [DATA_TAGR_ID]: id },
        },
        list,
      );
      list.el.append(item);
      handleOnListChanged(list, "append");
    });
  };

  const prepend: ListHandlers<T>["prepend"] = (value) => {
    const useValue = createValue(value);
    const id = generateUUID();
    const newValueStore: ValueStoreType<T> = {
      id,
      value,
      useValue,
    };
    valueStore = [{ id, useValue, value: value }, ...valueStore];
    valueStoreSignal.setValue(valueStore);

    mainTags.forEach((list) => {
      const { definition } = list;
      const itemArgs = {
        tag: list.definition.itemsDefinition?.tag || DEFAULT_LIST_ITEM_TAG,
        attributes: { ...definition.attributes, [DATA_TAGR_ID]: id },
      };
      const item = buildItem(newValueStore, 0, itemArgs, list);
      list.el.prepend(item);
      handleOnListChanged(list, "prepend");
    });
  };

  const insertAt: ListHandlers<T>["insertAt"] = (index, value) => {
    const useValue = createValue(value);
    const id = generateUUID();
    const newValueStore: ValueStoreType<T> = {
      useValue,
      value,
      id,
    };
    valueStore = [
      ...valueStore.slice(0, index),
      newValueStore,
      ...valueStore.slice(index),
    ];
    valueStoreSignal.setValue(valueStore);

    mainTags.forEach((list) => {
      const {
        definition: { tag: listTag = DEFAULT_LIST_ITEM_TAG, itemsDefinition },
      } = list || {};

      const {
        attributes: itemAttributes,
        options,
        tag,
      } = itemsDefinition || {};

      const item = buildItem(
        newValueStore,
        index,
        { attributes: itemAttributes, tag: tag || listTag, options },
        list,
      );
      if (list.el.children.length > 0) {
        const existingEl = list.el.children[index];
        list.el.insertBefore(item, existingEl);
        handleOnListChanged(list, "insert");
      } else {
        list.el.append(item);
        handleOnListChanged(list, "append");
      }
    });
  };

  // const update: ListHandlers<T>["update"] = (index, item) => {
  //   items = items.with(index, item) as T;
  //   return items[index] as ArrayElement<T>;
  // };

  const removeAt: ListHandlers<T>["removeAt"] = (index) => {
    mainTags.forEach((list) => {
      const node = list.el.childNodes[index];
      if (node) {
        list.el.removeChild(node);
        valueStore.splice(index, 1);
        valueStoreSignal.setValue(valueStore);
        handleOnListChanged(list, "removeAt");
      }
    });
  };

  const removeNode: ListHandlers<T>["removeNode"] = (node) => {
    const idAttribute = node.attributes.getNamedItem(DATA_TAGR_ID);
    mainTags.forEach((list) => {
      if (node && idAttribute) {
        list.el.removeChild(node);
        valueStore = valueStore.filter(
          (value) => value.id !== idAttribute.value,
        );
        valueStoreSignal.setValue(valueStore);
        handleOnListChanged(list, "removeNode");
      }
    });
  };

  const clear = () => {
    mainTags.forEach((list) => {
      list.el.innerHTML = "";
      handleOnListChanged(list, "clear");
    });
    valueStore = [];
    valueStoreSignal.setValue(valueStore);
  };

  const rebuild = () => {
    mainTags.forEach((list) => {
      const { definition } = list;
      const itemArgs = {
        tag: definition.itemsDefinition?.tag || DEFAULT_LIST_ITEM_TAG,
        attributes: { ...definition.attributes },
      };
      const children = buildItems(itemArgs, list);
      list.el.innerHTML = "";
      list.el.append(...children);
      handleOnListChanged(list, "rebuild");
    });
  };

  const listFactory = (data: ListBuilderArgs<T> | string): HTMLElement => {
    let args: ListBuilderArgs<T> | undefined = undefined;
    if (typeof data === "string") {
      args = {
        itemsDefinition: {
          tag: "li",
          attributes: {},
          options: {},
        },
        tag: data,
        attributes: {},
      };
    } else {
      args = {
        ...data,
        attributes: { ...data.attributes },
        itemsDefinition: { tag: "li", ...data.itemsDefinition },
      };
    }

    const {
      tag: listTag = DEFAULT_LIST_ITEM_TAG,
      itemsDefinition,
      attributes: listAttributes = {},
    } = args || {};

    let { tag: itemTag = DEFAULT_LIST_ITEM_TAG } = itemsDefinition || {};
    const { attributes: itemAttributes, options: itemOptions } =
      itemsDefinition || {};

    // mainTags
    const listElement =
      listTag && isElement(listTag) ? listTag : document.createElement(listTag);

    buildAttributes({ attributes: listAttributes }, listElement);

    const listDefinition: ListDefinition<T> = {
      el: listElement,
      definition: args,
    };
    mainTags.push(listDefinition);

    if (!itemTag) {
      itemTag = "li";
    }

    const itemArgs: BuilderArgs<T> = {
      tag: itemTag,
      attributes: itemAttributes,
      options: itemOptions,
    };

    const children = buildItems(itemArgs, listDefinition);
    listElement.append(...children);
    handleOnListChanged({ el: listElement, definition: args }, "created");
    return listElement;
  };

  const buildItem = (
    valueStore: ValueStoreType<T>,
    index: number,
    itemArgs: BuilderArgs<T>,
    listDefinition?: ListDefinition<T>,
  ) => {
    const {
      tag: itemTag,
      attributes: itemAttributes,
      options: itemOptions,
    } = itemArgs || {};

    const { definition } = listDefinition || {};
    const { itemsDefinition } = definition || {};

    const {
      afterItemCreated,
      attributes: listItemDefinitionAttributes,
      options: listItemDefinitionOptions,
    } = itemsDefinition || {};

    const { useValue, id, value } = valueStore;
    const [factory] = useValue;

    let item = factory({
      tag: itemTag,
      options: {
        ...listItemDefinitionOptions,
        ...itemOptions,
      },
      attributes: {
        ...listItemDefinitionAttributes,
        ...listItemDefinitionAttributes,
      },
    } as BuilderArgs<T>);
    handleOnItemChanged(valueStore, "created", listDefinition);

    if (afterItemCreated) {
      item = afterItemCreated({
        element: item,
        value,
        useValue,
        args: itemArgs,
        index,
        parentId: id,
      });
      handleOnItemChanged(valueStore, "hookItemCreated", listDefinition);
    }
    buildAttributes(
      {
        attributes: {
          ...listItemDefinitionAttributes,
          ...itemAttributes,
          [DATA_TAGR_ID]: id,
        },
        el: itemTag,
      },
      item,
    );
    handleOnItemChanged(valueStore, "attribute-assigned", listDefinition);
    return item;
  };

  const buildItems = (
    itemArgs: BuilderArgs<T>,
    listDefinition?: ListDefinition<T>,
  ) => {
    const items = valueStoreSignal.getValue().map((valueHandler, index) => {
      return buildItem(valueHandler, index, itemArgs, listDefinition);
    });
    return items;
  };

  const getValues: ListHandlers<T>["getValues"] = () => {
    if (effectCallback) {
      valueStoreSignal.subscribe(effectCallback);
    }
    return valueStoreSignal.getValue().map((v) => v.value);
  };

  /*
   * currently replace the whole list content.
   * TODO: Find a way to reutilize existing items if any ??
   */
  const setValues: ListHandlers<T>["setValues"] = (values) => {
    if (typeof values === "function") {
      const newValues = values(valueStoreSignal.getValue().map((v) => v.value));
      const nextValues = newValues.map((v) => ({
        id: generateUUID(),
        value: v,
        useValue: createValue(v),
      }));
      valueStoreSignal.setValue(nextValues);
    } else {
      valueStoreSignal.setValue(
        values.map((v) => ({
          id: generateUUID(),
          value: v,
          useValue: createValue(v),
        })),
      );
    }
    valueStore = valueStoreSignal.getValue();
    rebuild();
  };

  const handlers: ListHandlers<T> = {
    getValues,
    setValues,
    append,
    prepend,
    insertAt,
    removeNode,
    removeAt,
    clear,
    rebuild,
  };
  return [listFactory, handlers];
};

