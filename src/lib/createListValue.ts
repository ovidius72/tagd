import { createTag } from "./createTag";
import { createValue } from "./createValue";
import { effectCallback } from "./effect";
import { Signal } from "./signal";
import {
  AttributeType,
  BuilderArgs,
  CreateListValueResult,
  ItemAttributeType,
  ListAttributeType,
  ListBuilderArgs,
  ListDefinition,
  ListHandlers,
  PrimitiveValues,
  SlotDefinition,
  SlotsStoreType,
  ValueStoreType,
} from "./types";

import { buildAttributes, generateUUID, isElement } from "./utils";

const DEFAULT_LIST_ITEM_TAG = "li";
const DATA_TAGR_ID = "data-tagr-id";

export const createListValues = <T>(
  initialValue?: Array<T>,
): CreateListValueResult<T> => {
  const mainTags: ListDefinition<T>[] = [];
  const itemsArgs: BuilderArgs<T>[] = [];
  const slotArgs: Array<BuilderArgs<T>[]> = [[]];

  let valueStore: ValueStoreType<T>[] = (initialValue || []).map((val) => ({
    id: generateUUID(),
    useValue: createValue(val),
    value: val,
  }));

  const valueStoreSignal = new Signal(valueStore);
  const slotStoreSignal = new Signal<SlotsStoreType<PrimitiveValues | T>[]>(
    [] as SlotsStoreType<PrimitiveValues | T>[],
  );

  const getListComputedAttributes = <T>(
    attributes: ListAttributeType<T>,
    values: T[],
  ) => {
    const computedAttributes =
      typeof attributes === "function" ? attributes(values) : attributes;
    return computedAttributes;
  };

  const getComputedAttributes = (
    attributes: AttributeType<T> | ItemAttributeType<T>,
    values: T,
    index?: number,
  ) => {
    const computedAttributes =
      typeof attributes === "function"
        ? attributes(values, index ?? -1)
        : attributes;
    return computedAttributes;
  };

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
      const computedAttributes = getComputedAttributes(itemAttributes, value);

      const item = buildItem(
        newValueStore,
        valueStore.length - 1,
        {
          tag: itemTag,
          attributes: { ...computedAttributes, [DATA_TAGR_ID]: id },
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
      const computedAttributes = getComputedAttributes(
        definition.attributes,
        value,
        0,
      );
      const itemArgs = {
        tag: list.definition.itemsDefinition?.tag || DEFAULT_LIST_ITEM_TAG,
        attributes: { ...computedAttributes, [DATA_TAGR_ID]: id },
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

      const computedAttributes = getComputedAttributes(
        itemAttributes,
        value,
        index,
      );
      const item = buildItem(
        newValueStore,
        index,
        { attributes: computedAttributes, tag: tag || listTag, options },
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

  const rebuild = (onlyDynamics = false) => {
    mainTags.forEach((list) => {
      const { definition } = list;
      const { dynamic } = definition || {};
      if (onlyDynamics && !dynamic) {
        return;
      }
      const itemArgs = {
        tag: definition.itemsDefinition?.tag || DEFAULT_LIST_ITEM_TAG,
        attributes: { ...definition?.itemsDefinition?.attributes },
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
        attributes: data.attributes,
        itemsDefinition: { tag: "li", ...data.itemsDefinition },
      };
    }

    const {
      tag: listTag = DEFAULT_LIST_ITEM_TAG,
      itemsDefinition,
      attributes: listAttributes = {},
    } = args || {};

    let { tag: listItemTag = DEFAULT_LIST_ITEM_TAG } = itemsDefinition || {};
    const { attributes: listItemAttributes, options: itemOptions } =
      itemsDefinition || {};

    // mainTags
    const listElement =
      listTag && isElement(listTag) ? listTag : document.createElement(listTag);

    // Items Container Attributes (generally UL/OL)
    const computedListAttributes = getListComputedAttributes(
      listAttributes as ListAttributeType<T>,
      valueStore.map((v) => v.value),
    );
    buildAttributes({ attributes: computedListAttributes }, listElement);

    const listDefinition: ListDefinition<T> = {
      el: listElement,
      definition: args,
    };
    mainTags.push(listDefinition);

    if (!listItemTag) {
      listItemTag = "li";
    }

    // List Item arguments
    const listItemArgs: BuilderArgs<T> = {
      tag: listItemTag,
      attributes: listItemAttributes,
      options: itemOptions,
    };

    const children = buildItems(listItemArgs, listDefinition);
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
      slots,
    } = itemsDefinition || {};

    const { useValue, id, value } = valueStore;
    const [factory, handler] = useValue;
    handler.setAsContainer(true);
    const listComputedAttributes = getComputedAttributes(
      listItemDefinitionAttributes,
      value,
      index,
    );
    const itemComputedAttributes = getComputedAttributes(
      itemAttributes,
      value,
      index,
    );

    itemsArgs.push(itemsDefinition as BuilderArgs<T>);

    let item = factory({
      tag: itemTag,
      options: {
        ...listItemDefinitionOptions,
        ...itemOptions,
      },
      attributes: {
        ...listComputedAttributes,
        ...itemComputedAttributes,
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
    let innerElements: Array<HTMLElement | Text> = [];
    if (slots) {
      const slotsDefinitions = slots({
        value,
        index,
        element: item,
        useValue,
        parentId: id,
        args: itemArgs,
      });

      const slotId = generateUUID();

      innerElements = slotsDefinitions.map((slot) => {
        const { model, fieldMap, attributes, name, tag } = slot;

        let keyMap: T | PrimitiveValues = value;
        if (typeof fieldMap === "function") {
          keyMap = fieldMap(value as T, index);
        } else if (fieldMap) {
          keyMap = value[fieldMap as never];
        }

        const slotUseValue = createValue(keyMap);
        slotStoreSignal.setValue((values) => [
          ...values,
          {
            useValue: slotUseValue,
            definition: slot as SlotDefinition<T | PrimitiveValues>,
            value: keyMap,
            id: slotId,
            parentId: id,
          },
        ]);

        const [slotFactory] = slotUseValue;

        if (!slotArgs[index]) {
          slotArgs[index] = [];
        }
        slotArgs[index].push({ attributes: attributes as AttributeType<T> });
        const slotComputedAttributes = getComputedAttributes(
          attributes,
          value,
          index,
        );
        const slotTag = slotFactory({
          tag,
          options: { model },
          attributes: { ...slotComputedAttributes, "data-slot-name": name },
        });

        return slotTag;
      });
    }
    const computedAttributes = getComputedAttributes(
      itemAttributes,
      value,
      index,
    );

    buildAttributes(
      {
        attributes: {
          ...computedAttributes,
          [DATA_TAGR_ID]: id,
        },
        el: itemTag,
      },
      item,
    );
    if (innerElements.length > 0 && isElement(item)) {
      item = factory({
        tag: itemTag,
        options: {
          ...listItemDefinitionOptions,
          ...itemOptions,
        },
        attributes: {
          ...listComputedAttributes,
          ...itemComputedAttributes,
          [DATA_TAGR_ID]: id,
        },
      } as BuilderArgs<T>);
      if (isElement(item)) {
        item.append(...innerElements);
      }
    }
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
      const nextValues = values.map((v) => ({
        id: generateUUID(),
        value: v,
        useValue: createValue(v),
      }));
      valueStoreSignal.setValue(nextValues);
    }
    valueStore = valueStoreSignal.getValue();
    rebuild(true);
  };

  const getItemValue: ListHandlers<T>["getItemValue"] = (index) => {
    return valueStore[index].value;
  };

  const setItemValue: ListHandlers<T>["setItemValue"] = (index, value) => {
    const [, handler] = valueStore[index].useValue;
    valueStore[index].value = value as T;
    const parentId = valueStore[index].id;

    const slotStore = slotStoreSignal
      ?.getValue()
      .filter((v) => v.parentId === parentId);

    const slotAttributes = slotArgs[index];
    slotStore.forEach((store, slotIndex) => {
      // notify the the slots that have changed inside the current changed item
      const { useValue, definition } = store;
      const { fieldMap } = definition;
      let nextValue =
        typeof fieldMap === "function"
          ? fieldMap(value as never, index)
          : value;
      if (typeof fieldMap === "string") {
        nextValue = value[fieldMap as never];
      }
      const [_, slotHandler] = useValue;
      const prevValue = slotHandler.get();
      if (prevValue !== nextValue) {
        slotHandler.set(nextValue as T);
      }
      // rebuiod slot attributes
      const slotComputedAttributes = getComputedAttributes(
        slotAttributes[slotIndex].attributes,
        value as T,
        index,
      );
      slotHandler.setAttributes(slotComputedAttributes, {
        skipAttachEvents: true,
      });
    });
    // updated with the new value
    valueStoreSignal.setValue(valueStore);

    // notify the main value signal of the current changed item
    handler.set(value);

    // rebuild item attributes
    const itemAttributes = getComputedAttributes(
      itemsArgs[index].attributes,
      value as T,
      index,
    );
    handler.setAttributes(itemAttributes, { skipAttachEvents: true });

    mainTags.forEach((list) => {
      const listAttributes = getListComputedAttributes(
        list.definition.attributes,
        valueStore.map((v) => v.value),
      );
      buildAttributes({ attributes: listAttributes }, list.el, true);
    });
  };

  const handlers: ListHandlers<T> = {
    getValues,
    getItemValue,
    setValues,
    setItemValue,
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

