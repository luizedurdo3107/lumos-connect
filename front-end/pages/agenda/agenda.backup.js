const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const selectedDateElement =
    document.getElementById("selectedDate");

const weekSelector =
    document.getElementById("weekSelector");


/* ========================================
   MODAL
======================================== */

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


/* ========================================
   DATA
======================================== */

let currentDate = new Date(2026, 7, 10);

let selectedDate = new Date(2026, 7, 10);


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
   ABRIR MODAL
======================================== */

function openModal() {

    activityModal.classList.add("active");

    activityDate.value =
        formatDateForInput(selectedDate);

    setTimeout(() => {

        document
            .getElementById("activityName")
            .focus();

    }, 100);
}


/* ========================================
   FECHAR MODAL
======================================== */

function closeActivityModal() {

    activityModal.classList.remove("active");
}


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
        new Date(year, month, 1).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* Espaços antes do primeiro dia */

    for (let i = 0; i < firstDay; i++) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty";

        calendarGrid.appendChild(empty);
    }


    /* Dias */

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


        /* Selecionado */

        if (
            date.getFullYear() ===
                selectedDate.getFullYear() &&
            date.getMonth() ===
                selectedDate.getMonth() &&
            date.getDate() ===
                selectedDate.getDate()
        ) {

            button.classList.add(
                "selected"
            );
        }


        /* Clique */

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


    for (let i = 0; i < 7; i++) {

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
            date.getFullYear() ===
                selectedDate.getFullYear() &&
            date.getMonth() ===
                selectedDate.getMonth() &&
            date.getDate() ===
                selectedDate.getDate()
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
            }
        );


        weekSelector.appendChild(
            button
        );
    }
}


/* ========================================
   MÊS ANTERIOR
======================================== */

prevMonth.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    }
);


/* ========================================
   PRÓXIMO MÊS
======================================== */

nextMonth.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    }
);


/* ========================================
   BOTÕES DE ADICIONAR
======================================== */

addActivity.addEventListener(
    "click",
    openModal
);


emptyAddActivity.addEventListener(
    "click",
    openModal
);


/* ========================================
   FECHAR MODAL
======================================== */

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
    (event) => {

        if (
            event.target ===
            activityModal
        ) {
            closeActivityModal();
        }
    }
);


/* ========================================
   ESC FECHA MODAL
======================================== */

document.addEventListener(
    "keydown",
    (event) => {

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
   SALVAR ATIVIDADE
======================================== */

activityForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const name =
            document
                .getElementById(
                    "activityName"
                )
                .value;


        const date =
            activityDate.value;


        if (!name || !date) {
            return;
        }


        alert(
            `Atividade "${name}" adicionada com sucesso!`
        );


        activityForm.reset();

        closeActivityModal();
    }
);


/* ========================================
   INICIALIZAÇÃO
======================================== */

renderCalendar();

updateSelectedDate();

renderWeek();


if (
    typeof lucide !==
    "undefined"
) {

    lucide.createIcons();
}