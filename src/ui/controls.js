export function initializeControls() {
    const slider = document.getElementById("myRange");
    const audio = document.createElement("AUDIO");

    const base = import.meta.env.BASE_URL;


    audio.src = `${base}assets/Sounds/mixkit-cow-barn-ambience-1754.wav`;

    const state = {
        sliderValue: Number(slider.value),
        cow1Pos: {x: 0, y: -3, z: -6},
    };

    slider.addEventListener("input", () => {
        state.sliderValue = Number(slider.value);
    });

    window.addEventListener("keydown", (event) => {
        switch(event.code){
            case "ArrowLeft":
                if(state.cow1Pos.x > -4.5){
                    state.cow1Pos.x -= 0.5;
                }
                break;
            case "ArrowUp":
                if(state.cow1Pos.z > -11.5){
                    state.cow1Pos.z -= 0.5;
                }
                break;
            case "ArrowRight":
                if(state.cow1Pos.x < 4.5){
                    state.cow1Pos.x += 0.5;
                }
                break;
            case "ArrowDown":
                if(state.cow1Pos.z < 0){
                    state.cow1Pos.z += 0.5;
                }
                break;
            case "Space":
                if(audio.paused == false){
                    audio.pause();
                    audio.load();
                } else {
                    audio.play();
                }
        }
    });

    
    return state;
}