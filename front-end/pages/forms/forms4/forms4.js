lucide.createIcons();


const form =
    document.getElementById("forms4Form");

const suggestions =
    document.getElementById("suggestions");

const characterCount =
    document.getElementById("characterCount");

const errorMessage =
    document.getElementById(
        "suggestionsError"
    );

const backButton =
    document.getElementById("backButton");


const savedData =
    localStorage.getItem(
        "lumosForm4"
    );


if (savedData) {

    try {

        const data =
            JSON.parse(savedData);

        if (data.suggestions) {

            suggestions.value =
                data.suggestions;

            updateCharacterCount();

        }

    } catch (error) {

        console.error(
            "Erro ao carregar resposta:",
            error
        );

    }

}


function updateCharacterCount() {

    const length =
        suggestions.value.length;

    characterCount.textContent =
        `${length}/500`;

}

suggestions.addEventListener(
    "input",
    updateCharacterCount
);

backButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "../forms3/forms3.html";

    }
);


form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const text =
            suggestions.value.trim();



        const formData = {

            suggestions: text

        };

        localStorage.setItem(
            "lumosForm4",
            JSON.stringify(
                formData
            )
        );

        errorMessage.textContent =
            "";

        console.log(
            "Formulário concluído:",
            formData
        );


        window.location.href =
            "/front-end/pages/forms/concluido/concluido.html";

    }
);