/* ========================================
   LUMOS CONNECT - AGENDA
   Integração com API /agenda
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    iniciarAgenda();

});


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
   ESTADO
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
   INICIAR AGENDA
======================================== */

async function iniciarAgenda() {

    renderCalendar();

    updateSelectedDate();

    renderWeek();

    configurarEventos();

    iniciarLucide();

    await carregarAgenda();

}


/* ========================================
   LUCIDE
======================================== */

function iniciarLucide() {

    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


/* ========================================
   CONFIGURAR EVENTOS
======================================== */

function configurarEventos() {

    prevMonth.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            renderCalendar();

        }
    );


    nextMonth.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            renderCalendar();

        }
    );


    addActivity.addEventListener(
        "click",
        openModal
    );


    emptyAddActivity.addEventListener(
        "click",
        openModal
    );


    closeModal.addEventListener(
        "click",
        closeActivityModal
    );


    cancelModal.addEventListener(
        "click",
        closeActivityModal
    );


    activityModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === activityModal
            ) {

                closeActivityModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                activityModal.classList.contains("active")
            ) {

                closeActivityModal();

            }

        }
    );


    activityForm.addEventListener(
        "submit",
        salvarEvento
    );

}


/* ========================================
   CARREGAR AGENDA DA API
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
            "Eventos da agenda:",
            agendaEvents
        );

        renderCalendar();

        renderEventosDoDia();

    } catch (error) {

        console.error(
            "Erro ao carregar agenda:",
            error
        );

    }

}


/* ========================================
   CALENDÁRIO
======================================== */

function renderCalendar() {

    calendarGrid.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    monthYear.textContent =
        `${months[month]} de ${year}`;


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* Espaços antes do primeiro dia */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty";

        calendarGrid.appendChild(
            empty
        );

    }


    /* Dias do mês */

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


        /* Data selecionada */

        if (
            mesmaData(
                date,
                selectedDate
            )
        ) {

            button.classList.add(
                "selected"
            );

        }


        /* Possui evento */

        if (
            possuiEventoNaData(date)
        ) {

            button.classList.add(
                "has-event"
            );

        }


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

                renderEventosDoDia();

            }
        );


        calendarGrid.appendChild(
            button
        );

    }


    iniciarLucide();

}


/* ========================================
   VERIFICAR EVENTO NA DATA
======================================== */

function possuiEventoNaData(date) {

    return agendaEvents.some(
        (event) => {

            if (!event.date) {
                return false;
            }

            return mesmaData(
                new Date(event.date),
                date
            );

        }
    );

}


/* ========================================
   COMPARAR DATAS
======================================== */

function mesmaData(date1, date2) {

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
   DATA SELECIONADA
======================================== */

function updateSelectedDate() {

    const day =
        selectedDate.getDate();

    const month =
        months[
            selectedDate.getMonth()
        ];


    selectedDateElement.textContent =
        `${day} de ${month}`;


    const dayName =
        weekdays[
            selectedDate.getDay()
        ];


    const agendaDay =
        document.querySelector(
            ".agenda-day"
        );


    if (agendaDay) {

        agendaDay.textContent =
            obterNomeDia(
                selectedDate.getDay()
            );

    }

}


/* ========================================
   NOME DO DIA
======================================== */

function obterNomeDia(day) {

    const names = [
        "DOMINGO",
        "SEGUNDA-FEIRA",
        "TERÇA-FEIRA",
        "QUARTA-FEIRA",
        "QUINTA-FEIRA",
        "SEXTA-FEIRA",
        "SÁBADO"
    ];

    return names[day];

}


/* ========================================
   SEMANA
======================================== */

function renderWeek() {

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
            mesmaData(
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

                renderEventosDoDia();

            }
        );


        weekSelector.appendChild(
            button
        );

    }


    iniciarLucide();

}


/* ========================================
   RENDERIZAR EVENTOS DO DIA
======================================== */

