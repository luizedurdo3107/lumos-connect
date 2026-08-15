document.addEventListener("DOMContentLoaded", () => {
    iniciarLucide();
    iniciarAbas();
    iniciarMaterias();
    carregarAtividades();
});

/* ========================================
   LUCIDE
======================================== */

function iniciarLucide() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

/* ========================================
   ABAS
======================================== */

function iniciarAbas() {
    const tabs = document.querySelectorAll(".activity-tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {

            const target = tab.dataset.tab;

            tabs.forEach((item) => {
                item.classList.remove("active");
            });

            contents.forEach((content) => {
                content.classList.remove("active");
            });

            tab.classList.add("active");

            const selectedContent =
                document.getElementById(target);

            if (selectedContent) {
                selectedContent.classList.add("active");
            }

            iniciarLucide();
        });
    });
}

/* ========================================
   MATÉRIAS
======================================== */

function iniciarMaterias() {
    const subjects =
        document.querySelectorAll(".subject-option");

    subjects.forEach((subject) => {

        subject.addEventListener("click", () => {

            const materia =
                subject.dataset.subject;

            console.log(
                "Matéria selecionada:",
                materia
            );

            carregarAtividades(materia);
        });

    });
}

/* ========================================
   BUSCAR ATIVIDADES DA API
======================================== */

async function carregarAtividades(materia = null) {

    try {

        const activities = await apiRequest("/activities");

        console.log("Atividades recebidas:", activities);

        let filtradas = activities;

        if (materia) {
            filtradas = activities.filter(
                (atividade) =>
                    atividade.subject === materia
            );
        }

        renderizarAtividades(filtradas);

    } catch (error) {

        console.error(
            "Erro ao carregar atividades:",
            error
        );

    }
}

/* ========================================
   MOSTRAR ATIVIDADES
======================================== */

function renderizarAtividades(activities) {

    const activityList =
    document.getElementById("activityList");

    if (!activityList) {
        return;
    }

    activityList.innerHTML = "";

    if (activities.length === 0) {

        activityList.innerHTML = `
            <div class="empty-card">
                <div class="empty-icon">
                    <i data-lucide="inbox"></i>
                </div>

                <h2>Nenhuma atividade</h2>

                <p>
                    Não existem atividades cadastradas.
                </p>
            </div>
        `;

        iniciarLucide();

        return;
    }

    activities.forEach((activity, index) => {

        const item =
            document.createElement("article");

        item.className = "activity-item";

        if (activity.completed) {
            item.classList.add("completed");
        } else {
            item.classList.add("current");
        }

        const dataEntrega =
            activity.dueDate
                ? new Date(activity.dueDate)
                    .toLocaleDateString("pt-BR")
                : "Sem data";

        item.innerHTML = `
            <div class="activity-number">
                ${
                    activity.completed
                        ? '<i data-lucide="check"></i>'
                        : index + 1
                }
            </div>

            <div class="activity-info">

                <h3>
                    ${activity.title}
                </h3>

                <p>
                    ${activity.description || "Sem descrição"}
                </p>

                <small>
                    ${activity.subject || "Sem matéria"}
                    • Entrega: ${dataEntrega}
                </small>

            </div>

            <span class="activity-status">
                ${
                    activity.completed
                        ? "Concluído"
                        : "Em andamento"
                }
            </span>
        `;

        activityList.appendChild(item);
    });

    iniciarLucide();
}

/* ========================================
   PERMISSÃO PARA ADICIONAR ATIVIDADES
======================================== */

function iniciarPermissaoAdmin() {

    const addActivityButton =
        document.getElementById("addActivityButton");

    const user = getUser();

    if (!addActivityButton || !user) {
        return;
    }

    if (user.email === "luiz@lumos.com") {

        addActivityButton.hidden = false;

        addActivityButton.addEventListener(
            "click",
            () => {

                console.log(
                    "Administrador: adicionar atividade"
                );

                // Próximo passo:
                // abrir modal de criação
            }
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarPermissaoAdmin
);

/* ========================================
   MODAL DE ADICIONAR ATIVIDADE
======================================== */

function iniciarModalAtividade() {

    const addButton =
        document.getElementById("addActivityButton");

    const modal =
        document.getElementById("activityModal");

    const closeButton =
        document.getElementById("closeActivityModal");

    const cancelButton =
        document.getElementById("cancelActivity");

    const form =
        document.getElementById("activityForm");

    const errorMessage =
        document.getElementById("activityFormError");

    const user = getUser();

    if (!addButton || !modal || !form) {
        return;
    }

    /*
     * Apenas Luiz pode abrir
     * o formulário de criação.
     */

    if (!user || user.email !== "luiz@lumos.com") {
        return;
    }

    addButton.hidden = false;

    /*
     * Abrir modal
     */

    addButton.addEventListener("click", () => {

        modal.hidden = false;

        errorMessage.textContent = "";

        iniciarLucide();

    });

    /*
     * Fechar modal
     */

    function fecharModal() {
        modal.hidden = true;
        form.reset();
        errorMessage.textContent = "";
    }

    closeButton.addEventListener(
        "click",
        fecharModal
    );

    cancelButton.addEventListener(
        "click",
        fecharModal
    );

    /*
     * Criar atividade
     */

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        errorMessage.textContent = "";

        const title =
            document.getElementById("activityTitle")
                .value.trim();

        const description =
            document.getElementById("activityDescription")
                .value.trim();

        const subject =
            document.getElementById("activitySubject")
                .value;

        const dueDate =
            document.getElementById("activityDueDate")
                .value;

        if (!title) {

            errorMessage.textContent =
                "Digite o título da atividade.";

            return;
        }

        if (!subject) {

            errorMessage.textContent =
                "Selecione uma matéria.";

            return;
        }

        const submitButton =
            form.querySelector(".modal-submit");

        submitButton.disabled = true;

        submitButton.innerHTML =
            "Criando...";

        try {

            await apiRequest("/activities", {

                method: "POST",

                body: JSON.stringify({

                    title,
                    description,
                    subject,

                    dueDate:
                        dueDate
                            ? new Date(dueDate).toISOString()
                            : null

                })

            });

            console.log(
                "Atividade criada com sucesso!"
            );

            fecharModal();

            /*
             * Atualiza a lista imediatamente
             */

            await carregarAtividades();

        } catch (error) {

            console.error(
                "Erro ao criar atividade:",
                error
            );

            errorMessage.textContent =
                error.message ||
                "Não foi possível criar a atividade.";

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i data-lucide="plus"></i>
                Criar atividade
            `;

            iniciarLucide();
        }

    });
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarModalAtividade
);

