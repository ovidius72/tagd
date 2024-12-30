const createRoot = (selector: string, node: Node | Element) => {
  const root = document.querySelector(selector);
  if (root) {
    if (Array.isArray(node)) {
      root.replaceChildren(...node);
    } else {
      root.replaceChildren(node);
    }
  } else {
    throw Error("Cannot find the root element");
  }
};

export { createRoot };
