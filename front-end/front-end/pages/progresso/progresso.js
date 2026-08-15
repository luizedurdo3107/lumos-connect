/* ========================================
   LUCIDE
======================================== */

lucide.createIcons();


/* ========================================
   DADOS DO PROGRESSO
======================================== */

/*
    Depois esses dados poderão vir
    diretamente da API do backend.
*/

const progressData = {

    totalExercises: 47,

    accuracy: 89,

    studyTime: "2h40m",

    streak: 7,

    weeklyActivity: [
        {
            day: "Seg",
            value: 12
        },

        {
            day: "Ter",
            value: 8
        },

        {
            day: "Qua",
            value: 15
        },

        {
            day: "Qui",
            value: 6
        },

        {
            day: "Sex",
            value: 10
        },

        {
            day: "Sáb",
            value: 4
        },

        {
            day: "Dom",
            value: 0
        }
    ],

    subjects: [

        {
            name: "Português",
            progress: 72
        },

        {
            name: "Matemática",
            progress: 65
        },

        {
            name: "Geografia",
            progress: 48
        },

        {
            name: "Física",
            progress: 55
        },

        {
            name: "Química",
            progress: 42
        },

        {
            name: "Biologia",
            progress: 61
        },

        {
            name: "História",
            progress: 78
        },

        {
            name: "Inglês",
            progress: 70
        },

        {
            name: "Sociologia",
            progress: 36
        },

        {
            name: "Filosofia",
            progress: 44
        }

    ]

};


/* ========================================
   ATUALIZAR RESUMO
======================================== */

function updateSummary() {

    document.getElementById(
        "totalExercises"
    ).textContent =
        progressData.totalExercises;


    document.getElementById(
        "accuracy"
    ).textContent =
        `${progressData.accuracy}%`;


    document.getElementById(
        "studyTime"
    ).textContent =
        progressData.studyTime;


    document.getElementById(
        "streak"
    ).textContent =
        progressData.streak;

}


/* ========================================
   CRIAR GRÁFICO
======================================== */

function createWeeklyChart() {

    const chart =
        document.getElementById("weeklyChart");


    chart.innerHTML = "";


    const maxValue =
        Math.max(
            ...progressData.weeklyActivity
                .map(item => item.value)
        );


    progressData.weeklyActivity.forEach(
        item => {

            const column =
                document.createElement("div");

            column.className =
                "chart-column";


            const value =
                document.createElement("span");

            value.className =
                "chart-value";

            value.textContent =
                item.value;


            const barContainer =
                document.createElement("div");

            barContainer.className =
                "chart-bar-container";


            const bar =
                document.createElement("div");

            bar.className =
                "chart-bar";


            /*
                Calcula automaticamente
                a altura da barra.
            */

            const percentage =
                maxValue > 0
                    ? (item.value / maxValue) * 100
                    : 0;


            bar.style.height =
                `${percentage}%`;


            const day =
                document.createElement("span");

            day.className =
                "chart-day";

            day.textContent =
                item.day;


            barContainer.appendChild(bar);

            column.appendChild(value);

            column.appendChild(
                barContainer
            );

            column.appendChild(day);

            chart.appendChild(column);

        }
    );

}


/* ========================================
   CRIAR LISTA DE MATÉRIAS
======================================== */

function createSubjects() {

    const container =
        document.getElementById(
            "subjectsList"
        );


    container.innerHTML = "";


    progressData.subjects.forEach(
        subject => {

            const item =
                document.createElement("div");

            item.className =
                "subject-item";


            const name =
                document.createElement("span");

            name.className =
                "subject-name";

            name.textContent =
                subject.name;


            const progress =
                document.createElement("div");

            progress.className =
                "subject-progress";


            const progressBar =
                document.createElement("div");

            progressBar.className =
                "subject-progress-bar";


            progressBar.style.width =
                `${subject.progress}%`;


            const percent =
                document.createElement("span");

            percent.className =
                "subject-percent";

            percent.textContent =
                `${subject.progress}%`;


            progress.appendChild(
                progressBar
            );


            item.appendChild(name);

            item.appendChild(progress);

            item.appendChild(percent);


            container.appendChild(item);

        }
    );

}


/* ========================================
   SISTEMA DE ABAS
======================================== */

const tabs =
    document.querySelectorAll(
        ".progress-tab"
    );


const tabContents =
    document.querySelectorAll(
        ".tab-content"
    );


tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            const target =
                tab.dataset.tab;


            /* Remove aba ativa */

            tabs.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            /* Ativa botão clicado */

            tab.classList.add(
                "active"
            );


            /* Esconde conteúdos */

            tabContents.forEach(
                content => {

                    content.classList.remove(
                        "active"
                    );

                }
            );


            /* Mostra conteúdo */

            const targetContent =
                document.getElementById(
                    target
                );


            if (targetContent) {

                targetContent.classList.add(
                    "active"
                );

            }

        }
    );

});


/* ========================================
   INICIALIZAÇÃO
======================================== */

function initializeProgressPage() {

    updateSummary();

    createWeeklyChart();

    createSubjects();

    lucide.createIcons();

}


initializeProgressPage();