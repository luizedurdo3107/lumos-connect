// ================================
// LUCIDE
// ================================

lucide.createIcons();


// ================================
// PERSONALIZAÇÃO DA LEITURA
// ================================

const fontSize = document.getElementById("fontSize");
const lineSpacing = document.getElementById("lineSpacing");
const letterSpacing = document.getElementById("letterSpacing");

const fontValue = document.getElementById("fontValue");
const lineValue = document.getElementById("lineValue");
const letterValue = document.getElementById("letterValue");


// Tamanho da fonte
fontSize.addEventListener("input", () => {

    const value = Number(fontSize.value);

    fontValue.textContent = `${value}px`;

    document.documentElement.style.setProperty(
        "--user-font-size",
        `${value}px`
    );

});


// Espaçamento entre linhas
lineSpacing.addEventListener("input", () => {

    const value = Number(lineSpacing.value);

    lineValue.textContent = value.toFixed(1);

    document.body.style.lineHeight = value;

});


// Espaçamento entre letras
letterSpacing.addEventListener("input", () => {

    const value = Number(letterSpacing.value);

    letterValue.textContent = `${value}px`;

    document.body.style.letterSpacing = `${value}px`;

});


// ================================
// TEMA
// ================================

const themeButtons = document.querySelectorAll(".theme-btn");


themeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const theme = button.dataset.theme;

        themeButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");


        if (theme === "dark") {

            document.body.classList.add("dark");

            localStorage.setItem(
                "lumos-theme",
                "dark"
            );

        } else {

            document.body.classList.remove("dark");

            localStorage.setItem(
                "lumos-theme",
                theme
            );
        }

    });

});


// Recuperar tema
const savedTheme =
    localStorage.getItem("lumos-theme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeButtons.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.theme === "dark"
        );

    });

}


// ================================
// MODO FOCO
// ================================

const focusMode =
    document.getElementById("focusMode");


focusMode.addEventListener("change", () => {

    document.body.classList.toggle(
        "focus-mode",
        focusMode.checked
    );

    localStorage.setItem(
        "lumos-focus-mode",
        focusMode.checked
    );

});


const savedFocus =
    localStorage.getItem(
        "lumos-focus-mode"
    );


if (savedFocus === "true") {

    focusMode.checked = true;

    document.body.classList.add(
        "focus-mode"
    );

}


// ================================
// FORMATOS DE CONTEÚDO
// ================================

const formatButtons =
    document.querySelectorAll(".format-btn");


formatButtons.forEach((button) => {

    button.addEventListener("click", () => {

        formatButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        localStorage.setItem(
            "lumos-content-format",
            button.textContent.trim()
        );

    });

});


// ================================
// PERFIL
// ================================

const saveProfile =
    document.getElementById("saveProfile");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");


saveProfile.addEventListener("click", () => {

    const name =
        profileName.value.trim();

    const email =
        profileEmail.value.trim();


    if (!name || !email) {

        alert(
            "Preencha seu nome e e-mail."
        );

        return;
    }


    localStorage.setItem(
        "lumos-profile-name",
        name
    );

    localStorage.setItem(
        "lumos-profile-email",
        email
    );


    const originalText =
        saveProfile.innerHTML;


    saveProfile.innerHTML = `
        <i data-lucide="check"></i>
        Salvo com sucesso
    `;

    lucide.createIcons();


    setTimeout(() => {

        saveProfile.innerHTML =
            originalText;

        lucide.createIcons();

    }, 2000);

});


// Carregar perfil salvo

const savedName =
    localStorage.getItem(
        "lumos-profile-name"
    );

const savedEmail =
    localStorage.getItem(
        "lumos-profile-email"
    );


if (savedName) {
    profileName.value = savedName;
}

if (savedEmail) {
    profileEmail.value = savedEmail;
}


// ================================
// ALTERAR SENHA
// ================================

const changePassword =
    document.getElementById(
        "changePassword"
    );


changePassword.addEventListener(
    "click",
    () => {

        alert(
            "A função de alteração de senha será conectada ao backend."
        );

    }
);


// ================================
// LOGOUT
// ================================

const logout =
    document.getElementById("logout");


logout.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Deseja realmente sair da sua conta?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            "lumos-token"
        );

        localStorage.removeItem(
            "lumos-profile-name"
        );

        localStorage.removeItem(
            "lumos-profile-email"
        );


        window.location.href =
            "../login/login.html";

    }
);