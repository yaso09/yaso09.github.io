const API_URL = "https://api.openai.com/v1/engines/text-davinci-003/completions";
const API_KEY = "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";

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");
const reportBtn = document.getElementById("reportBtn");

let controller = null; // Store the AbortController instance

reportBtn.hidden = true;
stopBtn.hidden = true;

const generate = async () => {
  // Alert the user if no prompt value
  if (!promptInput.value) {
    alert("Lütfen bir metin girin.");
    return;
  }
  
  // Disable the generate button and enable the stop button
  reportBtn.hidden = true;
  generateBtn.disabled = true;
  stopBtn.disabled = false;
  resultText.innerText = "Bekleyiniz...";
  stopBtn.hidden = false;

  // Create a new AbortController instance
  controller = new AbortController();
  const signal = controller.signal;

  try {
    // Fetch the response from the OpenAI API with the signal from AbortController
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptInput.value }],
        max_tokens: 100,
        stream: true, // For streaming responses
      }),
      signal, // Pass the signal to the fetch request
    });

    // Read the response as a stream of data
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    resultText.innerText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Massage and parse the chunk of data
      const chunk = decoder.decode(value);
      const lines = chunk.split("\\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => JSON.parse(line)); // Parse the JSON string

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;
        // Update the UI with the new content
        if (content) {
          resultText.innerText += content;
        }
      }
    }
  } catch (error) {
    // Handle fetch request errors
    if (signal.aborted) {
      resultText.innerText = "İstek iptal edildi.";
      stopBtn.hidden = true;
    } else {
      console.error("Error:", error);
      resultText.innerText = "Cevaplanırken bir sorun oluştu.";
      reportBtn.hidden = false;
      stopBtn.hidden = true;
    }
  } finally {
    // Enable the generate button and disable the stop button
    generateBtn.disabled = false;
    stopBtn.disabled = true;
    controller = null; // Reset the AbortController instance
  }
};

const stop = () => {
  // Abort the fetch request by calling abort() on the AbortController instance
  if (controller) {
    controller.abort();
    controller = null;
  }
};

promptInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    generate();
  }
});
generateBtn.addEventListener("click", generate);
stopBtn.addEventListener("click", stop);
