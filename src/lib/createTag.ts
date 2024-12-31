import { RenderFn } from "./types";
import { buildAttributes, isElement } from "./utils";

export const createTag: RenderFn = (el, attributes, ...renderers) => {
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
