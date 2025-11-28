// Your backend URL:
const API_URL = "http://127.0.0.1:8000";

async function uploadImage() {
    let file = document.getElementById("imageInput").files[0];
    if (!file) {
        alert("Please select an image!");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    let response = await fetch(`${API_URL}/upload-image`, {
        method: "POST",
        body: formData
    });

    let result = await response.json();
    document.getElementById("imageResult").innerText =
        "AI Detected: " + result.prediction;
}

async function askQuestion() {
    let question = document.getElementById("questionInput").value;

    let response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question })
    });

    let result = await response.json();
    document.getElementById("answerResult").innerText =
        "AI Answer: " + result.answer;
}

async function getRecyclingCenters() {
    let response = await fetch(`${API_URL}/recycle-centers`);
    let result = await response.json();

    let html = "<ul>";
    result.centers.forEach(center => {
        html += `<li><b>${center.name}</b><br>${center.address}</li>`;
    });
    html += "</ul>";

    document.getElementById("locationResult").innerHTML = html;
}
