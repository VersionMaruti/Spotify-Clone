let songs;
let currfolder
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder=folder
    let a = await fetch(`/Video%2084/${folder}/`)
    let response = await a.text();
    let htmlContent = response
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    // console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (let index = 0; index < songs.length; index++) {
        songUL.innerHTML = songUL.innerHTML + 
        `
        <li class="BORDER">
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${songs[index].replaceAll("%20"," ")}</div> 
                                <div>Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <div><img src="img/play.svg" alt=""></div>
                            </div>
                        </li>
        `
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e =>{
        e.addEventListener("click", element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            PlayMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
let currentSong = new Audio();
const PlayMusic = (track,pause=false)=>{
    currentSong.src = `/Video%2084/${currfolder}/` + track;
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    // console.log(currentSong.currentTime)
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = `00:00/00:00`  
}

async function displayAlbums(){
    let a = await fetch(`/Video%2084/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if(e.href.includes("/songs/")){//**/
             let folder = e.href.split("/").slice(-1)[0]
             let a = await fetch(`/Video%2084/songs/${folder}/info.json`)
             let response = await a.json();
            //  console.log(response)
             let cardContainer = document.querySelector(".card-container")
             cardContainer.innerHTML += `<div data-folder=${folder} class="card">
             <div class="playbar">
                 <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"
                     width="40" height="40">
                     <circle cx="12" cy="12" r="12" fill="#4CAF50" />
                     <path d="M9,7.355V16.645L15,12Z" fill="black" />
                 </svg>
             </div>
             <img src=songs/${folder}/cover.jpg alt="">
             <h3>${response.title}</h3>
             <p>${response.description}</p>
         </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            PlayMusic(songs[0])
        });
    });
    
}
async function main() {
    // await getSongs("songs/ncs");
    // PlayMusic(songs[0],true)
    // console.log(songs)
    
    displayAlbums()
    
    return songs
}
play.addEventListener("click",()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    else{
        currentSong.pause()
        play.src = "img/play.svg"
    }
})
currentSong.addEventListener("timeupdate",()=>{
    // console.log(currentSong.currentTime,currentSong.duration)
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} 
    /${secondsToMinutesSeconds(currentSong.duration)}`
    let percent = (currentSong.currentTime/currentSong.duration)*100 
    document.querySelector(".circle").style.left = percent + "%";
})

document.querySelector(".seekbar").addEventListener("click",(e)=>{
    // document.querySelector(".circle").style.left = (e.offsetX/e.target.getBoundingClientRect().width)*100 + "%"
    // Calculate the percentage of the clicked position relative to the width of the seek bar
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    // Set the currentTime of the audio element based on the percentage
    let newTime = (percent / 100) * currentSong.duration;
    currentSong.currentTime = newTime;

    // Update the position of the circle indicator
    document.querySelector(".circle").style.left = percent + "%";
})

document.querySelector(".hamburger").addEventListener("click", function() {
    const leftMenu = document.querySelector(".left");
    leftMenu.classList.toggle('show-menu');
});

document.querySelector(".back").addEventListener("click", function() {
    const leftMenu = document.querySelector(".left");
    leftMenu.classList.remove('show-menu');
});

previous.addEventListener("click",()=>{
    // console.log(currentSong.src.split("/").splice(-1)[0])
    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
    // console.log(index)
    if((index-1)>=0){
        PlayMusic(songs[index-1])
    }
})
next.addEventListener("click",()=>{
    // console.log(currentSong.src.split("/").splice(-1)[0])
    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
    // console.log(index)
    if((index+1) < songs.length){
        PlayMusic(songs[index+1])
    }
})

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    // console.log("Setting volume to", e.target.value, "/ 100")
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
    }
})

document.querySelector(".range").getElementsByTagName("img")[0].addEventListener("click",(e)=>{
    if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})



main()

