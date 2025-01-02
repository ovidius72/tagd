export type RenderProps = HTMLElement;

export type TagType = string | Node | HTMLElement;
// export type TagValues =
//   | Record<string, unknown>
//   | string
//   | number
//   | boolean
//   | undefined
//   | null;

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

export type TagBuilderOptions<T> = {
  model?: string;
  keyMap?: (data: T) => string;
};
export type ListDefinition<T> = {
  el: HTMLElement;
  definition: ListBuilderArgs<T> & {
    attributes?: RenderAttributes;
    tag?: string;
    itemsDefinition?: BuilderArgs<T>;
  };
};

export type ItemHookParams<T> = {
  element: HTMLElement | Text;
  value: T;
  useValue: CreateValueResult<T>;
  args: BuilderArgs<T>;
  index: number;
  parentId: string;
};

export type AfterItemCreatedHook<T> = (
  params: ItemHookParams<T>,
) => HTMLElement;

export type ValueStoreType<T> = {
  useValue: CreateValueResult<T>;
  value: T;
  id: string;
};
export type ListItemsDefinition<T> = BuilderArgs<T> & {
  afterItemCreated?: AfterItemCreatedHook<T>;
};
export type ListBuilderArgs<T> = {
  itemsDefinition?: ListItemsDefinition<T>;
  /** - Cause the list to be re-rendered on change */
  dynamic?: boolean;
} & Omit<BuilderArgs<T>, "options">;

export type BuilderArgs<T> = {
  tag?: string;
  options?: TagBuilderOptions<T>;
  attributes?: RenderAttributes;
};

export type TagStoreType<T> = {
  el: HTMLElement | Text;
  keyMap?: (data: T) => string;
  model?: string;
};

export type UpdatedFn<T> = (previousValue: T) => T;
export type Getter<T> = () => T;
export type Setter<T> = (value: T | UpdatedFn<T>) => void;

export type CreateValueResult<T> = [
  (data: BuilderArgs<T> | string) => HTMLElement | Text,
  handlers: { get: Getter<T>; set: Setter<T> },
];

export type ListHandlers<T> = {
  getValues: Getter<T[]>;
  setValues: Setter<T[]>;
  append: (item: T) => void;
  prepend: (item: T) => void;
  insertAt: (index: number, item: T) => void;
  removeAt: (index: number) => void;
  removeNode: (node: HTMLElement) => void;
  clear: () => void;
  rebuild: () => void;
};

export type CreateListValueResult<T> = [
  (data: ListBuilderArgs<T> | string) => HTMLElement,
  handlers: ListHandlers<T>,
];

export type ArrayElement<ArrayType extends readonly never[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

