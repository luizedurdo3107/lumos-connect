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

    const agendaEmpty =
        document.querySelector(".agenda-empty");


    /* ========================================
       DATAS
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
       COMPARAR DATAS
    ======================================== */

    function mesmaData(date1, date2) {

        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );

    }


    /* ========================================
       FORMATAR DATA PARA INPUT
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


    /* ========================================
       CARREGAR AGENDA DA API
    ======================================== */

    async function carregarAgenda() {

        try {

            agendaEvents =
                await apiRequest("/agenda");

            console.log(
                "Eventos da agenda:",
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

        }

    }


    /* ========================================
       RENDERIZAR CALENDÁRIO
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


            /* Dia selecionado */

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


            /* Verificar se possui eventos */

            const possuiEvento =
                agendaEvents.some(
                    event =>
                        event.date &&
                        mesmaData(
                            new Date(event.date),
                            date
                        )
                );


            if (possuiEvento) {

                button.classList.add(
                    "has-event"
                );

            }


            /* Clique */

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


            calendarGrid.appendChild(
                button
            );

        }

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
                startOfWeek.getDate() +
                i
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

                    renderEvents();

                }
            );


            weekSelector.appendChild(
                button
            );

        }

    }


    /* ========================================
       MOSTRAR EVENTOS DO DIA
    ======================================== */

    function renderEvents() {

        const eventsOfDay =
            agendaEvents.filter(
                event =>
                    event.date &&
                    mesmaData(
                        new Date(event.date),
                        selectedDate
                    )
            );


        if (!agendaEmpty) {
            return;
        }


        if (eventsOfDay.length === 0) {

            agendaEmpty.innerHTML = `
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

            button.addEventListener(
                "click",
                openModal
            );

        } else {

            agendaEmpty.innerHTML = "";

            eventsOfDay.forEach(
                event => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
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


                    card.innerHTML = `
                        <div class="agenda-event-icon">
                            <i data-lucide="calendar-check"></i>
                        </div>

                        <div class="agenda-event-content">

                            <strong>
                                ${event.title}
                            </strong>

                            ${
                                event.description
                                    ? `
                                        <p>
                                            ${event.description}
                                        </p>
                                    `
                                    : ""
                            }

                            <small>
                                ${event.type || "Evento"}
                                ${time !== "00:00" ? ` • ${time}` : ""}
                            </small>

                        </div>
                    `;

                    agendaEmpty.appendChild(
                        card
                    );

                }
            );

        }


        if (
            typeof lucide !==
            "undefined"
        ) {

            lucide.createIcons();

        }

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

        setTimeout(
            () => {

                document
                    .getElementById(
                        "activityName"
                    )
                    ?.focus();

            },
            100
        );

    }


    /* ========================================
       FECHAR MODAL
    ======================================== */

    function closeActivityModal() {

        activityModal.classList.remove(
            "active"
        );

        activityForm.reset();

    }


    /* ========================================
       BOTÕES
    ======================================== */

    addActivity.addEventListener(
        "click",
        openModal
    );


    /*
       O botão vazio é recriado
       dinamicamente, por isso usamos
       delegação de eventos.
    */

    closeModal.addEventListener(
        "click",
        closeActivityModal
    );


    cancelModal.addEventListener(
        "click",
        closeActivityModal
    );


    /* ========================================
       CLICAR FORA DO MODAL
    ======================================== */

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


    /* ========================================
       ESC
    ======================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                activityModal.classList.contains(
                    "active"
                )
            ) {

                closeActivityModal();

            }

        }
    );


    /* ========================================
       SALVAR EVENTO NO BACK-END
    ======================================== */

    activityForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "activityName"
                    )
                    .value.trim();


            const date =
                activityDate.value;


            const time =
                document
                    .getElementById(
                        "activityTime"
                    )
                    .value;


            const subject =
                document
                    .getElementById(
                        "activitySubject"
                    )
                    .value;


            const description =
                document
                    .getElementById(
                        "activityDescription"
                    )
                    .value.trim();


            if (!name || !date) {

                return;

            }


            /* Montar data */

            const eventDate =
                time
                    ? new Date(
                        `${date}T${time}`
                    ).toISOString()
                    : new Date(
                        `${date}T00:00:00`
                    ).toISOString();


            const saveButton =
                activityForm.querySelector(
                    ".save-button"
                );


            const originalContent =
                saveButton.innerHTML;


            saveButton.disabled = true;

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
                                        description ||
                                        null,

                                    date:
                                        eventDate,

                                    type:
                                        subject ||
                                        null
                                })
                        }
                    );


                console.log(
                    "Evento criado:",
                    newEvent
                );


                /*
                 * Adiciona imediatamente
                 * na memória
                 */

                agendaEvents.push(
                    newEvent
                );


                closeActivityModal();

                updateSelectedDate();

                renderCalendar();

                renderWeek();

                renderEvents();


                console.log(
                    "Evento salvo com sucesso!"
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

                saveButton.disabled =
                    false;

                saveButton.innerHTML =
                    originalContent;

                if (
                    typeof lucide !==
                    "undefined"
                ) {

                    lucide.createIcons();

                }

            }

        }
    );


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