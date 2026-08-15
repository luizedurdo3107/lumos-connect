(function () {
    const token = localStorage.getItem("lumos_token");

    if (!token) {
        window.location.href = "/front-end/pages/login/login.html";
    }
})();