import { UpdatedFn } from "./types";

type Subscriber<T> = (value: T) => void;

class Signal<T> {
  value: T;
  subscribers: Subscriber<T>[] = [];
  constructor(value: T) {
    this.value = value;
    this.subscribers = [];
  }

  getValue() {
    return this.value;
  }

  setValue(newValue: T | UpdatedFn<T>) {
    let nextValue: T | undefined;
    if (typeof newValue === "function") {
      nextValue = (newValue as UpdatedFn<T>)(this.value);
    }
    this.value = nextValue as T;
    this.emit();
  }

  emit() {
    this.subscribers.forEach((subscriber) => subscriber(this.value));
  }

  subscribe(callback: Subscriber<T>) {
    this.subscribers.push(callback);
  }
}

export { Signal };

