export type RenderProps = HTMLElement;

export type TagType = string | Node | HTMLElement;
export type TagValues =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | undefined
  | null;

export type RenderNode =
  | Node
  | HTMLElement
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

export type RenderFn = (
  el: string | HTMLElement,
  properties: RenderAttributes,
  ...htmlElement: Array<RenderNode>
) => HTMLElement;

export type RenderData = {
  el?: string;
  attributes: Partial<RenderAttributes>;
};

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

export type TagBuilderOptions<T extends TagValues> = {
  model?: string;
  keyMap?: (data: T) => string;
};
export type ListDefinition<T extends TagValues> = {
  el: HTMLElement;
  definition: ListBuilderArgs<T> & {
    attributes?: RenderAttributes;
    tag?: string;
    itemsDefinition?: BuilderArgs<T>;
  };
};

export type AfterItemCreatedHook<T extends TagValues> = (
  el: HTMLElement,
  value: T,
  args: BuilderArgs<T>,
  index: number,
) => HTMLElement;

export type ListBuilderArgs<T extends TagValues> = {
  itemsDefinition?: BuilderArgs<T> & {
    afterItemCreated?: AfterItemCreatedHook<T>;
  };
} & Omit<BuilderArgs<T>, "options">;

export type BuilderArgs<T extends TagValues> = {
  tag?: string;
  options?: TagBuilderOptions<T>;
  attributes?: RenderAttributes;
};

export type TagStoreType<T extends TagValues> = {
  el: HTMLElement;
  keyMap?: (data: T) => T | string;
  model?: string;
};

export type Getter<T extends TagValues> = () => T;
export type Setter<T extends TagValues> = (value: T) => void;

export type CreateValueResult<T extends TagValues> = [
  (data: BuilderArgs<T> | string) => HTMLElement,
  handlers: { get: Getter<T>; set: Setter<T> },
];

export type ListHandlers = {
  // get: Getter<T>;
  // set: Setter<T>;
  append: (item: TagValues) => void;
  prepend: (item: TagValues) => void;
  // update: (index: number, item: TagValues) => TagValues;
  insertAt: (index: number, item: TagValues) => void;
  removeAt: (index: number) => void;
  removeNode: (node: HTMLElement) => void;
  clear: () => void;
  rebuild: () => void;
};

export type CreateListValueResult<T extends TagValues> = [
  (data: ListBuilderArgs<T> | string) => HTMLElement,
  handlers: ListHandlers,
];

export type ArrayElement<ArrayType extends readonly TagValues[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
