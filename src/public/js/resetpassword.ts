(document.getElementById("reset_btn") as HTMLParagraphElement).addEventListener(
  "click",
  async () => {
    let isVal = true;
    const password = (
      document.getElementById("password") as HTMLInputElement
    ).value.trim();
    const cpassword = (
      document.getElementById("cpassword") as HTMLInputElement
    ).value.trim();
    const email = (document.getElementById("email") as HTMLParagraphElement)
      .innerText;
    if (password !== cpassword) {
      isVal = false;
    }

    const checkLastPassword = await fetch(
      `/lastPassword?p=${password}&e=${email}`,
    );

    if (checkLastPassword.status == 400) {
      isVal = false;
      window.alert("New password cannot same as last password...");
    } else if (checkLastPassword.status == 500) {
      isVal = false;
      window.alert("Server side error while checking for password");
    }

    const formData = {
      password: password,
      email: email,
    };
    if (isVal) {
      const response = await fetch("/resetPassword", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const res = await response.json();

      if (response.status == 200) {
        window.location.href = `${res.url}`;
      } else if (response.status == 500) {
        (document.getElementById("message") as HTMLParagraphElement).innerHTML =
          res.message;
      } else {
        (document.getElementById("message") as HTMLParagraphElement).innerHTML =
          "Something went wrong try again latar";
      }
    }
  },
);
