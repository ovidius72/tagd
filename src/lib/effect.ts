import { Signal } from "./signal";

let effectCallback: (() => void) | null = null;

const createEffect = (callback: () => void) => {
  effectCallback = callback;
  callback();
  effectCallback = null;
};

const signalGetter = <T>(signal: Signal<T>) => {
  if (effectCallback) {
    signal.subscribe(effectCallback);
  }
  return signal.getValue();
};

const signalSetter =
  <T>(signal: Signal<T>) =>
  (newVal: T): void => {
    signal.setValue(newVal);
  };

export { createEffect, effectCallback, signalGetter, signalSetter };

