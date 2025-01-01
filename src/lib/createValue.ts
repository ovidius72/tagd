import { effectCallback } from "./effect";
import { Signal } from "./signal";
import {
  BuilderArgs,
  CreateValueResult,
  NodeTypeMap,
  TagStoreType,
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

  /*
   *Builder function
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
    buildAttributes({ attributes }, el);
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
      elValue = keyMap(value) as T;
    }
    if (el.nodeType === NodeTypeMap.Text && elValue) {
      el.textContent = elValue.toString();
    } else if (el instanceof HTMLElement) {
      if (model) {
        el.setAttribute(model, elValue as string);
      }
      el.innerHTML = elValue as string;
    }
  };

  const getter = (): T => {
    if (effectCallback) {
      signal.subscribe(effectCallback);
    }
    return signal.getValue();
  };

  const setter = (value: T): void => {
    signal.setValue(value);
    tagStore.forEach((tag) => {
      _setNodeValue(tag);
    });
  };

  const handlers = { get: getter, set: setter };
  return [factory, handlers];
};

