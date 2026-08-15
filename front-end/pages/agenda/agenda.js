/* ========================================
   SISTEMA DE TOAST
======================================== */

function mostrarToast(mensagem, tipo = "success") {
    let container = document.getElementById("lumosToastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "lumosToastContainer";
        container.style.cssText = [
            "position:fixed",
            "top:24px",
            "right:24px",
            "z-index:99999",
            "display:flex",
            "flex-direction:column",
            "gap:12px",
            "pointer-events:none",
        ].join(";");
        document.body.appendChild(container);
    }

    const icons = {
        error: "alert-circle",
        warning: "triangle-alert",
        success: "check-circle",
    };

    const borderColors = {
        error: "#C75C5C",
        warning: "#D6A84F",
        success: "#4E6F5A",
    };

    const toast = document.createElement("div");
    toast.className = `lumos-toast ${tipo}`;
    toast.innerHTML = `<i data-lucide="${icons[tipo] ?? "check-circle"}"></i><span>${mensagem}</span>`;

    toast.style.cssText = [
        "display:flex",
        "align-items:center",
        "gap:10px",
        "min-width:280px",
        "max-width:380px",
        "padding:14px 18px",
        "border-radius:12px",
        "background:#ffffff",
        "border:1px solid #D3D9CC",
        `border-left:4px solid ${borderColors[tipo] ?? borderColors.success}`,
        "box-shadow:0 8px 30px rgba(0,0,0,.12)",
        "color:#2B3B36",
        "font-size:14px",
        "font-weight:500",
        "pointer-events:auto",
        "animation:lumosToastIn .25s ease",
    ].join(";");

    container.appendChild(toast);

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    setTimeout(() => {
        toast.style.transition = "all .25s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}


/* ========================================
   ANIMACAO DO TOAST
   Injetada apos o DOM estar pronto para
   garantir que document.head existe.
======================================== */

function injetarEstiloToast() {
    if (document.getElementById("lumosToastStyle")) return;

    const style = document.createElement("style");
    style.id = "lumosToastStyle";
    style.textContent = `
        @keyframes lumosToastIn {
            from { opacity:0; transform:translateX(20px); }
            to   { opacity:1; transform:translateX(0);    }
        }
    `;
    document.head.appendChild(style);
}


/* ========================================
   INICIALIZACAO
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    injetarEstiloToast();

    /* ========================================
       ELEMENTOS
    ======================================== */

    const calendarGrid        = document.getElementById("calendarGrid");
    const monthYear           = document.getElementById("monthYear");
    const prevMonth           = document.getElementById("prevMonth");
    const nextMonth           = document.getElementById("nextMonth");
    const selectedDateElement = document.getElementById("selectedDate");
    const weekSelector        = document.getElementById("weekSelector");
    const activityModal       = document.getElementById("activityModal");
    const closeModal          = document.getElementById("closeModal");
    const cancelModal         = document.getElementById("cancelModal");
    const activityForm        = document.getElementById("activityForm");
    const addActivity         = document.getElementById("addActivity");
    const activityDate        = document.getElementById("activityDate");
    const activityTime        = document.getElementById("activityTime");
    const activityName        = document.getElementById("activityName");
    const activitySubject     = document.getElementById("activitySubject");
    const activityDescription = document.getElementById("activityDescription");


    /* ========================================
       DADOS
    ======================================== */

    let currentDate  = new Date();
    let selectedDate = new Date();
    let agendaEvents = [];


    /* ========================================
       MESES / DIAS
    ======================================== */

    const months = [
        "Janeiro", "Fevereiro", "Marco",    "Abril",
        "Maio",    "Junho",     "Julho",    "Agosto",
        "Setembro","Outubro",   "Novembro", "Dezembro",
    ];

    const weekdays = ["DOM","SEG","TER","QUA","QUI","SEX","SAB"];


    /* ========================================
       HELPERS DE DATA
       Todas as datas da API chegam como ISO
       strings (UTC). Convertemos para um
       objeto local sem deixar o JS aplicar
       o offset de fuso errado.
    ======================================== */

    /**
     * Recebe uma string ISO ou um objeto Date e
     * devolve um Date interpretado no horario LOCAL,
     * evitando o bug de "dia anterior" em fusos negativos.
     */
    function parseDateLocal(value) {
        if (!value) return new Date(NaN);

        // Se ja e um Date, devolve sem modificar
        if (value instanceof Date) return value;

        const str = String(value);

        // "2024-08-15" (sem hora) -> interpreta como local
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [y, m, d] = str.split("-").map(Number);
            return new Date(y, m - 1, d);
        }

        // ISO completo -> Date normal (UTC), mas ajustamos
        // depois apenas para comparacao de dia
        return new Date(str);
    }

    /** Extrai ano/mes/dia no horario LOCAL do objeto Date. */
    function localParts(date) {
        return {
            y: date.getFullYear(),
            m: date.getMonth(),
            d: date.getDate(),
        };
    }

    function sameDay(a, b) {
        const pa = localParts(a instanceof Date ? a : parseDateLocal(a));
        const pb = localParts(b instanceof Date ? b : parseDateLocal(b));
        return pa.y === pb.y && pa.m === pb.m && pa.d === pb.d;
    }

    function formatDateForInput(date) {
        const { y, m, d } = localParts(date);
        return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    }

    /**
     * Extrai "HH:MM" de forma segura a partir de uma string ISO,
     * sem depender de toLocaleTimeString (que varia por locale/SO).
     */
    function extractTime(isoString) {
        if (!isoString) return "00:00";
        // "2024-08-15T14:30:00.000Z" -> pega a parte apos o T
        const match = String(isoString).match(/T(\d{2}:\d{2})/);
        return match ? match[1] : "00:00";
    }


    /* ========================================
       CARREGAR AGENDA
    ======================================== */

    async function carregarAgenda() {
        try {
            const events  = await apiRequest("/agenda");
            agendaEvents  = Array.isArray(events) ? events : [];
            console.log("Agenda carregada:", agendaEvents);
            renderCalendar();
            renderWeek();
            renderEvents();
        } catch (error) {
            console.error("Erro ao carregar agenda:", error);
            agendaEvents = [];
            renderEvents();
            mostrarToast("Nao foi possivel carregar a agenda.", "error");
        }
    }


    /* ========================================
       MODAL
    ======================================== */

    function openModal() {
        if (!activityModal) return;
        activityModal.classList.add("active");
        if (activityDate) activityDate.value = formatDateForInput(selectedDate);
        setTimeout(() => activityName && activityName.focus(), 100);
    }

    function closeActivityModal() {
        if (!activityModal) return;
        activityModal.classList.remove("active");
    }


    /* ========================================
       RENDERIZAR CALENDARIO
    ======================================== */

    function renderCalendar() {
        if (!calendarGrid) return;

        calendarGrid.innerHTML = "";

        const year  = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (monthYear) monthYear.textContent = `${months[month]} de ${year}`;

        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Espacos em branco antes do primeiro dia
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-day empty";
            calendarGrid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date   = new Date(year, month, day);
            const button = document.createElement("button");
            button.type      = "button";
            button.className = "calendar-day";
            button.textContent = day;

            if (sameDay(date, selectedDate)) {
                button.classList.add("selected");
            }

            // FIX: parseDateLocal garante comparacao correta no fuso local
            const hasEvent = agendaEvents.some(
                event => event.date && sameDay(parseDateLocal(event.date), date)
            );

            if (hasEvent) {
                button.classList.add("has-event");
                const dot = document.createElement("span");
                dot.className = "calendar-event-dot";
                button.appendChild(dot);
            }

            button.addEventListener("click", () => {
                selectedDate = new Date(year, month, day);
                currentDate  = new Date(year, month, 1);
                updateSelectedDate();
                renderCalendar();
                renderWeek();
                renderEvents();
            });

            calendarGrid.appendChild(button);
        }
    }


    /* ========================================
       ATUALIZAR DATA SELECIONADA
    ======================================== */

    function updateSelectedDate() {
        if (!selectedDateElement) return;
        selectedDateElement.textContent =
            `${selectedDate.getDate()} de ${months[selectedDate.getMonth()]}`;
    }


    /* ========================================
       RENDERIZAR SEMANA
    ======================================== */

    function renderWeek() {
        if (!weekSelector) return;

        weekSelector.innerHTML = "";

        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            const button = document.createElement("button");
            button.type      = "button";
            button.className = "week-day";

            if (sameDay(date, selectedDate)) {
                button.classList.add("selected");
            }

            button.innerHTML = `
                <span class="week-day-name">${weekdays[date.getDay()]}</span>
                <span class="week-day-number">${date.getDate()}</span>
            `;

            button.addEventListener("click", () => {
                selectedDate = new Date(date);
                currentDate  = new Date(date.getFullYear(), date.getMonth(), 1);
                updateSelectedDate();
                renderCalendar();
                renderWeek();
                renderEvents();
            });

            weekSelector.appendChild(button);
        }
    }


    /* ========================================
       RENDERIZAR EVENTOS
    ======================================== */

    function renderEvents() {
        // FIX: o seletor correto e ".agenda-empty" mas pode
        // ser qualquer container -- ajuste ao seu HTML real.
        const container = document.querySelector(".agenda-empty");
        if (!container) return;

        const eventsOfDay = agendaEvents.filter(
            event => event.date && sameDay(parseDateLocal(event.date), selectedDate)
        );

        if (eventsOfDay.length === 0) {
            container.innerHTML = `
                <div class="empty-calendar-icon">
                    <i data-lucide="calendar-days"></i>
                </div>
                <p>Nenhuma atividade neste dia.</p>
                <button type="button" class="empty-add-button" id="emptyAddActivity">
                    Adicionar atividade
                </button>
            `;

            const btn = document.getElementById("emptyAddActivity");
            if (btn) btn.addEventListener("click", openModal);

            if (typeof lucide !== "undefined") lucide.createIcons();
            return;
        }

        container.innerHTML = "";

        eventsOfDay.forEach(event => {
            const element    = document.createElement("article");
            element.className = "agenda-event";

            // FIX: usa extractTime para obter "HH:MM" de forma confiavel
            const time = extractTime(event.date);

            element.innerHTML = `
                <div class="agenda-event-icon">
                    <i data-lucide="calendar-check"></i>
                </div>
                <div class="agenda-event-content">
                    <h3>${event.title}</h3>
                    ${event.description ? `<p>${event.description}</p>` : ""}
                    <span>${event.type || "Evento"}${time ? ` * ${time}` : ""}</span>
                </div>
                <div class="agenda-event-actions">
                    <button
                        type="button"
                        class="agenda-edit-button"
                        data-id="${event.id}"
                        title="Editar evento"
                        aria-label="Editar evento"
                    >
                        <i data-lucide="pencil"></i>
                    </button>
                    <button
                        type="button"
                        class="agenda-delete-button"
                        data-id="${event.id}"
                        title="Excluir evento"
                        aria-label="Excluir evento"
                    >
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            container.appendChild(element);
        });

        // FIX: dataset.id e sempre string -- comparamos como string tambem
        container.querySelectorAll(".agenda-edit-button").forEach(btn => {
            btn.addEventListener("click", () => {
                const id    = btn.dataset.id;           // string
                const event = agendaEvents.find(e => String(e.id) === id);
                if (event) editarEvento(event);
            });
        });

        container.querySelectorAll(".agenda-delete-button").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;              // string
                excluirEvento(id);
            });
        });

        if (typeof lucide !== "undefined") lucide.createIcons();
    }


    /* ========================================
       EDITAR EVENTO
    ======================================== */

    function editarEvento(event) {
        // FIX: extrai data e hora de forma segura, sem toLocaleTimeString
        const isoDate   = String(event.date ?? "");
        const datePart  = isoDate.slice(0, 10);          // "YYYY-MM-DD"
        const timePart  = extractTime(isoDate);           // "HH:MM"

        const newTitle = prompt("Nome da atividade:", event.title);
        if (newTitle === null) return;

        const newDescription = prompt("Descricao:", event.description || "");
        if (newDescription === null) return;

        const newType = prompt("Tipo / materia:", event.type || "ESTUDO");
        if (newType === null) return;

        salvarEdicaoEvento(
            event.id,
            newTitle.trim(),
            newDescription.trim(),
            newType.trim(),
            datePart,
            timePart,
        );
    }


    /* ========================================
       SALVAR EDICAO
    ======================================== */

    async function salvarEdicaoEvento(id, title, description, type, date, time) {
        if (!title) {
            mostrarToast("O nome da atividade e obrigatorio.", "warning");
            return;
        }

        try {
            // FIX: time ja vem como "HH:MM", monta ISO sem duplicar segundos
            const isoString = `${date}T${time}:00`;

            const updated = await apiRequest(`/agenda/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    title,
                    description: description || null,
                    date: new Date(isoString).toISOString(),
                    type: type || "ESTUDO",
                }),
            });

            // FIX: compara como string para achar o indice corretamente
            const index = agendaEvents.findIndex(e => String(e.id) === String(id));
            if (index !== -1) agendaEvents[index] = updated;

            renderCalendar();
            renderWeek();
            renderEvents();

            mostrarToast("Evento atualizado com sucesso.", "success");
            console.log("Evento atualizado:", updated);

        } catch (error) {
            console.error("Erro ao atualizar evento:", error);
            mostrarToast(error.message || "Nao foi possivel atualizar o evento.", "error");
        }
    }


    /* ========================================
       EXCLUIR EVENTO
    ======================================== */

    async function excluirEvento(id) {
        // FIX: compara como string
        const event = agendaEvents.find(e => String(e.id) === String(id));
        if (!event) return;

        if (!confirm(`Deseja excluir "${event.title}"?`)) return;

        try {
            await apiRequest(`/agenda/${id}`, { method: "DELETE" });

            agendaEvents = agendaEvents.filter(e => String(e.id) !== String(id));

            renderCalendar();
            renderWeek();
            renderEvents();

            mostrarToast("Evento excluido com sucesso.", "success");
            console.log("Evento excluido:", id);

        } catch (error) {
            console.error("Erro ao excluir evento:", error);
            mostrarToast(error.message || "Nao foi possivel excluir o evento.", "error");
        }
    }


    /* ========================================
       NAVEGACAO NO CALENDARIO
    ======================================== */

    if (prevMonth) {
        prevMonth.addEventListener("click", () => {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            renderCalendar();
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener("click", () => {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            renderCalendar();
        });
    }


    /* ========================================
       BOTOES DO MODAL
    ======================================== */

    if (addActivity)  addActivity.addEventListener("click", openModal);
    if (closeModal)   closeModal.addEventListener("click", closeActivityModal);
    if (cancelModal)  cancelModal.addEventListener("click", closeActivityModal);

    if (activityModal) {
        activityModal.addEventListener("click", e => {
            if (e.target === activityModal) closeActivityModal();
        });
    }

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && activityModal?.classList.contains("active")) {
            closeActivityModal();
        }
    });


    /* ========================================
       SALVAR NOVO EVENTO
    ======================================== */

    if (activityForm) {
        activityForm.addEventListener("submit", async e => {
            e.preventDefault();

            const name        = activityName?.value.trim()        ?? "";
            const date        = activityDate?.value               ?? "";
            const time        = activityTime?.value               ?? "";
            const subject     = activitySubject?.value            ?? "";
            const description = activityDescription?.value.trim() ?? "";

            if (!name || !date) {
                mostrarToast("Preencha o nome e a data da atividade.", "warning");
                return;
            }

            const saveButton = activityForm.querySelector(".save-button");
            const originalContent = saveButton?.innerHTML ?? "";

            if (saveButton) {
                saveButton.disabled   = true;
                saveButton.innerHTML  = "Salvando...";
            }

            try {
                // FIX: monta ISO sem risco de formato invalido
                const isoString = time ? `${date}T${time}:00` : `${date}T00:00:00`;

                const newEvent = await apiRequest("/agenda", {
                    method: "POST",
                    body: JSON.stringify({
                        title:       name,
                        description: description || null,
                        date:        new Date(isoString).toISOString(),
                        type:        subject || "ESTUDO",
                    }),
                });

                agendaEvents.push(newEvent);

                closeActivityModal();
                activityForm.reset();

                updateSelectedDate();
                renderCalendar();
                renderWeek();
                renderEvents();

                mostrarToast("Atividade adicionada com sucesso.", "success");
                console.log("Evento salvo:", newEvent);

            } catch (error) {
                console.error("Erro ao salvar evento:", error);
                mostrarToast(error.message || "Nao foi possivel salvar o evento.", "error");

            } finally {
                if (saveButton) {
                    saveButton.disabled  = false;
                    saveButton.innerHTML = originalContent;
                }
                if (typeof lucide !== "undefined") lucide.createIcons();
            }
        });
    }


    /* ========================================
       INICIALIZACAO FINAL
    ======================================== */

    updateSelectedDate();
    renderCalendar();
    renderWeek();
    carregarAgenda();

    if (typeof lucide !== "undefined") lucide.createIcons();
});