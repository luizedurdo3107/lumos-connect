lucide.createIcons();

const form =
    document.getElementById("forms2Form");

const backButton =
    document.getElementById("backButton");

const options =
    document.querySelectorAll(
        'input[name="difficulties"]'
    );

const errorMessage =
    document.getElementById(
        "difficultyError"
    );

const savedData =
    localStorage.getItem(
        "lumosForm2"
    );


if (savedData) {

    try {

        const data =
            JSON.parse(savedData);

        if (
            Array.isArray(
                data.difficulties
            )
        ) {

            options.forEach(option => {

                option.checked =
                    data.difficulties.includes(
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
                    'input[name="difficulties"]:checked'
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
            "/front-end/pages/forms/forms1/forms1.html";

    }
);


form.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const selected =
            Array.from(
                document.querySelectorAll(
                    'input[name="difficulties"]:checked'
                )
            ).map(
                option =>
                    option.value
            );


        if (
            selected.length === 0
        ) {

            errorMessage.textContent =
                "Selecione pelo menos uma situação.";

            return;

        }

        errorMessage.textContent =
            "";

        const formData = {

            difficulties:
                selected

        };


        console.log(
            "Respostas do Forms 2:",
            formData
        );

        localStorage.setItem(
            "lumosForm2",
            JSON.stringify(
                formData
            )
        );

        window.location.href =
            "/front-end/pages/forms/forms3/forms3.html";

    }
);