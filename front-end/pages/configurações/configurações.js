// ================================
// LUCIDE
// ================================

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    carregarConfiguracoes();
});


// ================================
// PERFIL
// ================================

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");
const saveProfile = document.getElementById("saveProfile");


// ================================
// CARREGAR PERFIL
// ================================

async function carregarConfiguracoes() {
    try {
        const user = await api.profile();

        profileName.value = user.name || "";
        profileEmail.value = user.email || "";

        profileRole.textContent =
            user.role === "ADMIN"
                ? "Administrador"
                : "Estudante";

        carregarPreferencias();

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}


// ================================
// SALVAR PERFIL
// ================================

saveProfile.addEventListener("click", async () => {

    const name = profileName.value.trim();
    const email = profileEmail.value.trim();

    if (!name || !email) {
        alert("Preencha nome e e-mail.");
        return;
    }

    try {

        saveProfile.disabled = true;

        const response = await apiRequest("/profile", {
            method: "PUT",
            body: JSON.stringify({
                name,
                email
            })
        });

        profileName.value = response.user.name;
        profileEmail.value = response.user.email;

        saveProfile.innerHTML = `
            <i data-lucide="check"></i>
            Salvo com sucesso
        `;

        lucide.createIcons();

        setTimeout(() => {

            saveProfile.innerHTML = `
                <i data-lucide="save"></i>
                Salvar alterações
            `;

            lucide.createIcons();

        }, 2000);

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Não foi possível atualizar o perfil."
        );

    } finally {

        saveProfile.disabled = false;

    }

});


// ================================
// LEITURA
// ================================

const fontSize = document.getElementById("fontSize");
const lineSpacing = document.getElementById("lineSpacing");
const letterSpacing = document.getElementById("letterSpacing");

const fontValue = document.getElementById("fontValue");
const lineValue = document.getElementById("lineValue");
const letterValue = document.getElementById("letterValue");


fontSize.addEventListener("input", () => {

    const value = Number(fontSize.value);

    fontValue.textContent = `${value}px`;

    document.documentElement.style.setProperty(
        "--user-font-size",
        `${value}px`
    );

    localStorage.setItem(
        "lumos-font-size",
        value
    );
});


lineSpacing.addEventListener("input", () => {

    const value = Number(lineSpacing.value);

    lineValue.textContent = value.toFixed(1);

    document.documentElement.style.setProperty(
        "--user-line-height",
        value
    );

    localStorage.setItem(
        "lumos-line-spacing",
        value
    );
});


letterSpacing.addEventListener("input", () => {

    const value = Number(letterSpacing.value);

    letterValue.textContent = `${value}px`;

    document.documentElement.style.setProperty(
        "--user-letter-spacing",
        `${value}px`
    );

    localStorage.setItem(
        "lumos-letter-spacing",
        value
    );
});


// ================================
// TEMA
// ================================

const themeButtons =
    document.querySelectorAll(".theme-btn");

themeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const theme = button.dataset.theme;

        themeButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        document.body.classList.toggle(
            "dark",
            theme === "dark"
        );

        localStorage.setItem(
            "lumos-theme",
            theme
        );
    });

});


// ================================
// MODO FOCO
// ================================

const focusMode =
    document.getElementById("focusMode");

focusMode.addEventListener("change", () => {

    const enabled = focusMode.checked;

    document.body.classList.toggle(
        "focus-mode",
        enabled
    );

    localStorage.setItem(
        "lumos-focus-mode",
        enabled
    );

});


// ================================
// FORMATOS
// ================================

const formatButtons =
    document.querySelectorAll(".format-btn");

formatButtons.forEach(button => {

    button.addEventListener("click", () => {

        formatButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        localStorage.setItem(
            "lumos-content-format",
            button.textContent.trim()
        );

    });

});


// ================================
// ALTERAR SENHA
// ================================

const changePassword =
    document.getElementById("changePassword");

changePassword.addEventListener("click", async () => {

    const currentPassword =
        prompt("Digite sua senha atual:");

    if (!currentPassword) return;

    const newPassword =
        prompt("Digite sua nova senha:");

    if (!newPassword) return;

    const confirmPassword =
        prompt("Confirme sua nova senha:");

    if (newPassword !== confirmPassword) {

        alert("As senhas não coincidem.");

        return;
    }

    if (newPassword.length < 6) {

        alert(
            "A nova senha deve ter pelo menos 6 caracteres."
        );

        return;
    }

    try {

        await apiRequest("/profile/password", {
            method: "PUT",
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        alert("Senha alterada com sucesso.");

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Erro ao alterar senha."
        );

    }

});


// ================================
// LOGOUT
// ================================

const logout =
    document.getElementById("logout");

logout.addEventListener("click", () => {

    const confirmed = confirm(
        "Deseja realmente sair da sua conta?"
    );

    if (!confirmed) return;

    localStorage.removeItem("lumos-token");

    window.location.href =
        "../login/login.html";
});


// ================================
// CARREGAR PREFERÊNCIAS
// ================================

function carregarPreferencias() {

    const savedFont =
        localStorage.getItem("lumos-font-size");

    const savedLine =
        localStorage.getItem("lumos-line-spacing");

    const savedLetter =
        localStorage.getItem("lumos-letter-spacing");

    const savedTheme =
        localStorage.getItem("lumos-theme");

    const savedFocus =
        localStorage.getItem("lumos-focus-mode");


    if (savedFont) {

        fontSize.value = savedFont;

        fontValue.textContent =
            `${savedFont}px`;

        document.documentElement.style.setProperty(
            "--user-font-size",
            `${savedFont}px`
        );
    }


    if (savedLine) {

        lineSpacing.value = savedLine;

        lineValue.textContent =
            Number(savedLine).toFixed(1);

        document.documentElement.style.setProperty(
            "--user-line-height",
            savedLine
        );
    }


    if (savedLetter) {

        letterSpacing.value = savedLetter;

        letterValue.textContent =
            `${savedLetter}px`;

        document.documentElement.style.setProperty(
            "--user-letter-spacing",
            `${savedLetter}px`
        );
    }


    if (savedTheme) {

        document.body.classList.toggle(
            "dark",
            savedTheme === "dark"
        );

        themeButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.theme === savedTheme
            );

        });
    }


    if (savedFocus === "true") {

        focusMode.checked = true;

        document.body.classList.add(
            "focus-mode"
        );
    }
}