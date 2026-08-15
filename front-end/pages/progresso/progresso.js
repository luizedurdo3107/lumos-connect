
let progressData = {
    totalExercises: 0,
    accuracy: 0,
    studyTime: "0h00m",
    streak: 0,
    weeklyActivity: [],
    subjects: []
};


/* ========================================
   AUTH
======================================== */

function getToken() {
    return (
        localStorage.getItem("lumos_token")       ||
        localStorage.getItem("authToken")   ||
        sessionStorage.getItem("token")     ||
        sessionStorage.getItem("authToken")
    );
}


/* ========================================
   FETCH
======================================== */

async function apiFetch(endpoint) {
    const token = getToken();

    if (!token) {
        throw new Error("Usuario nao autenticado.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao acessar ${endpoint}`);
    }

    return response.json();
}


/* ========================================
   FORMATAR TEMPO
======================================== */

function formatStudyTime(minutes) {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    const hours = Math.floor(total / 60);
    const mins  = total % 60;
    return `${hours}h${String(mins).padStart(2, "0")}m`;
}


/* ========================================
   CALCULAR STREAK
======================================== */

function calculateStreak(sessions) {
    if (!Array.isArray(sessions) || sessions.length === 0) return 0;

    const days = new Set(
        sessions
            .filter(s => s && s.startedAt)
            .map(s => new Date(s.startedAt).toISOString().split("T")[0])
    );

    let streak = 0;

    /* FIX: cria uma copia local para nao mutar o Date original */
    const cursor = new Date();

    while (true) {
        const date = cursor.toISOString().split("T")[0];
        if (!days.has(date)) break;
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}


/* ========================================
   ATIVIDADE SEMANAL
======================================== */

function buildWeeklyActivity(sessions) {
    /* FIX: "Sab" sem acento para evitar corrupcao UTF-8 */
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const values   = Array(7).fill(0);

    if (Array.isArray(sessions)) {
        sessions.forEach(session => {
            /* FIX: guard para startedAt invalido */
            if (!session || !session.startedAt) return;

            const date = new Date(session.startedAt);
            if (isNaN(date.getTime())) return;

            const day = date.getDay();
            values[day] += Number(session.duration) || 0;
        });
    }

    return dayNames.map((day, index) => ({ day, value: values[index] }));
}


/* ========================================
   CARREGAR DADOS
======================================== */

async function loadProgressData() {
    const [progress, sessions, activities] = await Promise.all([
        apiFetch("/progress"),
        apiFetch("/study-sessions"),
        apiFetch("/activities")
    ]);

    const progressList = Array.isArray(progress)    ? progress    : [];
    const sessionList  = Array.isArray(sessions)    ? sessions    : [];
    const activityList = Array.isArray(activities)  ? activities  : [];

    const totalStudyMinutes = sessionList.reduce(
        (total, session) => total + (Number(session.duration) || 0),
        0
    );

    const exerciseCount = activityList.reduce((total, activity) => {
        const contents = Array.isArray(activity.contents) ? activity.contents : [];
        return total + contents.filter(c => c.type === "EXERCISE").length;
    }, 0);

    const averageProgress = progressList.length
        ? Math.round(
            progressList.reduce(
                (total, item) => total + (Number(item.percentage) || 0),
                0
            ) / progressList.length
        )
        : 0;

    progressData = {
        totalExercises: exerciseCount,
        accuracy:       averageProgress,
        studyTime:      formatStudyTime(totalStudyMinutes),
        streak:         calculateStreak(sessionList),
        weeklyActivity: buildWeeklyActivity(sessionList),
        subjects:       progressList.map(item => ({
            name:     item.subject,
            progress: Math.min(100, Math.max(0, Number(item.percentage) || 0))
        }))
    };
}


/* ========================================
   RESUMO
======================================== */

function updateSummary() {
    const els = {
        totalExercises: document.getElementById("totalExercises"),
        accuracy:       document.getElementById("accuracy"),
        studyTime:      document.getElementById("studyTime"),
        streak:         document.getElementById("streak")
    };

    if (els.totalExercises) els.totalExercises.textContent = progressData.totalExercises;
    if (els.accuracy)       els.accuracy.textContent       = `${progressData.accuracy}%`;
    if (els.studyTime)      els.studyTime.textContent      = progressData.studyTime;
    if (els.streak)         els.streak.textContent         = progressData.streak;
}


/* ========================================
   GRAFICO SEMANAL
======================================== */

function createWeeklyChart() {
    const chart = document.getElementById("weeklyChart");
    if (!chart) return;

    chart.innerHTML = "";

    if (!progressData.weeklyActivity.length) return;

    /* FIX: reduce evita RangeError em arrays grandes no spread */
    const maxValue = progressData.weeklyActivity.reduce(
        (acc, item) => (item.value > acc ? item.value : acc),
        1
    );

    progressData.weeklyActivity.forEach(item => {
        const column = document.createElement("div");
        column.className = "chart-column";

        const valueEl = document.createElement("span");
        valueEl.className   = "chart-value";
        valueEl.textContent = item.value;

        const barContainer = document.createElement("div");
        barContainer.className = "chart-bar-container";

        const bar = document.createElement("div");
        bar.className = "chart-bar";

        /* FIX: clamp entre 0 e 100 */
        const pct = Math.min(100, Math.max(0, (item.value / maxValue) * 100));
        bar.style.height = `${pct}%`;

        const day = document.createElement("span");
        day.className   = "chart-day";
        day.textContent = item.day;

        barContainer.appendChild(bar);
        column.appendChild(valueEl);
        column.appendChild(barContainer);
        column.appendChild(day);
        chart.appendChild(column);
    });
}


/* ========================================
   MATERIAS
======================================== */

function createSubjects() {
    const container = document.getElementById("subjectsList");
    if (!container) return;

    container.innerHTML = "";

    if (!progressData.subjects.length) {
        container.innerHTML = "<p>Nenhum progresso registrado ainda.</p>";
        return;
    }

    progressData.subjects.forEach(subject => {
        const pct = Math.min(100, Math.max(0, Number(subject.progress) || 0));

        const item = document.createElement("div");
        item.className = "subject-item";

        const name = document.createElement("span");
        name.className   = "subject-name";
        name.textContent = subject.name;

        const progressWrapper = document.createElement("div");
        progressWrapper.className = "subject-progress";

        const progressBar = document.createElement("div");
        progressBar.className   = "subject-progress-bar";
        progressBar.style.width = `${pct}%`;

        const percent = document.createElement("span");
        percent.className   = "subject-percent";
        percent.textContent = `${Math.round(pct)}%`;

        progressWrapper.appendChild(progressBar);
        item.appendChild(name);
        item.appendChild(progressWrapper);
        item.appendChild(percent);
        container.appendChild(item);
    });
}


/* ========================================
   ABAS
======================================== */

function initializeTabs() {
    const tabs        = document.querySelectorAll(".progress-tab");
    const tabContents = document.querySelectorAll(".tab-content");

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            /* FIX: guard para data-tab ausente */
            const target = tab.dataset.tab;
            if (!target) return;

            tabs.forEach(item => item.classList.remove("active"));
            tab.classList.add("active");

            tabContents.forEach(content => content.classList.remove("active"));

            const targetContent = document.getElementById(target);
            if (targetContent) targetContent.classList.add("active");
        });
    });
}


/* ========================================
   ERRO NA UI
======================================== */

function mostrarErro(mensagem) {
    ["weeklyChart", "subjectsList"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<p style="color:#C75C5C;padding:16px;">${mensagem}</p>`;
        }
    });
}


/* ========================================
   INICIALIZACAO
======================================== */

async function initializeProgressPage() {
    try {
        await loadProgressData();

        updateSummary();
        createWeeklyChart();
        createSubjects();
        initializeTabs();

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        console.log("Lumos Connect: progresso carregado.");

    } catch (error) {
        console.error("Erro ao carregar progresso:", error);

        /* FIX: feedback visual quando a API falha */
        mostrarErro("Nao foi possivel carregar o progresso. Tente novamente.");
    }
}

initializeProgressPage();

