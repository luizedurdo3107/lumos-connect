const usuario = {
    nome: "Luiz",
    nivel: 1,
    xp: 20,
    xpProximoNivel: 60
};

const welcomeTitle =
    document.querySelector(".welcome-header h1");

const progressFill =
    document.getElementById("progressFill");

const activityTitle =
    document.getElementById("activityTitle");

const activityDescription =
    document.getElementById("activityDescription");

const subjectTag =
    document.getElementById("subjectTag");


function atualizarSaudacao() {

    const hora = new Date().getHours();

    let saudacao;

    if (hora < 12) {

        saudacao = "Bom dia";

    } else if (hora < 18) {

        saudacao = "Boa tarde";

    } else {

        saudacao = "Boa noite";

    }

    welcomeTitle.textContent =
        `${saudacao}, ${usuario.nome}`;
}


function atualizarProgresso() {

    const porcentagem =
        (usuario.xp / usuario.xpProximoNivel) * 100;

    progressFill.style.width =
        `${Math.min(porcentagem, 100)}%`;
}

const atividades = [

    {
        materia: "Matemática",
        titulo: "Conjuntos Numéricos",
        descricao:
            "Atividade de revisão sobre conjuntos numéricos e classificação dos números."
    },

    {
        materia: "Português",
        titulo: "Interpretação de Texto",
        descricao:
            "Leia o texto e responda às questões de interpretação."
    },

    {
        materia: "História",
        titulo: "Brasil República",
        descricao:
            "Revise os principais acontecimentos do período da República brasileira."
    },

    {
        materia: "Biologia",
        titulo: "Células",
        descricao:
            "Identifique as principais estruturas e funções das células."
    }

];

function selecionarAtividade() {

    /*
        Por enquanto estamos selecionando
        uma atividade de exemplo.

        Depois podemos fazer o Back-end
        escolher a atividade com base no:

        - desempenho
        - dificuldade
        - matérias
        - atividades concluídas
        - tempo de estudo
    */

    const atividade =
        atividades[0];

    subjectTag.textContent =
        atividade.materia;

    activityTitle.textContent =
        atividade.titulo;

    activityDescription.textContent =
        atividade.descricao;
}

document
    .getElementById("agendaButton")
    .addEventListener("click", () => {

        window.location.href =
            "/front-end/pages/agenda/agenda.html";

    });


document
    .getElementById("activityButton")
    .addEventListener("click", () => {

        window.location.href =
            "/front-end/pages/atividades/atividades.html";

    });


atualizarSaudacao();

atualizarProgresso();

selecionarAtividade();

lucide.createIcons();