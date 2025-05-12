const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn")
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

// API key for Hugging Face
const API_KEY = "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"

const examplePrompts = [
"A magic forest with glowing plants and fairy homes among giant mushrooms",
"An old steampunk airship floating through golden clouds at sunset",
"A future Mars colony with glass domes and gardens against red mountains",
"A dragon sleeping on gold coins in a crystal cave",
"An underwater kingdom with merpeople and glowing coral buildings",
"A floating island with waterfalls pouring into clouds below",
"A witch's cottage in fall with magic herbs in the garden",
"A robot painting in a sunny studio with art supplies around it",
"A magical library with floating glowing books and spiral staircases",
"A Japanese shrine during cherry blossom season with lanterns and misty mountains"
];

(() =>{
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefer-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon"
})();

// Switch between light and dark themes
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// calculate width/height based on chosen aspect ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
const [width, height] = aspectRatio.split("/").map(Number);
const scaleFactor = baseSize / Math.sqrt(width * height) ;


let calculatedWidth = Math.round(width * scaleFactor);
let calculatedHeight = Math.round (height*scaleFactor);

// Ensure dimensions are multiples of 16(AI model requirements)
calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
calculatedHeight = Math. floor(calculatedHeight / 16) * 16;


return { width: calculatedWidth, height:calculatedHeight };
};

// Replace loading sppiner with the actual image
const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if (!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = ` <img src="${imgUrl}" class="result-img" />
                       <div class="img-overlay"> 
                          <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                           <i class="fa-solid fa-download"></i>
                         </a>
                      </div>`;
}


const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", true);

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: promptText,
          width,
          height
        })
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent = "Generation failed!";
    }
  });

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};


// Create placeholder cards with loading spinner
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
gridGallery.innerHTML = ""; 

    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `
        <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ aspectRatio}">
                        <div class="status-container">
                            <div class="spinner">
                                <p class="status-text">Generating...</p>
                            </div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                    </div>`
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Handle form submission
const handleFormSubmit = (event) => {
    event.preventDefault();
    // Get values from the form
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    createImageCards(selectedModel, imageCount, aspectRatio, promptText);
}

// Fill prompt input with random example
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
})
promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);

