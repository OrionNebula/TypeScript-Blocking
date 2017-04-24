/** Enables a value to be passed by reference. Used mostly to return from blocking methods. */
export default class ByReference<T> {
  value?: T;
  constructor(v?: T) {
    this.value = v;
  }
}
