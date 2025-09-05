document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.querySelector('input[type="file"]');
  const previewContainer = document.createElement("div");
  const form = document.querySelector("form");
  const resultContainer = document.createElement("div");
  resultContainer.id = "result-container";
  resultContainer.style.marginTop = "20px";
  form.appendChild(resultContainer);

  if (fileInput && form) {
    // ✅ Image Preview
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          previewContainer.innerHTML = `
            <img src="${event.target.result}" alt="Preview" class="img-fluid mt-3" style="max-width:400px; border-radius:10px;">
          `;
          if (!form.contains(previewContainer)) {
            form.appendChild(previewContainer);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // ✅ Form Submit Handler
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      resultContainer.innerHTML = "🔍 Analyzing... Please wait.";

      const formData = new FormData();
      if (fileInput.files.length === 0) {
        resultContainer.innerHTML = "<p style='color:red;'>⚠️ Please select an image file.</p>";
        return;
      }
      formData.append("image", fileInput.files[0]);

      try {
        const response = await fetch("/breed/analyze", {
          method: "POST",
          body: formData,
        });

        const text = await response.text(); // read raw text (works for JSON & error)
        console.log("🔎 Raw response from server:", text);

        let data;
        try {
          data = JSON.parse(text); // try parsing JSON
        } catch (err) {
          resultContainer.innerHTML = `<p style='color:red;'>⚠️ Invalid JSON from server: ${text}</p>`;
          return;
        }

        if (response.ok) {
          resultContainer.innerHTML = `
            <h4>🐄 Breed: ${data.breed}</h4>
            <p>Confidence: ${data.confidence}</p>
            <img src="${data.filePath}" alt="Breed Image" style="max-width:400px; border-radius:10px;">
            <p>${data.message}</p>
          `;
        } else {
          resultContainer.innerHTML = `<p style='color:red;'>⚠️ Error: ${data.error || text}</p>`;
        }
      } catch (error) {
        resultContainer.innerHTML = `<p style='color:red;'>❌ Request failed: ${error.message}</p>`;
      }
    });
  }
});
