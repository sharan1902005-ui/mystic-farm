export class Menu {
  constructor(element) {
    this.element = element;
  }

  open() {
    this.element?.classList.add("visible");
  }

  close() {
    this.element?.classList.remove("visible");
  }
}
