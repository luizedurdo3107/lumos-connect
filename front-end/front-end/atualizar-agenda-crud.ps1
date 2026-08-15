$agendaPath = ".\pages\agenda\agenda.js"

Write-Host ""
Write-Host "============================================"
Write-Host " LUMOS CONNECT - AGENDA CRUD"
Write-Host "============================================"
Write-Host ""

if (!(Test-Path $agendaPath)) {
    Write-Host "[ERRO] agenda.js não encontrado." -ForegroundColor Red
    exit
}

# ============================================
# BACKUP
# ============================================

$backup = ".\pages\agenda\agenda.before-crud.js"

Copy-Item $agendaPath $backup -Force

Write-Host "[OK] Backup criado." -ForegroundColor Green

# ============================================
# LOCALIZAR FUNÇÃO renderEvents
# ============================================

$content = Get-Content $agendaPath -Raw

$start = $content.IndexOf("function renderEvents()")

if ($start -lt 0) {
    Write-Host "[ERRO] Função renderEvents não encontrada." -ForegroundColor Red
    exit
}

$end = $content.IndexOf("/* ========================================", $start + 20)

if ($end -lt 0) {
    Write-Host "[ERRO] Não foi possível localizar o final de renderEvents." -ForegroundColor Red
    exit
}

# ============================================
# NOVA RENDERIZAÇÃO
# ============================================

$newFunction = @'
function renderEvents() {

    const agendaCard =
        document.querySelector(".agenda-empty");

    if (!agendaCard) {
        return;
    }

    const eventsOfDay =
        agendaEvents.filter(
            event =>
                event.date &&
                sameDay(
                    new Date(event.date),
                    selectedDate
                )
        );


    /* ========================================
       NENHUM EVENTO
    ======================================== */

    if (eventsOfDay.length === 0) {

        agendaCard.innerHTML = `
            <div class="empty-calendar-icon">
                <i data-lucide="calendar-days"></i>
            </div>

            <p>
                Nenhuma atividade neste dia.
            </p>

            <button
                type="button"
                class="empty-add-button"
                id="emptyAddActivity"
            >
                Adicionar atividade
            </button>
        `;

        const button =
            document.getElementById(
                "emptyAddActivity"
            );

        if (button) {
            button.addEventListener(
                "click",
                openModal
            );
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        return;
    }


    /* ========================================
       EVENTOS
    ======================================== */

    agendaCard.innerHTML = "";


    eventsOfDay.forEach(event => {

        const element =
            document.createElement("article");

        element.className =
            "agenda-event";


        const eventDate =
            new Date(event.date);


        const time =
            eventDate.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        element.innerHTML = `
            <div class="agenda-event-icon">
                <i data-lucide="calendar-check"></i>
            </div>

            <div class="agenda-event-content">

                <h3>
                    ${event.title}
                </h3>

                ${
                    event.description
                        ? `
                            <p>
                                ${event.description}
                            </p>
                          `
                        : ""
                }

                <span>
                    ${event.type || "Evento"}
                    ${time ? ` • ${time}` : ""}
                </span>

            </div>

            <div class="agenda-event-actions">

                <button
                    type="button"
                    class="agenda-edit-button"
                    data-id="${event.id}"
                    title="Editar evento"
                >
                    <i data-lucide="pencil"></i>
                </button>

                <button
                    type="button"
                    class="agenda-delete-button"
                    data-id="${event.id}"
                    title="Excluir evento"
                >
                    <i data-lucide="trash-2"></i>
                </button>

            </div>
        `;


        agendaCard.appendChild(element);
    });


    /* ========================================
       EDITAR
    ======================================== */

    document
        .querySelectorAll(".agenda-edit-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    const event =
                        agendaEvents.find(
                            item =>
                                item.id === id
                        );

                    if (!event) {
                        return;
                    }

                    editarEvento(event);
                }
            );
        });


    /* ========================================
       EXCLUIR
    ======================================== */

    document
        .querySelectorAll(".agenda-delete-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    excluirEvento(id);
                }
            );
        });


    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}


/* ========================================
   EDITAR EVENTO
======================================== */

function editarEvento(event) {

    const eventDate =
        new Date(event.date);


    const date =
        eventDate
            .toISOString()
            .split("T")[0];


    const time =
        eventDate.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    const newTitle =
        prompt(
            "Nome da atividade:",
            event.title
        );


    if (newTitle === null) {
        return;
    }


    const newDescription =
        prompt(
            "Descrição:",
            event.description || ""
        );


    if (newDescription === null) {
        return;
    }


    const newType =
        prompt(
            "Tipo / matéria:",
            event.type || "ESTUDO"
        );


    if (newType === null) {
        return;
    }


    salvarEdicaoEvento(
        event.id,
        newTitle.trim(),
        newDescription.trim(),
        newType.trim(),
        date,
        time
    );
}


/* ========================================
   SALVAR EDIÇÃO
======================================== */

async function salvarEdicaoEvento(
    id,
    title,
    description,
    type,
    date,
    time
) {

    if (!title) {

        alert(
            "O nome da atividade é obrigatório."
        );

        return;
    }


    try {

        const updated =
            await apiRequest(
                `/agenda/${id}`,
                {
                    method: "PUT",

                    body:
                        JSON.stringify({

                            title,

                            description:
                                description ||
                                null,

                            date:
                                new Date(
                                    `${date}T${time}:00`
                                ).toISOString(),

                            type:
                                type ||
                                "ESTUDO"
                        })
                }
            );


        /* ====================================
           ATUALIZAR MEMÓRIA
        ==================================== */

        const index =
            agendaEvents.findIndex(
                event =>
                    event.id === id
            );


        if (index !== -1) {

            agendaEvents[index] =
                updated;
        }


        renderCalendar();

        renderWeek();

        renderEvents();


        console.log(
            "Evento atualizado:",
            updated
        );


    } catch (error) {

        console.error(
            "Erro ao atualizar evento:",
            error
        );

        alert(
            error.message ||
            "Não foi possível atualizar o evento."
        );
    }
}


/* ========================================
   EXCLUIR EVENTO
======================================== */

async function excluirEvento(id) {

    const event =
        agendaEvents.find(
            item =>
                item.id === id
        );


    if (!event) {
        return;
    }


    const confirmed =
        confirm(
            `Deseja excluir "${event.title}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/agenda/${id}`,
            {
                method: "DELETE"
            }
        );


        agendaEvents =
            agendaEvents.filter(
                item =>
                    item.id !== id
            );


        renderCalendar();

        renderWeek();

        renderEvents();


        console.log(
            "Evento excluído:",
            id
        );


    } catch (error) {

        console.error(
            "Erro ao excluir evento:",
            error
        );

        alert(
            error.message ||
            "Não foi possível excluir o evento."
        );
    }
}

'@

# ============================================
# SUBSTITUIR
# ============================================

$newContent =
    $content.Substring(
        0,
        $start
    ) +
    $newFunction +
    $content.Substring(
        $end
    )

Set-Content `
    -Path $agendaPath `
    -Value $newContent `
    -Encoding UTF8

Write-Host ""
Write-Host "[OK] CRUD da Agenda atualizado." -ForegroundColor Green

Write-Host ""
Write-Host "Funcionalidades:"
Write-Host "  [OK] Listar"
Write-Host "  [OK] Criar"
Write-Host "  [OK] Editar"
Write-Host "  [OK] Excluir"

Write-Host ""
Write-Host "Backup:"
Write-Host $backup

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUÍDO"
Write-Host "============================================"
Write-Host ""