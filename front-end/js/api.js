const API_URL = "http://localhost:3000";

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("lumos_token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem("lumos_token");
            localStorage.removeItem("lumos_user");

            window.location.href =
                "/front-end/pages/login/login.html";

            return;
        }

        throw new Error(
            data.message || "Erro na requisição"
        );
    }

    return data;
}