
document.addEventListener("DOMContentLoaded", () => {

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

});


/* 
   NAVEGAÇÃO
*/

function navigateTo(page) {

    if (!page) {
        return;
    }

    window.location.href = page;
}


/* 
   VOLTAR PARA A PÁGINA ANTERIOR
 */

function goBack() {

    window.history.back();

}


/* 
   SALVAR DADOS DO USUÁRIO
 */

function saveUserData(data) {

    if (!data) {
        return;
    }

    localStorage.setItem(
        "lumosUser",
        JSON.stringify(data)
    );

}


/*
   PEGAR DADOS DO USUÁRIO
 */

function getUserData() {

    const userData =
        localStorage.getItem("lumosUser");

    if (!userData) {
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Erro ao carregar os dados do usuário.",
            error
        );

        return null;
    }

}


/* 
   REMOVER DADOS DO USUÁRIO
 */

function clearUserData() {

    localStorage.removeItem("lumosUser");

}


/* 
   VERIFICAR SE O USUÁRIO ESTÁ LOGADO
 */

function isUserLoggedIn() {

    return localStorage.getItem(
        "lumosUser"
    ) !== null;

}


/* 
   SAIR DA CONTA
 */

function logout() {

    localStorage.removeItem("lumosUser");

    window.location.href =
        "/front-end/pages/login/login.html";

}


/* 
   ATUALIZAR NOME DO USUÁRIO
 */

function updateUserName() {

    const userNameElement =
        document.getElementById("userName");

    if (!userNameElement) {
        return;
    }

    const user =
        getUserData();

    if (!user) {
        return;
    }

    userNameElement.textContent =
        user.nome || "Aluno";

}


/* 
   INICIALIZAÇÃO
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateUserName();

    }
);
