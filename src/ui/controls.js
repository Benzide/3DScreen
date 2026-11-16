export function initializeControls() {
    const slider = document.getElementById("myRange");
    const projectionButton = document.getElementById("projectionButton");
    const hideButton = document.getElementById("hideButton");
    const elementContainer = document.getElementById("elementContainer");
    const urlInput = document.getElementById("urlInput");
    const playButton = document.getElementById("playButton");
    const pictureButton = document.getElementById("pictureButton");

    const state = {
        sliderValue: Number(slider.value),
        selectedWall: "middle",
        projected: true,
        hidden: false,
        resizeValue: { x: 0.6, y: 0.3 }
    };

    slider.addEventListener("input", () => {
        state.sliderValue = Number(slider.value);
    });

    projectionButton.addEventListener("click", () => {
        state.projected = !state.projected;
    });

    hideButton.addEventListener("click",  () => {
        if(state.hidden){
            elementContainer.style.display = "none";
        } else {
            elementContainer.style.display = "flex";        
        }
        state.hidden = !state.hidden;
    });

    document.body.addEventListener("keydown", (event) => {
        switch(event.code){
            case "ArrowLeft":
                if(state.selectedWall == "right"){
                    state.selectedWall = "middle";
                } else {
                    state.selectedWall = "left";
                }
                break;
            case "ArrowUp":
                if(state.selectedWall == "bottom"){
                    state.selectedWall = "middle";
                } else {
                    state.selectedWall = "top";
                }
                break;
            case "ArrowRight":
                if(state.selectedWall == "left"){
                    state.selectedWall = "middle";
                } else {
                    state.selectedWall = "right";
                }
                break;
            case "ArrowDown":
                if(state.selectedWall == "top"){
                    state.selectedWall = "middle";
                } else {
                    state.selectedWall = "bottom";
                }
                break;
        }
    });

    playButton.addEventListener("click", () => {
        const url = urlInput.value.trim();

        if (!url) {
            alert("Please enter a URL!");
            return;
        }

        let videoId;

        // Hämta YouTube-video-ID från olika URL-format
        try {
            const parsedUrl = new URL(url);

            if (parsedUrl.hostname.includes("youtu.be")) {
                videoId = parsedUrl.pathname.slice(1);
            } else if (parsedUrl.hostname.includes("youtube.com")) {
                videoId = parsedUrl.searchParams.get("v");

                if (!videoId && parsedUrl.pathname.startsWith("/embed/")) {
                    videoId = parsedUrl.pathname.split("/")[2];
                }
            }
        } catch {
            alert("Invalid URL!");
            return;
        }

        if (!videoId) {
            alert("Please enter a valid YouTube URL!");
            return;
        }

        const iframe = document.createElement("iframe");

        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
        iframe.allow = "autoplay; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;

        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        elementContainer.innerHTML = "";
        elementContainer.style.width = "420px";
        elementContainer.style.height = "345px";
        state.resizeValue.x = 1.0;
        state.resizeValue.y = 1.0;
        elementContainer.appendChild(iframe);
    });

    pictureButton.addEventListener("click", () => {
        const url = urlInput.value.trim();

        if (!url) {
            alert("Please enter a URL!");
            return;
        }
        const image = document.createElement("img")
        image.src = url;
        image.allowFullscreen = true;

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.border = "none";

        elementContainer.innerHTML = "";
        elementContainer.style.width = "420px";
        elementContainer.style.height = "345px";
        state.resizeValue.x = 1.0;
        state.resizeValue.y = 1.0;
        elementContainer.appendChild(image);
    });

    
    return state;
}