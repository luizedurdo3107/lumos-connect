lucide.createIcons();

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const togglePassword = document.getElementById("togglePassword");


// Mostrar / ocultar senha
togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.innerHTML = isPassword
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';

    lucide.createIcons();

    togglePassword.setAttribute(
        "aria-label",
        isPassword
            ? "Ocultar senha"
            : "Mostrar senha"
    );
});


// Limpar erros enquanto o usuário digita
emailInput.addEventListener("input", () => {
    emailError.textContent = "";
});

passwordInput.addEventListener("input", () => {
    passwordError.textContent = "";
});


// Login
loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    emailError.textContent = "";
    passwordError.textContent = "";

    let valid = true;


    // Validação do e-mail
    if (email === "") {

        emailError.textContent =
            "Digite seu e-mail.";

        valid = false;
    }


    // Validação da senha
    if (password === "") {

        passwordError.textContent =
            "Digite sua senha.";

        valid = false;
    }


    if (!valid) {
        return;
    }


    // Desabilitar botão durante o login
    const loginButton =
        loginForm.querySelector(".login-button");

    const originalButtonContent =
        loginButton.innerHTML;

    loginButton.disabled = true;

    loginButton.innerHTML =
        "Entrando...";


    try {

        // Enviar login para a API
        await login(email, password);

        console.log("Login realizado com sucesso!");

        // Redirecionar após autenticação
        window.location.href =
            "../forms/forms1/forms1.html";

    } catch (error) {

        console.error(
            "Erro no login:",
            error
        );


        // Mostrar erro para o usuário
        passwordError.textContent =
            error.message ||
            "E-mail ou senha incorretos.";

    } finally {

        loginButton.disabled = false;

        loginButton.innerHTML =
            originalButtonContent;

        lucide.createIcons();
    }

});