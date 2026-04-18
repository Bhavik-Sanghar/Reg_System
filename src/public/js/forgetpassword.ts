
(
  document.getElementById("resetpassword") as HTMLParagraphElement
).addEventListener("click", async () => {
  const email = (
  document.getElementById("email") as HTMLInputElement
).value.trim();
  const response = await fetch("/getResetLink", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  const res = await response.json();

  if (response.status == 200) {
    (document.getElementById("reset_link") as HTMLDivElement).innerHTML =
      `<p id="reset_page_btn">Go to Reset Password</p>`;

    (
      document.getElementById("reset_page_btn") as HTMLParagraphElement
    ).addEventListener("click", async () => {
      const response = await fetch(`/resetPage?q=${res.token}&e=${email}`);
      const result = await response.json();

      if (response.status == 200) {
        (document.getElementById("reset_link") as HTMLDivElement).innerHTML =
          `Link is Used You cant acess now`;
        window.location.href = `${result.url}`;
      } else {
        (document.getElementById("reset_link") as HTMLDivElement).innerHTML =
          `Something Went wrong... Looks like Link is Expired ...`;
      }
    });
  } else if (response.status == 500) {
    (document.getElementById("reset_link") as HTMLDivElement).innerHTML =
      `Hmmmmmmmmm Looks like email is not valid...`;
  }
});
