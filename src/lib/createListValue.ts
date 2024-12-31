import { createValue } from "./createValue";
import {
  ArrayElement,
  BuilderArgs,
  CreateListValueResult,
  CreateValueResult,
  ListBuilderArgs,
  ListDefinition,
  ListHandlers,
  TagValues,
} from "./types";
import { buildAttributes, generateUUID, isElement } from "./utils";
const DEFAULT_LIST_ITEM_TAG = "li";
const DATA_TAGR_ID = "data-tagr-id";

export const createListValues = <T extends TagValues[]>(
  initialValue?: T,
): CreateListValueResult<ArrayElement<T>> => {
  let mainTags: ListDefinition<ArrayElement<T>>[] = [];

  let valueStore: Array<{
    createdValue: CreateValueResult<TagValues>;
    rawValue: TagValues;
    id: string;
  }> = (initialValue || []).map((val) => ({
    id: generateUUID(),
    createdValue: createValue(val),
    rawValue: val,
  }));

  const append: ListHandlers["append"] = (item) => {
    const newValue = createValue(item);
    const [newItemFactory] = newValue;
    const id = generateUUID();
    valueStore.push({
      createdValue: newValue,
      rawValue: item,
      id,
    });
    mainTags.forEach((list) => {
      const { definition } = list;
      const { itemsDefinition } = definition || {};

      const {
        tag: itemTag = DEFAULT_LIST_ITEM_TAG,
        afterItemCreated,
        attributes: itemAttributes,
        options: itemOptions,
      } = itemsDefinition || {};

      let itemEl = newItemFactory(itemTag);
      if (afterItemCreated) {
        itemEl = afterItemCreated(
          itemEl,
          item as ArrayElement<T>,
          {
            tag: itemTag,
            attributes: { ...itemAttributes, [DATA_TAGR_ID]: id },
            options: itemOptions,
          },
          valueStore.length - 1,
        );
      }
      buildAttributes(
        { attributes: { ...itemAttributes, [DATA_TAGR_ID]: id } },
        itemEl,
      );
      list.el.append(itemEl);
    });
  };

  const prepend: ListHandlers["prepend"] = (item) => {
    const newValue = createValue(item);
    const [newItemFactory] = newValue;
    const id = generateUUID();
    valueStore = [
      { id, createdValue: newValue, rawValue: item },
      ...valueStore,
    ];
    mainTags.forEach((list) => {
      let itemEl = newItemFactory({
        tag: list.definition.itemsDefinition?.tag || DEFAULT_LIST_ITEM_TAG,
        attributes: { [DATA_TAGR_ID]: id },
      });
      const { definition } = list;
      const { itemsDefinition } = definition || {};
      const { attributes, afterItemCreated } = itemsDefinition || {};
      if (afterItemCreated) {
        itemEl = afterItemCreated(
          itemEl,
          item as ArrayElement<T>,
          {
            attributes: { ...attributes, [DATA_TAGR_ID]: id },
          },
          0,
        );
      }
      buildAttributes(
        { attributes: { ...attributes, [DATA_TAGR_ID]: id } },
        itemEl,
      );
      list.el.prepend(itemEl);
    });
  };

  const insertAt: ListHandlers["insertAt"] = (index, item) => {
    const newValue = createValue(item);
    const [newItemFactory] = newValue;
    const id = generateUUID();
    valueStore = [
      ...valueStore.slice(0, index),
      { createdValue: newValue, rawValue: item, id },
      ...valueStore.slice(index + 1),
    ];

    mainTags.forEach((list) => {
      const {
        definition: {
          tag: listTag = DEFAULT_LIST_ITEM_TAG,
          attributes: listAttributes = { [DATA_TAGR_ID]: id },
          itemsDefinition,
        },
      } = list || {};
      const { afterItemCreated, attributes: itemAttributes } =
        itemsDefinition || {};

      let itemEl = newItemFactory({
        tag: listTag,
        attributes: listAttributes,
      });
      if (afterItemCreated) {
        itemEl = afterItemCreated(
          itemEl,
          item as ArrayElement<T>,
          {
            attributes: { ...itemAttributes, [DATA_TAGR_ID]: id },
          },
          index,
        );
      }
      buildAttributes(
        {
          attributes: {
            ...itemAttributes,
            [DATA_TAGR_ID]: id,
          },
          el: list.definition.itemsDefinition?.tag,
        },
        itemEl,
      );
      if (list.el.children.length > 0) {
        const existingEl = list.el.children[index];
        list.el.insertBefore(itemEl, existingEl);
      } else {
        list.el.append(itemEl);
      }
    });
  };
  // const update: ListHandlers["update"] = (index, item) => {
  //   items = items.with(index, item) as T;
  //   return items[index] as ArrayElement<T>;
  // };
  const removeAt: ListHandlers["removeAt"] = (index) => {
    mainTags.forEach((list) => {
      const node = list.el.childNodes[index];
      if (node) {
        list.el.removeChild(node);
        valueStore.splice(index, 1);
      }
    });
  };
  const removeNode: ListHandlers["removeNode"] = (node) => {
    const idAttribute = node.getAttribute(DATA_TAGR_ID);
    if (idAttribute) {
      mainTags.forEach((list) => {
        const node = list.el.querySelector(
          `[${DEFAULT_LIST_ITEM_TAG}]=${idAttribute}`,
        );
        if (node) {
          list.el.removeChild(node);
        }
      });
    }
  };

  const clear = () => {
    valueStore = [];
  };
  // TODO: not implemented yet.
  const rebuild = () => {};

  const listFactory = (
    data: ListBuilderArgs<ArrayElement<T>> | string,
  ): HTMLElement => {
    let args: ListBuilderArgs<ArrayElement<T>> | undefined = undefined;
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

    let {
      tag: itemTag = DEFAULT_LIST_ITEM_TAG,
      attributes: itemAttributes,
      options: itemOptions,
      afterItemCreated,
    } = itemsDefinition || {};

    // mainTags
    const listElement =
      listTag && isElement(listTag) ? listTag : document.createElement(listTag);

    buildAttributes({ attributes: listAttributes }, listElement);

    mainTags.push({
      el: listElement,
      definition: args,
    });
    // itemTag
    if (!itemTag) {
      itemTag = "li";
    }

    const itemArgs: BuilderArgs<ArrayElement<T>> = {
      tag: itemTag,
      attributes: itemAttributes,
      options: itemOptions,
    };
    const children = valueStore.map(({ createdValue, id, rawValue }, index) => {
      const [itemBuilder] = createdValue;
      let el = itemBuilder(itemArgs as BuilderArgs<TagValues>);
      buildAttributes(
        { attributes: { ...itemAttributes, [DATA_TAGR_ID]: id }, el: itemTag },
        el,
      );
      if (afterItemCreated) {
        el = afterItemCreated(
          el,
          rawValue as ArrayElement<T>,
          {
            ...itemArgs,
            attributes: { ...itemArgs.attributes, [DATA_TAGR_ID]: id },
          },
          index,
        );
      }
      return el;
    });
    listElement.append(...children);
    return listElement;
  };

  const handlers: ListHandlers = {
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
