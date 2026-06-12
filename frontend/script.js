document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.getElementById("menuButton");
    const closeBtn = document.getElementById("closeBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const codeInput = document.getElementById("codeInput");
    const lineNumbers = document.getElementById("lineNumbers");
    const debugButton = document.getElementById("debugButton");
    const btnText = debugButton.querySelector(".btn-text");
    const btnLoader = document.getElementById("btnLoader");
    const errorOutput = document.getElementById("errorOutput");
    const fixOutput = document.getElementById("fixOutput");
    const copyBtn = document.getElementById("copyBtn");
    const langBtns = document.querySelectorAll(".lang-btn");

    let selectedLanguage = "Python";

    function openSidebar() {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    }

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }

    menuButton.addEventListener("click", openSidebar);
    closeBtn.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);

    langBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            langBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            selectedLanguage = this.dataset.lang;
        });
    });

    function updateLineNumbers() {
        const lines = codeInput.value.split("\n").length;
        lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
    }

    codeInput.addEventListener("input", updateLineNumbers);
    codeInput.addEventListener("scroll", function () {
        lineNumbers.scrollTop = this.scrollTop;
    });

    updateLineNumbers();

    function setLoading(state) {
        debugButton.disabled = state;
        btnText.textContent = state ? "ANALYZING..." : "RUN DEBUGGER";
        btnLoader.classList.toggle("visible", state);
    }

    debugButton.addEventListener("click", async function () {
        const code = codeInput.value.trim();

        if (!code) {
            errorOutput.value = "No code provided. Paste your code first.";
            fixOutput.value = "";
            return;
        }

        setLoading(true);
        errorOutput.value = "";
        fixOutput.value = "";

        try {
            const response = await fetch("https://amiable-kindness-production-9620.up.railway.app/debug", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: selectedLanguage })
            });

            if (!response.ok) {
                const err = await response.json();
                errorOutput.value = err.error || "Server error.";
                fixOutput.value = "";
                return;
            }

            const result = await response.json();
            errorOutput.value = result.errors || "No errors detected.";
            fixOutput.value = result.suggested_fix || "No fix needed.";
        } catch (err) {
            errorOutput.value = "Cannot connect to server. Please try again later.";
            fixOutput.value = "";
        } finally {
            setLoading(false);
        }
    });

    copyBtn.addEventListener("click", function () {
        const text = fixOutput.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = "COPIED ✓";
            setTimeout(() => { copyBtn.textContent = "COPY FIX"; }, 2000);
        });
    });
});