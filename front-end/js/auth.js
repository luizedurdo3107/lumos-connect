async function login(email, password) {
    const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });

    localStorage.setItem("lumos_token", data.token);

    if (data.user) {
        localStorage.setItem(
            "lumos_user",
            JSON.stringify(data.user)
        );
    }

    return data;
}

function getToken() {
    return localStorage.getItem("lumos_token");
}

function getUser() {
    const user = localStorage.getItem("lumos_user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

function isAuthenticated() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem("lumos_token");
    localStorage.removeItem("lumos_user");

    window.location.href =
        "/front-end/pages/login/login.html";
}