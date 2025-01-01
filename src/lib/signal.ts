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

  setValue(newValue: T) {
    this.value = newValue;
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

