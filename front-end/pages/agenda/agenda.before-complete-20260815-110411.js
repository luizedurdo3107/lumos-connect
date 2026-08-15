
/* ========================================
   SISTEMA DE TOAST
======================================== */

function mostrarToast(mensagem, tipo = "success") {

    let container =
        document.getElementById("lumosToastContainer");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "lumosToastContainer";

        container.style.position = "fixed";
        container.style.top = "24px";
        container.style.right = "24px";
        container.style.zIndex = "99999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "12px";
        container.style.pointerEvents = "none";

        document.body.appendChild(container);
    }

    const toast =
        document.createElement("div");

    toast.className =
        `lumos-toast ${tipo}`;

    const icon =
        tipo === "error"
            ? "alert-circle"
            : tipo === "warning"
                ? "triangle-alert"
                : "check-circle";

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>

        <span>
            ${mensagem}
        </span>
    `;

    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";
    toast.style.minWidth = "280px";
    toast.style.maxWidth = "380px";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "12px";
    toast.style.background = "#ffffff";
    toast.style.border = "1px solid #D3D9CC";
    toast.style.boxShadow =
        "0 8px 30px rgba(0,0,0,.12)";
    toast.style.color = "#2B3B36";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "500";
    toast.style.pointerEvents = "auto";
    toast.style.animation =
        "lumosToastIn .25s ease";

    if (tipo === "error") {
        toast.style.borderLeft =
            "4px solid #C75C5C";
    }

    if (tipo === "warning") {
        toast.style.borderLeft =
            "4px solid #D6A84F";
    }

    if (tipo === "success") {
        toast.style.borderLeft =
            "4px solid #4E6F5A";
    }

    container.appendChild(toast);

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(20px)";
        toast.style.transition =
            "all .25s ease";

        setTimeout(() => {
            toast.remove();
        }, 250);

    }, 3500);
}


/* ========================================
   ANIMAÃ‡ÃƒO DO TOAST
======================================== */

if (!document.getElementById("lumosToastStyle")) {

    const style =
        document.createElement("style");

    style.id =
        "lumosToastStyle";

    style.textContent = `

        @keyframes lumosToastIn {

            from {
                opacity: 0;
                transform: translateX(20px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }

        }

    `;

    document.head.appendChild(style);
}

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
        "MarÃ§o",
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
        "SÃB"
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
       CALENDÃRIO
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
                    ${time ? ` â€¢ ${time}` : ""}
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
            "DescriÃ§Ã£o:",
            event.description || ""
        );


    if (newDescription === null) {
        return;
    }


    const newType =
        prompt(
            "Tipo / matÃ©ria:",
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
   SALVAR EDIÃ‡ÃƒO
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

        mostrarToast(
            "O nome da atividade Ã© obrigatÃ³rio."
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
           ATUALIZAR MEMÃ“RIA
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

        mostrarToast(
            error.message ||
            "NÃ£o foi possÃ­vel atualizar o evento."
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
            "Evento excluÃ­do:",
            id
        );


    } catch (error) {

        console.error(
            "Erro ao excluir evento:",
            error
        );

        mostrarToast(
            error.message ||
            "NÃ£o foi possÃ­vel excluir o evento."
        );
    }
}
/* ========================================
       MÃŠS ANTERIOR
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
       PRÃ“XIMO MÃŠS
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
       BOTÃ•ES DE ADICIONAR
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
                     * Montar data + horÃ¡rio
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
                     * Adicionar na memÃ³ria
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

                    mostrarToast(
                        error.message ||
                        "NÃ£o foi possÃ­vel salvar o evento."
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
       INICIALIZAÃ‡ÃƒO
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



