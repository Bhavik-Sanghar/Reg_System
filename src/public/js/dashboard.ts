(document.getElementById("delete_account") as HTMLParagraphElement).addEventListener(
  "click",
  async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (confirmation) {
      const response = await fetch("/deleteAccount", {
        method: "DELETE",
      });

      if (response.status == 200) {
        alert("Your account has been deleted. We're sorry to see you go.");
        window.location.href = "/login";
      } else if (response.status == 500) {
        alert("Server side error while deleting account. Please try again later.");
      } else {
        alert("Something went wrong while deleting your account. Please try again later.");
      }
    }
  },
);

(document.getElementById("logout") as HTMLParagraphElement).addEventListener(
  "click",
  async () => {
    const response = await fetch("/user/logout", {
      method: "POST",
    });

    console.log(response);

    if (response.status == 200) {
      window.location.href = "/login";
    } else if (response.status == 500) {
      alert("Server side error while logging out. Please try again later.");
    } else {
      alert("Something went wrong while logging out. Please try again later.");
    }
  },
);  