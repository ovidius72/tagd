export type RenderProps = HTMLElement;
export type PrimitiveValues = string | number | boolean | undefined | null;

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

export type RenderData<T> = {
  el?: string;
  attributes: AttributeType<T>;
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
  keyMap?: PrimitiveValues | ((data: T) => PrimitiveValues);
};
export type ListDefinition<T> = {
  el: HTMLElement;
  definition: ListBuilderArgs<T> & {
    attributes?: AttributeType<T>;
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
) => HTMLElement | Text;

export type ValueStoreType<T> = {
  useValue: CreateValueResult<T>;
  value: T;
  id: string;
};

export type SlotsStoreType<T> = {
  useValue: CreateValueResult<T>;
  value: T;
  id: string;
  parentId: string;
  definition: SlotDefinition<T | PrimitiveValues>;
};
export type SlotDefinition<T> = {
  name: string;
  model?: string;
  fieldMap?: PrimitiveValues | ((data: T, index: number) => PrimitiveValues);
  attributes?: ItemAttributeType<T>;
  tag: string;
  // value: PrimitiveValues;
};

export type ListItemsDefinition<T> = BuilderArgs<T> & {
  afterItemCreated?: AfterItemCreatedHook<T>;
  slots?: (params: ItemHookParams<T>) => Array<SlotDefinition<T>>;
};

export type ListBuilderArgs<T> = {
  tag?: string;
  itemsDefinition?: ListItemsDefinition<T>;
  /** - Cause the list to be re-rendered on change */
  dynamic?: boolean;
  /** Print additional information to the console */
  debug?: boolean;
  attributes?: ListAttributeType<T>;
};

export type ListAttributeType<T> =
  | Partial<RenderAttributes>
  | ((data: T[]) => RenderAttributes);

export type AttributeType<T> =
  | Partial<RenderAttributes>
  | ((data: T) => RenderAttributes);

export type ItemAttributeType<T> =
  | Partial<RenderAttributes>
  | ((data: T, index: number) => RenderAttributes);

export type BuilderArgs<T> = {
  tag?: string;
  options?: TagBuilderOptions<T>;
  attributes?: AttributeType<T>;
};

export type TagStoreType<T> = {
  el: HTMLElement | Text;
  keyMap?: PrimitiveValues | ((data: T) => PrimitiveValues);
  model?: string;
};

export type UpdatedFn<T> = (previousValue: T) => T;
export type Getter<T> = () => T;
export type ListItemGetter<T> = (index: number) => T;
export type Setter<T> = (value: T | UpdatedFn<T>) => void;
export type ListItemSetter<T> = (
  index: number,
  value: T | UpdatedFn<T>,
) => void;

export type AttributeSetterOptions = {
  skipAttachEvents?: boolean;
};

export type CreateValueResult<T> = [
  (data: BuilderArgs<T> | string) => HTMLElement | Text,
  handlers: {
    get: Getter<T>;
    set: Setter<T>;
    /** cause the HTMLElement content not to be added/updated.
     * This is used when the elements holds slots and we onlyu want to use the
     * element as a container avoiding to have a contenet that cause to replace the slots
     */
    setAsContainer: (value: boolean) => void;
    setAttributes: (
      attributes: AttributeType<T>,
      options?: AttributeSetterOptions,
    ) => void;
  },
];

export type ListHandlers<T> = {
  getValues: Getter<T[]>;
  setValues: Setter<T[]>;
  setItemValue: ListItemSetter<T>;
  getItemValue: ListItemGetter<T>;
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

