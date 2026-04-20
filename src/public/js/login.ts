const form_login = document.getElementById("login_form") as HTMLFormElement;

form_login.addEventListener("submit", async (e) => {
  e.preventDefault();
  let isVal = true;

  const emailPattern: RegExp =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const email: string = (
    document.getElementById("email") as HTMLInputElement
  ).value.trim();
  const password: string = (
    document.getElementById("password") as HTMLInputElement
  ).value.trim();
  const remember_me : boolean = (document.getElementById("remember_me") as HTMLInputElement).checked;

  console.log(remember_me);

  const form_data = { email, password , remember_me };
  if (!emailPattern.test(email) || password.length == 0) {
    isVal = false;
  }

  if (isVal) {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form_data),
    });

    console.log(response.status);
    const res = await response.json();

    if (response.status == 200) {
      window.location.href = `${res.url}`;
    } else if (response.status == 500) {
      alert("Server Side issue please try again latar....");
    } else if (response.status == 401) {
      alert(res.message);
    } else if(response.status == 429) {
      alert(`${res.message} \nTry again after : ${res.retryAfter}`)
    }
  }
  if (!isVal) {
    window.alert("Log info is wrong please fill again");
  }
});


(document.getElementById("forget-password") as HTMLParagraphElement).addEventListener("click" , async()=>{
  const email: string = (
    document.getElementById("email") as HTMLInputElement
  ).value.trim();
  const response = await fetch(`/forget-password?e=${email}`)
})

