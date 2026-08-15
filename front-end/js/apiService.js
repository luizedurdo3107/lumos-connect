const api = {

    // ==============================
    // AUTENTICAÇÃO
    // ==============================

    login(email, password) {
        return apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });
    },

    register(name, email, password) {
        return apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password
            })
        });
    },

    me() {
        return apiRequest("/auth/me");
    },


    // ==============================
    // PERFIL
    // ==============================

    profile() {
        return apiRequest("/profile");
    },

    updateProfile(data) {
        return apiRequest("/profile", {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    changePassword(currentPassword, newPassword) {
        return apiRequest("/profile/password", {
            method: "PUT",
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
    },


    // ==============================
    // ATIVIDADES
    // ==============================

    activities() {
        return apiRequest("/activities");
    },

    activity(id) {
        return apiRequest(`/activities/${id}`);
    },

    activityContent(id) {
        return apiRequest(`/activities/${id}/content`);
    },

    activityProgress(id) {
        return apiRequest(`/activities/${id}/progress`);
    },

    completeActivity(id) {
        return apiRequest(`/activities/${id}/complete`, {
            method: "PATCH"
        });
    },


    // ==============================
    // AGENDA
    // ==============================

    agenda() {
        return apiRequest("/agenda");
    },

    createAgenda(data) {
        return apiRequest("/agenda", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    updateAgenda(id, data) {
        return apiRequest(`/agenda/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    deleteAgenda(id) {
        return apiRequest(`/agenda/${id}`, {
            method: "DELETE"
        });
    },


    // ==============================
    // SESSÕES DE ESTUDO
    // ==============================

    studySessions() {
        return apiRequest("/study-sessions");
    },

    createStudySession(data) {
        return apiRequest("/study-sessions", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    updateStudySession(id, data) {
        return apiRequest(`/study-sessions/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    deleteStudySession(id) {
        return apiRequest(`/study-sessions/${id}`, {
            method: "DELETE"
        });
    },


    // ==============================
    // PROGRESSO
    // ==============================

    progress() {
        return apiRequest("/progress");
    },


    // ==============================
    // DASHBOARD
    // ==============================

    dashboard() {
        return apiRequest("/dashboard");
    },


    // ==============================
    // USUÁRIO
    // ==============================

    user() {
        return apiRequest("/users/me");
    }
};