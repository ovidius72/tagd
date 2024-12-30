import { buildTag, createTagElement } from "./lib/createTag.ts";
import { createRoot } from "./lib/dom.ts";
import "./style.css";

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

const [builder, _getter, setter] = buildTag("Initial value new");

const Input = builder({
  tag: "input",
  options: { model: "value" },
  attributes: {
    onInput(e) {
      const { value } = e.target as any;
      setter(value);
    },
  },
});

// createEffect(() => {
//   const newVal = getter();
//   console.log("****:newVal", newVal);
//   (Input as any).value = newVal;
// });

const html = createTagElement(
  "ul",
  { a: 2 },
  createTagElement("li", { class: "aclass" }, "uno"),
  createTagElement("li", null, "due"),
  createTagElement(
    "ul",
    null,
    createTagElement(
      "li",
      { id: "11", styles: { backgroundColor: "red" }, className: "className" },
      "due-uno",
    ),
    createTagElement(
      "li",
      {
        ariaLabel: "test",
        className: "inner",
      },
      // createTagElement("input", {
      //   value: "init",
      //   onInput(e: any, el) {
      //     console.log("****:e", e);
      //     if (e && e.target) {
      //       const { value } = e.target;
      //       console.log("****:value", value);
      //       setter(value);
      //     }
      //   },
      // }),
      Input,
      builder("span"),
      builder({
        tag: "p",
        attributes: {
          styles: {
            backgroundColor: "peachpuff",
            padding: "18px",
            borderRadius: "6px",
          },
        },
      }),
    ),
  ),
);

createRoot("#app", html);
