import { createValue } from "./createValue";
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

  let valueStore = (initialValue || []).map((val) => ({
    id: generateUUID(),
    valueHandler: createValue(val),
    rawValue: val,
  }));

  const append: ListHandlers<T>["append"] = (item) => {
    const valueHandler = createValue(item);
    const id = generateUUID();
    const newValueStore: ValueStoreType<T> = {
      valueHandler,
      rawValue: item,
      id,
    };
    valueStore.push(newValueStore);

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
        definition.itemsDefinition,
      );
      list.el.append(item);
    });
  };

  const prepend: ListHandlers<T>["prepend"] = (item) => {
    const valueHandler = createValue(item);
    const id = generateUUID();
    const newValueStore: ValueStoreType<T> = {
      id,
      rawValue: item,
      valueHandler,
    };
    valueStore = [{ id, valueHandler, rawValue: item }, ...valueStore];
    mainTags.forEach((list) => {
      const { definition } = list;
      const itemArgs = {
        tag: list.definition.itemsDefinition?.tag || DEFAULT_LIST_ITEM_TAG,
        attributes: { ...definition.attributes, [DATA_TAGR_ID]: id },
      };
      const item = buildItem(
        newValueStore,
        0,
        itemArgs,
        definition.itemsDefinition,
      );
      list.el.prepend(item);
    });
  };

  const insertAt: ListHandlers<T>["insertAt"] = (index, item) => {
    const valueHandler = createValue(item);
    const id = generateUUID();
    const newValueStore: ValueStoreType<T> = {
      valueHandler,
      rawValue: item,
      id,
    };
    valueStore = [
      ...valueStore.slice(0, index),
      newValueStore,
      ...valueStore.slice(index + 1),
    ];

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
        itemsDefinition,
      );
      if (list.el.children.length > 0) {
        const existingEl = list.el.children[index];
        list.el.insertBefore(item, existingEl);
      } else {
        list.el.append(item);
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
      }
    });
  };

  const clear = () => {
    valueStore = [];
  };
  // TODO: not implemented yet.
  const rebuild = () => {};

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

    mainTags.push({
      el: listElement,
      definition: args,
    });

    if (!itemTag) {
      itemTag = "li";
    }

    const itemArgs: BuilderArgs<T> = {
      tag: itemTag,
      attributes: itemAttributes,
      options: itemOptions,
    };

    const children = buildItems(itemArgs, itemsDefinition);
    listElement.append(...children);
    return listElement;
  };

  const buildItem = (
    valueStore: ValueStoreType<T>,
    index: number,
    itemArgs: BuilderArgs<T>,
    listItemsDefinition?: ListItemsDefinition<T>,
  ) => {
    const {
      tag: itemTag,
      attributes: itemAttributes,
      options: itemOptions,
    } = itemArgs || {};

    const {
      afterItemCreated,
      attributes: listItemDefinitionAttributes,
      options: listItemDefinitionOptions,
    } = listItemsDefinition || {};

    const { valueHandler, id, rawValue } = valueStore;
    const [factory] = valueHandler;

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

    if (afterItemCreated) {
      item = afterItemCreated(
        item,
        rawValue as T,
        valueHandler,
        {
          ...itemArgs,
          attributes: {
            ...listItemDefinitionAttributes,
            ...itemArgs.attributes,
            [DATA_TAGR_ID]: id,
          },
        },
        index,
        id,
      );
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
    return item;
  };

  const buildItems = (
    itemArgs: BuilderArgs<T>,
    listItemsDefinition?: ListItemsDefinition<T>,
  ) => {
    const items = valueStore.map((valueHandler, index) => {
      return buildItem(valueHandler, index, itemArgs, listItemsDefinition);
    });
    return items;
  };

  const handlers: ListHandlers<T> = {
    append,
    prepend,
    insertAt,
    removeNode,
    removeAt,
    // update,
    clear,
    rebuild,
  };
  return [listFactory, handlers];
};