function renderEventosDoDia() {

    const agendaCard =
        document.querySelector(
            ".agenda-card"
        );

    if (!agendaCard) {
        return;
    }


    const emptyState =
        agendaCard.querySelector(
            ".agenda-empty"
        );


    if (!emptyState) {
        return;
    }


    const eventosDoDia =
        agendaEvents.filter(
            (event) => {

                if (!event.date) {
                    return false;
                }

                return mesmaData(
                    new Date(event.date),
                    selectedDate
                );

            }
        );


    /*
     * Se não existem eventos,
     * mantém o estado vazio.
     */

    if (
        eventosDoDia.length === 0
    ) {

        emptyState.style.display =
            "flex";

        return;

    }


    /*
     * Existem eventos.
     * Substituímos o estado vazio
     * pelos cards.
     */

    emptyState.style.display =
        "none";


    let eventsContainer =
        agendaCard.querySelector(
            ".agenda-events"
        );


    if (!eventsContainer) {

        eventsContainer =
            document.createElement("div");

        eventsContainer.className =
            "agenda-events";

        agendaCard.appendChild(
            eventsContainer
        );

    }


    eventsContainer.innerHTML = "";


    eventosDoDia.forEach(
        (event) => {

            const card =
                document.createElement("article");

            card.className =
                "agenda-event";


            const eventDate =
                new Date(event.date);


            const horario =
                eventDate.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            card.innerHTML = `
                <div class="agenda-event-info">

                    <span class="agenda-event-time">
                        ${horario}
                    </span>

                    <h3>
                        ${escaparHTML(event.title)}
                    </h3>

                    ${
                        event.type
                            ? `
                                <span class="agenda-event-type">
                                    ${escaparHTML(event.type)}
                                </span>
                            `
                            : ""
                    }

                    ${
                        event.description
                            ? `
                                <p>
                                    ${escaparHTML(event.description)}
                                </p>
                            `
                            : ""
                    }

                </div>

                <button
                    type="button"
                    class="delete-event-button"
                    data-id="${event.id}"
                    aria-label="Excluir evento"
                >
                    <i data-lucide="trash-2"></i>
                </button>
            `;


            const deleteButton =
                card.querySelector(
                    ".delete-event-button"
                );


            deleteButton.addEventListener(
                "click",
                () => excluirEvento(event.id)
            );


            eventsContainer.appendChild(
                card
            );

        }
    );


    iniciarLucide();

}


/* ========================================
   ESCAPAR HTML
======================================== */

function escaparHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ========================================
   ABRIR MODAL
======================================== */

function openModal() {

    activityModal.classList.add(
        "active"
    );


    activityDate.value =
        formatDateForInput(
            selectedDate
        );


    activityTime.value =
        "";


    activityName.value =
        "";


    activitySubject.value =
        "";


    activityDescription.value =
        "";


    setTimeout(
        () => {

            activityName.focus();

        },
        100
    );


    iniciarLucide();

}


/* ========================================
   FECHAR MODAL
======================================== */

function closeActivityModal() {

    activityModal.classList.remove(
        "active"
    );

}


/* ========================================
   FORMATAR DATA INPUT
======================================== */

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* ========================================
   SALVAR EVENTO NA API
======================================== */

async function salvarEvento(event) {

    event.preventDefault();


    const name =
        activityName.value.trim();


    const date =
        activityDate.value;


    const time =
        activityTime.value;


    const subject =
        activitySubject.value;


    const description =
        activityDescription.value.trim();


    if (!name) {

        alert(
            "Digite o nome da atividade."
        );

        return;

    }


    if (!date) {

        alert(
            "Selecione uma data."
        );

        return;

    }


    /*
     * Montar data + horário.
     *
     * Se o usuário não informar
     * horário, usamos 00:00.
     */

    const horario =
        time || "00:00";


    const eventDate =
        new Date(
            `${date}T${horario}:00`
        );


    if (
        Number.isNaN(
            eventDate.getTime()
        )
    ) {

        alert(
            "A data ou horário informado é inválido."
        );

        return;

    }


    const saveButton =
        activityForm.querySelector(
            ".save-button"
        );


    const originalContent =
        saveButton.innerHTML;


    saveButton.disabled =
        true;


    saveButton.innerHTML =
        "Salvando...";


    try {

        const newEvent =
            await apiRequest(
                "/agenda",
                {
                    method: "POST",

                    body:
                        JSON.stringify({

                            title: name,

                            description:
                                description || null,

                            date:
                                eventDate.toISOString(),

                            type:
                                subject || null

                        })
                }
            );


        console.log(
            "Evento criado:",
            newEvent
        );


        /*
         * Adiciona imediatamente
         * ao estado local.
         */

        agendaEvents.push(
            newEvent
        );


        closeActivityModal();


        /*
         * Atualiza a interface.
         */

        renderCalendar();

        renderWeek();

        renderEventosDoDia();


        alert(
            "Atividade adicionada com sucesso!"
        );


    } catch (error) {

        console.error(
            "Erro ao criar evento:",
            error
        );


        alert(
            error.message ||
            "Não foi possível adicionar a atividade."
        );

    } finally {

        saveButton.disabled =
            false;

        saveButton.innerHTML =
            originalContent;

        iniciarLucide();

    }

}


/* ========================================
   EXCLUIR EVENTO
======================================== */

async function excluirEvento(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir esta atividade?"
        );


    if (!confirmar) {
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
                (event) =>
                    event.id !== id
            );


        renderCalendar();

        renderWeek();

        renderEventosDoDia();


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
            "Não foi possível excluir a atividade."
        );

    }

}