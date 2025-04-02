const containerRegister = document.getElementById("container-register");
const inputRegister = document.querySelectorAll(".register-input");

containerRegister.addEventListener("submit", e =>{
  e.preventDefault();

  if(inputRegister[0].value.length > 8) return;

  fetch("/roomCreate", {
    method: "POST",
    headers: {
      "Content-type": "text/plain"
    },
    body: inputRegister[0].value
  })
  .then((res) => location = res.url)
  .catch((error) => {
    console.error("Error:", error);
  });
})