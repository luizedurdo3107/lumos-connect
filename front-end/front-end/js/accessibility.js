/* 
   LUMOS CONNECT
   accessibility.js

   Sistema de acessibilidade
 */


/*
   CONFIGURAÇÕES PADRÃO
 */

const accessibilitySettings = {

    largeText: false,

    extraLargeText: false,

    textSpacing: false,

    reducedMotion: false,

    highContrast: false,

    focusVisible: false

};


/* 
   CARREGAR CONFIGURAÇÕES
 */

function loadAccessibilitySettings() {

    const savedSettings =
        localStorage.getItem(
            "lumosAccessibility"
        );

    if (!savedSettings) {
        return;
    }

    try {

        const settings =
            JSON.parse(savedSettings);

        Object.assign(
            accessibilitySettings,
            settings
        );

    } catch (error) {

        console.error(
            "Erro ao carregar configurações de acessibilidade.",
            error
        );

    }

}


/* 
   SALVAR CONFIGURAÇÕES
 */

function saveAccessibilitySettings() {

    localStorage.setItem(
        "lumosAccessibility",
        JSON.stringify(
            accessibilitySettings
        )
    );

}


/* 
   APLICAR CONFIGURAÇÕES
 */

function applyAccessibilitySettings() {

    const body =
        document.body;


    /* TEXTO MAIOR */

    body.classList.toggle(
        "accessibility-large-text",
        accessibilitySettings.largeText
    );


    /* TEXTO EXTRA GRANDE */

    body.classList.toggle(
        "accessibility-extra-large-text",
        accessibilitySettings.extraLargeText
    );


    /* ESPAÇAMENTO */

    body.classList.toggle(
        "accessibility-text-spacing",
        accessibilitySettings.textSpacing
    );


    /* REDUZIR ANIMAÇÕES */

    body.classList.toggle(
        "accessibility-reduced-motion",
        accessibilitySettings.reducedMotion
    );


    /* ALTO CONTRASTE */

    body.classList.toggle(
        "accessibility-high-contrast",
        accessibilitySettings.highContrast
    );


    /* FOCO */

    body.classList.toggle(
        "accessibility-focus-visible",
        accessibilitySettings.focusVisible
    );

}


/* 
   ALTERAR CONFIGURAÇÃO
 */

function setAccessibility(
    setting,
    value
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            accessibilitySettings,
            setting
        )
    ) {

        console.warn(
            `Configuração "${setting}" não existe.`
        );

        return;
    }

    accessibilitySettings[setting] =
        Boolean(value);

    applyAccessibilitySettings();

    saveAccessibilitySettings();

}


/* 
   ALTERNAR CONFIGURAÇÃO
 */

function toggleAccessibility(setting) {

    if (
        !Object.prototype.hasOwnProperty.call(
            accessibilitySettings,
            setting
        )
    ) {

        return;
    }

    accessibilitySettings[setting] =
        !accessibilitySettings[setting];

    applyAccessibilitySettings();

    saveAccessibilitySettings();

}


/* 
   RESTAURAR PADRÃO
 */

function resetAccessibility() {

    accessibilitySettings.largeText =
        false;

    accessibilitySettings.extraLargeText =
        false;

    accessibilitySettings.textSpacing =
        false;

    accessibilitySettings.reducedMotion =
        false;

    accessibilitySettings.highContrast =
        false;

    accessibilitySettings.focusVisible =
        false;

    applyAccessibilitySettings();

    saveAccessibilitySettings();

}


/* 
   INICIALIZAÇÃO
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAccessibilitySettings();

        applyAccessibilitySettings();

    }
);