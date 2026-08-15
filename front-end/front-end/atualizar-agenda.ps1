$agendaPath = ".\pages\agenda\agenda.js"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - ATUALIZAR AGENDA"
Write-Host "============================================"
Write-Host ""

if (!(Test-Path $agendaPath)) {
    Write-Host "[ERRO] agenda.js não encontrado." -ForegroundColor Red
    exit
}

# ============================================
# BACKUP
# ============================================

$backup = ".\pages\agenda\agenda.pre-api.js"

Copy-Item $agendaPath $backup -Force

Write-Host "[OK] Backup criado:"
Write-Host $backup -ForegroundColor DarkGray

# ============================================
# NOVO AGENDA.JS
# ============================================

$codigo = @'
document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       ELEMENTOS
    ======================================== */

    const calendarGrid =
        document.getElementById("calendarGrid");

    const monthYear =
        document.getElementById("monthYear");

    const prevMonth =
        document.getElementById("prevMonth");

    const nextMonth =
        document.getElementById("nextMonth");

    const selectedDateElement =
        document.getElementById("selectedDate");

    const weekSelector =
        document.getElementById("weekSelector");

    const activityModal =
        document.getElementById("activityModal");

    const closeModal =
        document.getElementById("closeModal");

    const cancelModal =
        document.getElementById("cancelModal");

    const activityForm =
        document.getElementById("activityForm");

    const addActivity =
        document.getElementById("addActivity");

    const emptyAddActivity =
        document.getElementById("emptyAddActivity");

    const activityDate =
        document.getElementById("activityDate");

    const activityTime =
        document.getElementById("activityTime");

    const activityName =
        document.getElementById("activityName");

    const activitySubject =
        document.getElementById("activitySubject");

    const activityDescription =
        document.getElementById("activityDescription");


    /* ========================================
       DATA
    ======================================== */

    let currentDate = new Date();

    let selectedDate = new Date();

    let agendaEvents = [];


    /* ========================================
       MESES
    ======================================== */

    const months = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];


    /* ========================================
       DIAS
    ======================================== */

    const weekdays = [
        "DOM",
        "SEG",
        "TER",
        "QUA",
        "QUI",
        "SEX",
        "SÁB"
    ];


    /* ========================================
       FORMATAR DATA
    ======================================== */

    function formatDateForInput(date) {

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function sameDay(date1, date2) {

        return (
            date1.getFullYear() ===
                date2.getFullYear() &&

            date1.getMonth() ===
                date2.getMonth() &&

            date1.getDate() ===
                date2.getDate()
        );
    }


    /* ========================================
       CARREGAR AGENDA
    ======================================== */

    async function carregarAgenda() {

        try {

            const events =
                await apiRequest("/agenda");

            agendaEvents =
                Array.isArray(events)
                    ? events
                    : [];

            console.log(
                "Agenda carregada:",
                agendaEvents
            );

            renderCalendar();

            renderWeek();

            renderEvents();

        } catch (error) {

            console.error(
                "Erro ao carregar agenda:",
                error
            );

            agendaEvents = [];

            renderEvents();

        }
    }


    /* ========================================
       ABRIR MODAL
    ======================================== */

    function openModal() {

        if (!activityModal) {
            return;
        }

        activityModal.classList.add("active");

        if (activityDate) {

            activityDate.value =
                formatDateForInput(selectedDate);

        }

        setTimeout(() => {

            if (activityName) {
                activityName.focus();
            }

        }, 100);
    }


    /* ========================================
       FECHAR MODAL
    ======================================== */

    function closeActivityModal() {

        if (!activityModal) {
            return;
        }

        activityModal.classList.remove("active");
    }


    /* ========================================
       CALENDÁRIO
    ======================================== */

    function renderCalendar() {

        if (!calendarGrid) {
            return;
        }

        calendarGrid.innerHTML = "";

        const year =
            currentDate.getFullYear();

        const month =
            currentDate.getMonth();

        monthYear.textContent =
            `${months[month]} de ${year}`;

        const firstDay =
            new Date(year, month, 1).getDay();

        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        for (
            let i = 0;
            i < firstDay;
            i++
        ) {

            const empty =
                document.createElement("div");

            empty.className =
                "calendar-day empty";

            calendarGrid.appendChild(empty);
        }


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "calendar-day";

            button.textContent =
                day;


            const date =
                new Date(
                    year,
                    month,
                    day
                );


            if (
                sameDay(
                    date,
                    selectedDate
                )
            ) {

                button.classList.add(
                    "selected"
                );

            }


            /* EVENTOS NO DIA */

            const hasEvent =
                agendaEvents.some(
                    event =>
                        event.date &&
                        sameDay(
                            new Date(event.date),
                            date
                        )
                );


            if (hasEvent) {

                button.classList.add(
                    "has-event"
                );

                const indicator =
                    document.createElement("span");

                indicator.className =
                    "calendar-event-dot";

                button.appendChild(
                    indicator
                );
            }


            button.addEventListener(
                "click",
                () => {

                    selectedDate =
                        new Date(
                            year,
                            month,
                            day
                        );

                    updateSelectedDate();

                    renderCalendar();

                    renderWeek();

                    renderEvents();
                }
            );


            calendarGrid.appendChild(
                button
            );
        }
    }


    /* ========================================
       DATA SELECIONADA
    ======================================== */

    function updateSelectedDate() {

        if (!selectedDateElement) {
            return;
        }

        const day =
            selectedDate.getDate();

        const month =
            months[
                selectedDate.getMonth()
            ];

        selectedDateElement.textContent =
            `${day} de ${month}`;
    }


    /* ========================================
       SEMANA
    ======================================== */

    function renderWeek() {

        if (!weekSelector) {
            return;
        }

        weekSelector.innerHTML = "";

        const dayOfWeek =
            selectedDate.getDay();

        const startOfWeek =
            new Date(selectedDate);

        startOfWeek.setDate(
            selectedDate.getDate() -
            dayOfWeek
        );


        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const date =
                new Date(startOfWeek);

            date.setDate(
                startOfWeek.getDate() + i
            );


            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "week-day";


            if (
                sameDay(
                    date,
                    selectedDate
                )
            ) {

                button.classList.add(
                    "selected"
                );
            }


            button.innerHTML = `
                <span class="week-day-name">
                    ${weekdays[date.getDay()]}
                </span>

                <span class="week-day-number">
                    ${date.getDate()}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectedDate =
                        new Date(date);

                    currentDate =
                        new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            1
                        );

                    updateSelectedDate();

                    renderCalendar();

                    renderWeek();

                    renderEvents();
                }
            );


            weekSelector.appendChild(
                button
            );
        }
    }


    /* ========================================
       MOSTRAR EVENTOS
    ======================================== */

    function renderEvents() {

        const agendaCard =
            document.querySelector(
                ".agenda-empty"
            );

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

            const newButton =
                document.getElementById(
                    "emptyAddActivity"
                );

            if (newButton) {

                newButton.addEventListener(
                    "click",
                    openModal
                );
            }

            if (
                typeof lucide !==
                "undefined"
            ) {

                lucide.createIcons();
            }

            return;
        }


        agendaCard.innerHTML = "";


        eventsOfDay.forEach(
            event => {

                const eventElement =
                    document.createElement(
                        "article"
                    );

                eventElement.className =
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


                eventElement.innerHTML = `
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
                `;


                agendaCard.appendChild(
                    eventElement
                );
            }
        );


        if (
            typeof lucide !==
            "undefined"
        ) {

            lucide.createIcons();
        }
    }


    /* ========================================
       MÊS ANTERIOR
    ======================================== */

    if (prevMonth) {

        prevMonth.addEventListener(
            "click",
            () => {

                currentDate.setMonth(
                    currentDate.getMonth() - 1
                );

                renderCalendar();
            }
        );
    }


    /* ========================================
       PRÓXIMO MÊS
    ======================================== */

    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            () => {

                currentDate.setMonth(
                    currentDate.getMonth() + 1
                );

                renderCalendar();
            }
        );
    }


    /* ========================================
       BOTÕES DE ADICIONAR
    ======================================== */

    if (addActivity) {

        addActivity.addEventListener(
            "click",
            openModal
        );
    }

    if (emptyAddActivity) {

        emptyAddActivity.addEventListener(
            "click",
            openModal
        );
    }


    /* ========================================
       FECHAR MODAL
    ======================================== */

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeActivityModal
        );
    }

    if (cancelModal) {

        cancelModal.addEventListener(
            "click",
            closeActivityModal
        );
    }


    if (activityModal) {

        activityModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    activityModal
                ) {

                    closeActivityModal();
                }
            }
        );
    }


    /* ========================================
       ESC
    ======================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                activityModal &&
                activityModal.classList.contains(
                    "active"
                )
            ) {

                closeActivityModal();
            }
        }
    );


    /* ========================================
       SALVAR EVENTO
    ======================================== */

    if (activityForm) {

        activityForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const name =
                    activityName.value.trim();

                const date =
                    activityDate.value;

                const time =
                    activityTime
                        ? activityTime.value
                        : "";

                const subject =
                    activitySubject
                        ? activitySubject.value
                        : "";

                const description =
                    activityDescription
                        ? activityDescription.value.trim()
                        : "";


                if (!name || !date) {

                    return;
                }


                const saveButton =
                    activityForm.querySelector(
                        ".save-button"
                    );


                const originalContent =
                    saveButton
                        ? saveButton.innerHTML
                        : "";


                if (saveButton) {

                    saveButton.disabled = true;

                    saveButton.innerHTML =
                        "Salvando...";
                }


                try {

                    /*
                     * Montar data + horário
                     */

                    const dateTime =
                        time
                            ? `${date}T${time}:00`
                            : `${date}T00:00:00`;


                    const newEvent =
                        await apiRequest(
                            "/agenda",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({
                                        title: name,

                                        description:
                                            description ||
                                            null,

                                        date:
                                            new Date(
                                                dateTime
                                            ).toISOString(),

                                        type:
                                            subject ||
                                            "ESTUDO"
                                    })
                            }
                        );


                    /*
                     * Adicionar na memória
                     */

                    agendaEvents.push(
                        newEvent
                    );


                    closeActivityModal();

                    activityForm.reset();

                    updateSelectedDate();

                    renderCalendar();

                    renderWeek();

                    renderEvents();


                    console.log(
                        "Evento salvo com sucesso:",
                        newEvent
                    );


                } catch (error) {

                    console.error(
                        "Erro ao salvar evento:",
                        error
                    );

                    alert(
                        error.message ||
                        "Não foi possível salvar o evento."
                    );


                } finally {

                    if (saveButton) {

                        saveButton.disabled =
                            false;

                        saveButton.innerHTML =
                            originalContent;
                    }


                    if (
                        typeof lucide !==
                        "undefined"
                    ) {

                        lucide.createIcons();
                    }
                }
            }
        );
    }


    /* ========================================
       INICIALIZAÇÃO
    ======================================== */

    updateSelectedDate();

    renderCalendar();

    renderWeek();

    carregarAgenda();


    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();
    }

});
'@

Set-Content `
    -Path $agendaPath `
    -Value $codigo `
    -Encoding UTF8

Write-Host ""
Write-Host "[OK] agenda.js atualizado." -ForegroundColor Green

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUÍDO"
Write-Host "============================================"
Write-Host ""

Write-Host "Backup:"
Write-Host "agenda.pre-api.js"

Write-Host ""
Write-Host "Agora abra a Agenda no navegador e teste:"
Write-Host "1. Eventos existentes"
Write-Host "2. Clique em um dia"
Write-Host "3. Adicionar atividade"
Write-Host "4. Verifique o evento no dia"
Write-Host "5. Recarregue a página"
Write-Host ""