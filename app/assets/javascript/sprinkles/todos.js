on(document, "click", "[data-behavior~=submit_form_when_clicked]", function(event) {
  this.closest("form").submit();
});

on(document, "focusout", "[data-behavior~=submit_form_when_blurred]", function(event) {
  if (this.closest(".editing[data-behavior~=double_click_to_edit]")) {
    this.closest("form").submit();
  }
});

on(document, "dblclick", "[data-behavior~=double_click_to_edit]", function(event) {
  this.classList.add("editing");

  this.querySelector("input.edit").focus();
  this.querySelector("input.edit").select();
});

on(document, "keydown", "[data-behavior~=cancel_edit_on_escape]", function(event) {
  if (event.keyCode != 27) { return; } // only the escape button

  var li = this.closest("[data-behavior~=double_click_to_edit]");
  li.classList.remove("editing");
});
