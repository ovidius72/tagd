import { RenderAttributes, RenderData, RenderNode, TagType } from "./types";

const isPrimitiveValue = (data: any) =>
  typeof data === "bigint" ||
  typeof data === "boolean" ||
  typeof data === "number" ||
  typeof data === "string";

const buildAttributes = (data: RenderData, el: TagType) => {
  const { attributes } = data;
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      // this is an event
      if (key.toLowerCase().startsWith("on") && typeof el !== "string") {
        // if (key.startsWith("@")) {
        el.addEventListener(key.slice(2).toLowerCase(), (e) => {
          (value as Function)(e, el);
        });
      } else {
        if (el instanceof Element && typeof value === "string") {
          el.setAttribute(key, value);
        }
      }
    });
  }
};

function isElement(obj: TagType): obj is HTMLElement {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return obj instanceof HTMLElement;
  } catch (e) {
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (
      typeof obj === "object" &&
      obj.nodeType === 1 &&
      typeof (obj as any).style === "object" &&
      typeof obj.ownerDocument === "object"
    );
  }
}

const assignAttributes = (el: RenderNode, attributes: RenderAttributes) => {
  if (!attributes || typeof el != "object" || !el) {
    return;
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith("on")) {
      el.addEventListener(key.slice(2).toLowerCase(), (e) => {
        if (typeof value === "function") {
          value(e, el);
        }
      });
    } else {
      if (isElement(el)) {
        el.setAttribute(key, value as string);
      }
    }
  });
};
export { assignAttributes, buildAttributes, isElement, isPrimitiveValue };
