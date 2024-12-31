import { RenderData, TagType } from "./types";

export const isPrimitiveValue = (data: any) =>
  typeof data === "bigint" ||
  typeof data === "boolean" ||
  typeof data === "number" ||
  typeof data === "string";

export function isElement(obj: TagType): obj is HTMLElement {
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

export const buildAttributes = (data: RenderData, el: TagType) => {
  const { attributes } = data;
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "styles") {
        Object.entries(value as any).forEach(([propName, propValue]) => {
          if (isElement(el) && typeof propValue === "string") {
            el.style[propName as any] = propValue;
            // el.style.setProperty(propName, propValue);
          }
        });
      }
      // this is an event
      if (key.toLowerCase().startsWith("on") && typeof el !== "string") {
        el.addEventListener(key.slice(2).toLowerCase(), (e) => {
          (value as Function)(e, el);
        });
      } else {
        if (el instanceof Element && typeof value === "string") {
          let attrKey = key;
          if (key.toLowerCase() === "classname") {
            attrKey = "class";
          }
          el.setAttribute(attrKey, value);
        }
      }
    });
  }
};

// TODO: To be replaced with library.
export function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
