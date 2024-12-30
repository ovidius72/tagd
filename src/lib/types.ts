export type RenderProps = HTMLElement;

export type TagType = string | Node | HTMLElement;

export type RenderNode =
  | Node
  | HTMLElement
  | Text
  | string
  | number
  | undefined
  | null;

type MyEvent = {
  [Event in keyof HTMLElementEventMap as `on${Capitalize<string & Event>}`]: (
    e: HTMLElementEventMap[Event],
    el: HTMLElement,
  ) => void;
};
export type RenderAttributes =
  | null
  | undefined
  | MyEvent
  | HTMLElement
  | (Record<string, unknown> & { styles?: Partial<CSSStyleDeclaration> });
// | Record<string, string | ((event: Event, el: HTMLElement) => void)>;

export type RenderFn = (
  el: string | HTMLElement,
  properties: RenderAttributes, // Record<string, unknown> | undefined | null,
  ...htmlElement: Array<RenderNode>
) => HTMLElement;

export type RenderData = {
  el?: string;
  attributes: Partial<RenderAttributes>;
};

export type TagValues = any;

export enum NodeTypeMap {
  "Element" = 1,
  "Attribute" = 2,
  "Text" = 3,
  "CData" = 4,
  "Comment" = 8,
  "Document" = 9,
  "DocumentType" = 10,
  "DocumentFragment" = 11,
  "Notation" = 12,
}

export type TagBuilderOptions<T> = {
  model?: string;
  keyMap?: (data: T) => string;
};
export type BuilderArgs<T> = {
  tag: string;
  options?: TagBuilderOptions<T>;
  attributes?: RenderAttributes;
};

export type TagStoreType<T> = {
  el: HTMLElement | Text;
  keyMap?: (data: T) => T;
  model?: string;
};

export type BuildTagResult<T> = [
  (data: BuilderArgs<T> | string) => HTMLElement | Text,
  () => T,
  (value: T) => void,
];
