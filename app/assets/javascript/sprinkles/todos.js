on(document, "click", "[data-behavior~=submit_form_when_clicked]", function(event) {
  let form = this.closest("form")

  if (form.dataset.remote === "true") {
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  }
  else {
    form.submit()
  }
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

on(document, "submit", "form[data-remote~=true]", function(event) {
  event.preventDefault();
  const { target } = event;

  fetch(target.action, { method: (target.method || "GET").toUpperCase(),
                         credentials: "include",
                         headers: { "Content-Type": "application/x-www-form-urlencoded",
                                    "Accept": "text/javascript",
                                    "X-Requested-With": "XMLHttpRequest" },
                         body: new URLSearchParams(new FormData(target)) }).
    then((res) => {
      if (res.ok) {
        return res.text()
      }

      throw res
    }).
    then((javascript) => {
      script = document.createElement('script')
      script.text = javascript
      document.head.appendChild(script).parentNode.removeChild(script)
    })
})
