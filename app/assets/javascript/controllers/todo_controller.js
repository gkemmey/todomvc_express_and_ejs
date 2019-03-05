import { Controller } from "stimulus"

export default class extends Controller {
  static targets = ["input", "editForm"]

  startEditing() {
    this.element.classList.add("editing");

    this.inputTarget.focus();
    this.inputTarget.select();
  }

  submitEdit(event) {
    if (this.element.classList.contains("editing")) {
      this.editFormTarget.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  }

  cancelEditOnEscape(event) {
    if (event.keyCode != 27) { return; } // only the escape button
    this.element.classList.remove("editing");
  }
}
