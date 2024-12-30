import { effectCallback } from "./effect";
import { Signal } from "./signal";
import {
  BuilderArgs,
  BuildTagResult,
  NodeTypeMap,
  RenderFn,
  TagStoreType,
  TagValues,
} from "./types";
import { buildAttributes, isElement } from "./utils";

const createTagNodeOrText = (value: TagValues, el?: string) => {
  if (el) {
    return document.createElement(el);
  }
  return document.createTextNode(value);
};

const buildTag = <T extends Record<string, unknown> | string>(
  value: T,
): BuildTagResult<T> => {
  const tagStore: Array<TagStoreType<T>> = [];
  const signal = new Signal<T>(value);

  /*
   *Builder function
   */
  const builder = (data?: BuilderArgs<T> | string) => {
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
    let elValue: any = signal.getValue();
    if (keyMap) {
      elValue = keyMap(value);
    }
    if (el.nodeType === NodeTypeMap.Text && elValue) {
      el.textContent = elValue.toString();
    } else if (el instanceof HTMLElement) {
      if (model) {
        (el as any)[model] = elValue.toString();
      }
      el.innerHTML = elValue.toString();
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

  return [builder, getter, setter];
};

const createTagElement: RenderFn = (el, attributes, ...renderers) => {
  if (isElement(el)) {
    return el;
  }
  const tag = document.createElement(el);
  buildAttributes({ attributes }, tag);
  if (!Array.isArray(renderers) && typeof renderers === "string") {
    tag.innerHTML = renderers;
  }
  if (Array.isArray(renderers)) {
    const values = renderers.map((r) => {
      return r;
    });
    tag.append(...(values as string[]));
  }
  return tag;
};
export { buildTag, createTagElement };
