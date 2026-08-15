document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const form = document.getElementById("accessibilityForm");
});
const form =
    document.getElementById("accessibilityForm");

const conditions =
    document.querySelectorAll(
        'input[name="conditions"]'
    );

const conditionsError =
    document.getElementById(
        "conditionsError"
    );

const difficulty =
    document.getElementById("difficulty");

const description =
    document.getElementById("description");

const characterCount =
    document.getElementById(
        "characterCount"
    );

const progressFill =
    document.getElementById(
        "progressFill"
    );

description.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            description.value.length;

    }
);
conditions.forEach(condition => {

    condition.addEventListener(
        "change",
        () => {

            const selected =
                document.querySelectorAll(
                    'input[name="conditions"]:checked'
                );

            if (selected.length > 0) {

                conditionsError.textContent =
                    "";

            }

        }
    );

});

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        let valid = true;


        conditionsError.textContent =
            "";


        const selectedConditions =
            document.querySelectorAll(
                'input[name="conditions"]:checked'
            );


        if (
            selectedConditions.length === 0
        ) {

            conditionsError.textContent =
                "Selecione pelo menos uma opção.";

            valid = false;

        }

        if (
            difficulty.value === ""
        ) {

            difficulty.style.borderColor =
                "var(--error)";

            valid = false;

        } else {

            difficulty.style.borderColor =
                "";

        }
        if (!valid) {

            return;

        }
        const selected =
            Array.from(
                selectedConditions
            ).map(
                condition =>
                    condition.value
            );

        const accessibilityData = {

            conditions:
                selected,

            difficulty:
                difficulty.value,

            description:
                description.value.trim()

        };
        console.log(
            "Dados de acessibilidade:",
            accessibilityData
        );
        localStorage.setItem(
            "lumosAccessibility",
            JSON.stringify(
                accessibilityData
            )
        );
        progressFill.style.width =
            "50%";


        setTimeout(() => {
             window.location.href = "/front-end/pages/forms/forms2/forms2.html";

        }, 300);
    }
);