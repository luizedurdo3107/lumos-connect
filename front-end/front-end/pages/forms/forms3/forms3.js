lucide.createIcons();

const form =
    document.getElementById("forms3Form");

const backButton =
    document.getElementById("backButton");

const options =
    document.querySelectorAll(
        'input[name="learningResources"]'
    );

const errorMessage =
    document.getElementById(
        "resourceError"
    );

const savedData =
    localStorage.getItem(
        "lumosForm3"
    );


if (savedData) {

    try {

        const data =
            JSON.parse(savedData);

        if (
            Array.isArray(
                data.learningResources
            )
        ) {

            options.forEach(option => {

                option.checked =
                    data.learningResources.includes(
                        option.value
                    );

            });

        }

    } catch (error) {

        console.error(
            "Erro ao carregar respostas:",
            error
        );

    }

}

options.forEach(option => {

    option.addEventListener(
        "change",
        () => {

            const selected =
                document.querySelectorAll(
                    'input[name="learningResources"]:checked'
                );

            if (
                selected.length > 0
            ) {

                errorMessage.textContent =
                    "";

            }

        }
    );

});


backButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "/front-end/pages/forms/forms2/forms2.html";

    }
);


form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const selected =
            Array.from(
                document.querySelectorAll(
                    'input[name="learningResources"]:checked'
                )
            ).map(
                option =>
                    option.value
            );


        if (
            selected.length === 0
        ) {

            errorMessage.textContent =
                "Selecione pelo menos um recurso.";

            return;

        }

        errorMessage.textContent =
            "";

        const formData = {

            learningResources:
                selected

        };

        console.log(
            "Respostas do Forms 3:",
            formData
        );


        localStorage.setItem(
            "lumosForm3",
            JSON.stringify(
                formData
            )
        );

        window.location.href =
            "/front-end/pages/forms/forms4/forms4.html";

    }
);