const captcha_image = document.getElementById(
  "captcha_image",
) as HTMLImageElement;
const reload = document.getElementById("reload");

reload?.addEventListener("click", () => {
  reload_captcha();
});

const register_form = document.getElementById(
  "register-form",
) as HTMLFormElement;

register_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let isVal = true;

  const firstName: string = (
    document.getElementById("firstName") as HTMLInputElement
  ).value.trim();

  const lastName: string = (
    document.getElementById("lastName") as HTMLInputElement
  ).value.trim();

  const email: string = (
    document.getElementById("email") as HTMLInputElement
  ).value.trim();

  const password: string = (
    document.getElementById("password") as HTMLInputElement
  ).value.trim();

  const cpassword: string = (
    document.getElementById("cpassword") as HTMLInputElement
  ).value.trim();

  const captcha_inp = (
    document.getElementById("captcha_inp") as HTMLInputElement
  ).value.trim();

  const form_data = {
    firstName,
    lastName,
    email,
    password,
    cpassword,
    captcha_inp,
  };

  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form_data),
  });

  if (response.status == 400) {
    const res = await response.json();
    (
      document.getElementById("captcha_error") as HTMLParagraphElement
    ).innerHTML = `${res.message}`;
    reload_captcha();
  }

  if(response.status == 200){
    const res = await response.json();
    console.log(res);
    window.location.href = `${res.url}`
  }
});

function reload_captcha() {
  (document.getElementById("captcha_inp") as HTMLInputElement).value = "";
  captcha_image.src = `/getcaptcha?t=${Date.now()}`;
}
