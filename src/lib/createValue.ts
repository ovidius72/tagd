import { effectCallback } from "./effect";
import { Signal } from "./signal";
import {
  AttributeSetterOptions,
  AttributeType,
  BuilderArgs,
  CreateValueResult,
  NodeTypeMap,
  TagStoreType,
  UpdatedFn,
  // TagValues,
} from "./types";
import { buildAttributes, isElement } from "./utils";

const createTagNodeOrText = <T>(value: T, el?: string) => {
  if (typeof value === "undefined" || value === null) {
    return document.createTextNode("");
  }
  if (el) {
    return document.createElement(el);
  }
  return document.createTextNode(value?.toString());
};

export const createValue = <T>(value: T): CreateValueResult<T> => {
  const tagStore: Array<TagStoreType<T>> = [];
  const signal = new Signal<T>(value);
  let isContainer = false;

  /**
   * Builder function
   */
  const factory = (data?: BuilderArgs<T> | string) => {
    let args: BuilderArgs<T> | undefined = undefined;
    if (typeof data === "string") {
      args = { tag: data, options: {}, attributes: {} };
    } else {
      args = data;
    }
    const { tag, options = {}, attributes } = args || {};
    const { keyMap, model } = options;
    const el = tag && isElement(tag) ? tag : createTagNodeOrText(value, tag);
    buildAttributes({ attributes: attributes as AttributeType<unknown> }, el);
    const elMap: TagStoreType<T> = {
      el,
      keyMap,
      model,
    };
    _setNodeValue(elMap);
    tagStore.push(elMap);
    return el;
  };

  const _setNodeValue = (data: TagStoreType<T>) => {
    const { el, keyMap, model } = data || {};
    let elValue = signal.getValue();
    if (keyMap) {
      if (typeof keyMap === "function") {
        elValue = keyMap(value) as T;
      } else {
        elValue = elValue[keyMap as never];
      }
    }
    if (el.nodeType === NodeTypeMap.Text && elValue) {
      el.textContent = elValue.toString();
    } else if (el instanceof HTMLElement) {
      if (model) {
        if (model === "checked" && elValue === true) {
          el.setAttribute("checked", "checked");
          return;
        }
        if (model === "checked" && elValue === false) {
          el.removeAttribute("checked");
          return;
        }
        el.setAttribute(model, elValue as string);
        return;
      }
      if (!isContainer) {
        el.innerHTML = elValue as string;
      }
    }
  };

  const getter = (): T => {
    if (effectCallback) {
      signal.subscribe(effectCallback);
    }
    return signal.getValue();
  };

  const setter = (value: T | UpdatedFn<T>): void => {
    signal.setValue(value);
    tagStore.forEach((tag) => {
      _setNodeValue(tag);
    });
  };

  const setAttributes = (
    attributes: AttributeType<T>,
    options?: AttributeSetterOptions,
  ) => {
    const { skipAttachEvents = false } = options || {};
    tagStore.forEach(({ el }) => {
      buildAttributes(
        { attributes: attributes as AttributeType<unknown> },
        el,
        skipAttachEvents,
      );
    });
  };

  const setAsContainer = (value: boolean) => {
    isContainer = value;
  };

  const handlers = { get: getter, set: setter, setAttributes, setAsContainer };
  return [factory, handlers];
};

