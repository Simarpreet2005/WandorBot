document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const voiceButton = document.getElementById("voiceButton");
    const themeToggle = document.getElementById("themeToggle");
    const chatList = document.getElementById("chatList");

    // Theme Toggle
    const savedTheme = localStorage.getItem("theme") || "dark-theme";
    document.body.className = savedTheme;
    themeToggle.querySelector(".material-icons").textContent = savedTheme === "dark-theme" ? "brightness_6" : "brightness_4";

    themeToggle.addEventListener("click", () => {
        const newTheme = document.body.className === "dark-theme" ? "light-theme" : "dark-theme";
        document.body.className = newTheme;
        localStorage.setItem("theme", newTheme);
        themeToggle.querySelector(".material-icons").textContent = newTheme === "dark-theme" ? "brightness_6" : "brightness_4";
    });

    // Chat Functions
    function addMessage(content, isUser) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isUser ? "user" : "bot"}`;
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        messageContent.textContent = content;
        messageDiv.appendChild(messageContent);
        chatList.appendChild(messageDiv);
        chatList.scrollTop = chatList.scrollHeight;
    }

    async function sendMessage(message) {
        if (!message) return;

        addMessage(message, true);
        userInput.value = "";

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();

            if (data.error) {
                addMessage("Error: " + data.error, false);
            } else {
                addMessage(data.response, false);
            }
        } catch (error) {
            addMessage("Error: Failed to connect to the server.", false);
        }
    }

    sendButton.addEventListener("click", () => sendMessage(userInput.value.trim()));
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage(userInput.value.trim());
    });

    // Voice Assistance
    if ("webkitSpeechRecognition" in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        voiceButton.addEventListener("click", () => {
            recognition.start();
            voiceButton.querySelector(".material-icons").textContent = "mic_none";
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            voiceButton.querySelector(".material-icons").textContent = "mic";
            sendMessage(transcript);
        };

        recognition.onend = () => {
            voiceButton.querySelector(".material-icons").textContent = "mic";
        };

        recognition.onerror = (event) => {
            addMessage("Voice input error: " + event.error, false);
            voiceButton.querySelector(".material-icons").textContent = "mic";
        };
    } else {
        voiceButton.style.display = "none";
        addMessage("Voice input is not supported in this browser.", false);
    }
});