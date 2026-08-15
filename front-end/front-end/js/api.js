const API_URL = "http://localhost:3000";

/**
 * Cliente principal da API Lumos Connect
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("lumos_token");

    const headers = {
        ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),

        ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),

        ...(options.headers || {})
    };

    let response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
    } catch (error) {
        console.error("Erro de conexão com a API:", error);

        throw new Error(
            "Não foi possível conectar ao servidor da Lumos Connect."
        );
    }

    let data = null;

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    /**
     * Token inválido ou expirado
     */
    if (response.status === 401) {
        localStorage.removeItem("lumos_token");
        localStorage.removeItem("lumos_user");

        window.location.href =
            "/front-end-backup-utf8/pages/login/login.html";

        return null;
    }

    /**
     * Erros da API
     */
    if (!response.ok) {
        const message =
            typeof data === "object"
                ? data.message || data.error
                : data;

        throw new Error(
            message || `Erro HTTP ${response.status}`
        );
    }

    return data;
}


/* =========================================================
   AUTH
========================================================= */

async function login(email, password) {
    return await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
}


async function register(name, email, password) {
    return await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            password
        })
    });
}


async function getCurrentUser() {
    return await apiRequest("/auth/me", {
        method: "GET"
    });
}


/* =========================================================
   PROFILE
========================================================= */

async function getProfile() {
    return await apiRequest("/profile", {
        method: "GET"
    });
}


/* =========================================================
   ACTIVITIES
========================================================= */

async function getActivities() {
    return await apiRequest("/activities", {
        method: "GET"
    });
}


async function createActivity(activity) {
    return await apiRequest("/activities", {
        method: "POST",
        body: JSON.stringify(activity)
    });
}


async function updateActivity(id, activity) {
    return await apiRequest(`/activities/${id}`, {
        method: "PUT",
        body: JSON.stringify(activity)
    });
}


async function deleteActivity(id) {
    return await apiRequest(`/activities/${id}`, {
        method: "DELETE"
    });
}


async function completeActivity(id) {
    return await apiRequest(`/activities/${id}/complete`, {
        method: "PATCH"
    });
}


/* =========================================================
   ACTIVITY PROGRESS
========================================================= */

async function getActivityProgress(activityId) {
    return await apiRequest(
        `/activities/${activityId}/progress`,
        {
            method: "GET"
        }
    );
}


/* =========================================================
   AGENDA
========================================================= */

async function getAgenda() {
    return await apiRequest("/agenda", {
        method: "GET"
    });
}


async function createAgendaEvent(event) {
    return await apiRequest("/agenda", {
        method: "POST",
        body: JSON.stringify(event)
    });
}


async function updateAgendaEvent(id, event) {
    return await apiRequest(`/agenda/${id}`, {
        method: "PUT",
        body: JSON.stringify(event)
    });
}


async function deleteAgendaEvent(id) {
    return await apiRequest(`/agenda/${id}`, {
        method: "DELETE"
    });
}


/* =========================================================
   STUDY SESSIONS
========================================================= */

async function getStudySessions() {
    return await apiRequest("/study-sessions", {
        method: "GET"
    });
}


async function createStudySession(session) {
    return await apiRequest("/study-sessions", {
        method: "POST",
        body: JSON.stringify(session)
    });
}


async function updateStudySession(id, session) {
    return await apiRequest(`/study-sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify(session)
    });
}


async function deleteStudySession(id) {
    return await apiRequest(`/study-sessions/${id}`, {
        method: "DELETE"
    });
}


/* =========================================================
   PROGRESS
========================================================= */

async function getProgress() {
    return await apiRequest("/progress", {
        method: "GET"
    });
}


/* =========================================================
   UTILITÁRIOS DE AUTENTICAÇÃO
========================================================= */

function saveAuth(token, user = null) {
    if (token) {
        localStorage.setItem("lumos_token", token);
    }

    if (user) {
        localStorage.setItem(
            "lumos_user",
            JSON.stringify(user)
        );
    }
}


function getToken() {
    return localStorage.getItem("lumos_token");
}


function getStoredUser() {
    const user = localStorage.getItem("lumos_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}


function isAuthenticated() {
    return !!getToken();
}


function logout() {
    localStorage.removeItem("lumos_token");
    localStorage.removeItem("lumos_user");

    window.location.href =
        "/front-end-backup-utf8/pages/login/login.html";
}