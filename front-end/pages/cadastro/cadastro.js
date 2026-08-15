lucide.createIcons();
 
const registerForm =
    document.getElementById("registerForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const schoolCodeInput =
    document.getElementById("schoolCode");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const termsInput =
    document.getElementById("terms");

function togglePassword(
    input,
    button
) {
    const isPassword =
        input.type === "password";

    input.type =
        isPassword
            ? "text"
            : "password";

    button.innerHTML =
        isPassword
            ? '<i data-lucide="eye-off"></i>'
            : '<i data-lucide="eye"></i>';

    lucide.createIcons();
    button.setAttribute(
        "aria-label",
        isPassword
            ? "Ocultar senha"
            : "Mostrar senha"
    );
}
document
    .getElementById("togglePassword")
    .addEventListener(
        "click",
        function () {

            togglePassword(
                passwordInput,
                this
            );

        }
    );

document
    .getElementById("toggleConfirmPassword")
    .addEventListener(
        "click",
        function () {

            togglePassword(
                confirmPasswordInput,
                this
            );

        }
    );

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}
registerForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        let valid = true;
        document
            .querySelectorAll(".error-message")
            .forEach(error => {

                error.textContent = "";

            });
        if (
            nameInput.value.trim() === ""
        ) {

            document
                .getElementById("nameError")
                .textContent =
                "Digite seu nome completo.";

            valid = false;

        }
        if (
            emailInput.value.trim() === ""
        ) {

            document
                .getElementById("emailError")
                .textContent =
                "Digite seu e-mail.";

            valid = false;

        } else if (
            !validateEmail(
                emailInput.value.trim()
            )
        ) {

            document
                .getElementById("emailError")
                .textContent =
                "Digite um e-mail válido.";

            valid = false;

        }
        if (
            schoolCodeInput.value.trim() === ""
        ) {

            document
                .getElementById(
                    "schoolCodeError"
                )
                .textContent =
                "Digite o código fornecido pela escola.";

            valid = false;

        }
        if (
            passwordInput.value === ""
        ) {

            document
                .getElementById(
                    "passwordError"
                )
                .textContent =
                "Digite uma senha.";

            valid = false;

        } else if (
            passwordInput.value.length < 8
        ) {

            document
                .getElementById(
                    "passwordError"
                )
                .textContent =
                "A senha deve ter pelo menos 8 caracteres.";

            valid = false;

        }

        if (
            confirmPasswordInput.value === ""
        ) {

            document
                .getElementById(
                    "confirmPasswordError"
                )
                .textContent =
                "Confirme sua senha.";

            valid = false;

        } else if (
            confirmPasswordInput.value !==
            passwordInput.value
        ) {

            document
                .getElementById(
                    "confirmPasswordError"
                )
                .textContent =
                "As senhas não coincidem.";

            valid = false;

        }

        if (!termsInput.checked) {

            document
                .getElementById(
                    "termsError"
                )
                .textContent =
                "Aceite os termos para continuar.";

            valid = false;

        }
if (!valid) {
    return;
}

console.log("Cadastro enviado");

console.log({
    nome: nameInput.value,
    email: emailInput.value,
    codigoEscola: schoolCodeInput.value,
    senha: passwordInput.value
});

window.location.href = "../forms/forms1/forms1.html";
    }
);