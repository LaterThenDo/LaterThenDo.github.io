//function to pick random number from a min-max range
function RandomRange(min,max){
    return Math.round(Math.random()*(max-min)+min);
}

// Runs functions when all the content is loaded:
document.addEventListener("DOMContentLoaded", function() {
    // Initialise the reset button:
    initResetBtn();

	// Initialise the technique slider:
	initTechniqueSlider();

	// Initialise the menu:
	initMenu();

    // Initialise interactive sections:
    initInteractiveSections();

    // Initialise the cards:
    initCards();
	
    // Initialise the game:
    initGame();

    // initialise the full screen:
    initFullScreen();
});

// Menu bar:
const menu = document.querySelector(".menu");
const pages = document.querySelectorAll(".page");

function initMenu() {
    menu.addEventListener("click", function(evt) {
        const btn = evt.target;

        if (btn.getAttribute("href")) {
            evt.preventDefault(); 

            // Hide all pages
            pages.forEach(function(page) {
                page.classList.add("hidden");
            });

            // Show the target page
            const targetPage = document.querySelector(btn.getAttribute("href"));
            targetPage.classList.remove("hidden");
        }
    });
}


// Technique Slider:
const techniques = document.querySelectorAll(".technique");
let isMovingNext = false;
let techniqueIndex = 0;
let techniqueIntervalId = null;

let onCooldown = false;

const prevBtn = document.querySelector("#previousBtn");
const nextBtn = document.querySelector("#nextBtn");

function initTechniqueSlider(){
    techniqueIntervalId = setInterval(nextTechnique, 5000);
    prevBtn.addEventListener("click", prevTechnique);
    nextBtn.addEventListener("click", nextTechnique);
}

function showTechnique() { 
    if (techniqueIndex >= techniques.length) {
        techniqueIndex = 0;
    }
    else if (techniqueIndex < 0) {
        techniqueIndex = techniques.length - 1;
    }

    let prevIndex = techniqueIndex - 1;
    if (prevIndex < 0) {
        prevIndex = techniques.length - 1;
    }

    let nextIndex = techniqueIndex + 1;
    if (nextIndex >= techniques.length) {
        nextIndex = 0;
    }

    techniques.forEach(function(technique){
        technique.classList.remove("moveLeftToCenter", "moveCenterToRight", "moveCenterToLeft", "moveRightToCenter");
        void technique.offsetWidth; // Makes sure that the classes are removed (required for the animation)
    });

    if (isMovingNext) {
        techniques[techniqueIndex].classList.add("moveRightToCenter");
        techniques[prevIndex].classList.add("moveCenterToLeft");
    } 
    else {
        techniques[techniqueIndex].classList.add("moveLeftToCenter");
        techniques[nextIndex].classList.add("moveCenterToRight");
    }

    isMovingNext = false;

    if (techniqueIntervalId) {
        clearInterval(techniqueIntervalId);
    }
    
    techniqueIntervalId = setInterval(nextTechnique, 5000);
}

function onTechniqueCooldownEnded(){
    onCooldown = false;
}

function prevTechnique(){
    if (onCooldown) return;

    onCooldown = true;
    setTimeout(onTechniqueCooldownEnded, 1000);

    techniqueIndex--;
    showTechnique(techniqueIndex);
}

function nextTechnique(){
    if (onCooldown) return;

    onCooldown = true;
    setTimeout(onTechniqueCooldownEnded, 1000);

    isMovingNext = true;
    techniqueIndex++;
    showTechnique(techniqueIndex);
}

// Handle the quiz:
const btnSubmit = document.querySelector("#btnSubmit");
btnSubmit.addEventListener("click",CheckAns);

const scorebox = document.querySelector("#scorebox");
var quizScore = 0;

let answers = [
    "Osoto Gari",
    "Ippon Seoi Nage",
    "Harai Goshi",
    "Ouchi Gari"
];

function CheckAns(){
    quizScore = 0; //reset score to 0, check ans and give score if correct
    //read the value of the selected radio button for the questions
    for (let i = 0; i < answers.length; i++){
        let q = document.querySelector("input[name='q" + (i+1) + "']:checked").value;
        if (q == answers[i]){
            quizScore++;
        }
    }

    scorebox.innerHTML="Score:"+quizScore;
}


// Handle the show / hide of contents
const interactiveSectionBtns = document.querySelectorAll(".interactive-section button");

function initInteractiveSections(){
    interactiveSectionBtns.forEach(function(btn){
        btn.addEventListener("click", function(){
            const section = btn.parentElement;
            const content = section.querySelector(".interactive-target");
            content.classList.toggle("hidden");
        });
    });
}


// Handle the cards:
const cards =  document.querySelectorAll(".card");

function initCards(){
    cards.forEach(function(card){
        card.addEventListener("click", function() {
            if (card.classList.contains("card-flipped")){
                card.classList.remove("card-flipped");
            } 
            else {
                card.classList.add("card-flipped");
            }
            
        });
    });
}



// Handle the game:
const startBtn = document.getElementById("game-start-btn");
const startMenu = document.getElementById("game-start-menu");
const ongoingGame = document.getElementById("ongoing-game");
const gameStatus = document.getElementById("game-status");

const opponentEntry = document.getElementById("opponent-entry");
const opponentWin = document.getElementById("opponent-win");
const playerCounter = document.getElementById("player-counter");
const playerWin = document.getElementById("player-win");
const opponentCounter = document.getElementById("opponent-counter");

const roundOptions = document.getElementById("round-options");
const fightBtn = document.getElementById("fight-btn");
const counterBtn = document.getElementById("counter-btn");

const reactionTest = document.getElementById("reaction-test");
const counterTest = document.getElementById("counter-test");
const counterLine = document.getElementById("counter-line");
const counterRange = document.getElementById("counter-range");
const aimTrainer = document.getElementById("aim-trainer");
const aimTarget = document.getElementById("aim-trainer-target");
const aimWindow = document.getElementById("aim-trainer-window");
const aimTimeLeft = document.getElementById("aim-time-left");
const aimAccuracy = document.getElementById("aim-accuracy");

const playAgainContainer = document.getElementById("play-again-container");
const playAgain = document.getElementById("play-again");

// game audio
const winSFX = new Audio("audio/win.wav");
const loseSFX = new Audio("audio/lose.wav");
const pointSFX = new Audio("audio/point.wav");


let playerMove; // the player chooses to fight (1), counter (2)

// Reaction test:
let reactionTimeoutId;
let reactionStartTime; // Used for attacking (reaction time tester)

// Timing test:
let lineX = 0;
let lineSpeed = 3;
let range;
let lineIntId;

// Accuracy test:
let aimTimer = 0;
let totalClicks = 0;
let accurateClicks = 0;

// used to determine who wins:
let playerScore = 0;
let opponentScore = 0;

function initGame(){
    // Start Button:
    startBtn.addEventListener("click", function() {
        if (!startMenu.classList.contains("hidden")){
            startMenu.classList.add("hidden");
        }

        if (ongoingGame.classList.contains("hidden")){
            ongoingGame.classList.remove("hidden");
        }

        initRound();
    });

    // Choices / Options to Fight or to Counter:
    fightBtn.addEventListener("click", function(){
        playerMove = 1;
        onPlayerChoice();
    });

    counterBtn.addEventListener("click", function(){
        playerMove = 2;
        onPlayerChoice();
    });


    // The button to test reaction time:
    reactionTest.addEventListener("click", function(){
        if (!reactionTimeoutId) return;
        clearTimeout(reactionTimeoutId);
        reactionTimeoutId = null;
        reactionTest.style.backgroundColor = "blue";

        if (reactionStartTime){
            opponentScore = Date.now() - reactionStartTime;

            // Set player score to be a random number between 300 to 800 since 
            // reaction time winner has a smaller number
            playerScore = RandomRange(300, 800); 

            reactionTest.innerText = opponentScore + "ms";
        } 
        else {
            opponentScore = 100;
            playerScore = 0;
            reactionTest.innerText = "Too early!";
        }
        
        runResult();
    });

    //  The button to test timing for counter:
    counterTest.addEventListener("click", function(){
        if (!lineIntId) return;

        playerScore = 0;
        opponentScore = 10;

        let lineMax = lineX + counterLine.offsetWidth;
        let rangeMax = range + counterRange.offsetWidth;

        if (lineMax > range && lineX < rangeMax){
            // line is on range
            playerScore = 100;
        }
        
        clearInterval(lineIntId);
        lineIntId = null;
        

        runResult();
    });

    // Aim trainer / Accuracy tester:
    aimTarget.addEventListener("click", function(){
        if (aimTrainer.classList.contains("hidden")) return;
        if (aimTimer <= 0) return;
        accurateClicks++;

        let randX = RandomRange(0, aimWindow.offsetWidth - aimTarget.offsetWidth);
        let randY = RandomRange(0, aimWindow.offsetHeight - aimTarget.offsetHeight);
        aimTarget.style.left = randX + "px";
        aimTarget.style.top = randY + "px";

        aimAccuracy.innerText = "Accuracy: " + Math.round(accurateClicks / totalClicks * 100) + "% (>75%)";
    });

    aimTrainer.addEventListener("click", function(){
        if (aimTrainer.classList.contains("hidden")) return;
        if (aimTimer <= 0) return;
        pointSFX.play();
        totalClicks++;
        aimAccuracy.innerText = "Accuracy: " + Math.round(accurateClicks / totalClicks * 100) + "% (>75%)";
    });


    playAgain.addEventListener("click", function(){
        if (playAgainContainer.classList.contains("hidden")) return;
        playAgainContainer.classList.add("hidden");
        initRound();
    });
}

// Initialise a round of the game:
function initRound(){
    // Hide / Reset the tests:
    reactionTest.style.backgroundColor = "";
    reactionTest.innerText = "Wait for green...";

    if (!reactionTest.classList.contains("hidden")){
        reactionTest.classList.add("hidden");
    }

    if (!counterTest.classList.contains("hidden")){
        counterTest.classList.add("hidden");
    }

    if (!aimTrainer.classList.contains("hidden")){
        aimTrainer.classList.add("hidden");
    }

    changeImage();

    gameStatus.innerText = "Choose your next move";

    if (roundOptions.classList.contains("hidden")){
        roundOptions.classList.remove("hidden");
    }
}

// This function changes the image in the game
function changeImage(number){
    opponentEntry.classList.add("hidden");
    opponentWin.classList.add("hidden");
    playerCounter.classList.add("hidden");
    playerWin.classList.add("hidden");
    opponentCounter.classList.add("hidden");

    if (number == 1){
        opponentEntry.classList.remove("hidden");
    } else if (number == 2){
        opponentWin.classList.remove("hidden");
    } else if (number == 3){
        playerCounter.classList.remove("hidden");
    } else if (number == 4){
        playerWin.classList.remove("hidden");
    } else if (number == 5){
        opponentCounter.classList.remove("hidden");
    }
}

// This function runs when the player chooses to fight or to counter:
function onPlayerChoice(){
    if (!playerMove){
        return;
    }

    // Disable the options:
    if (!roundOptions.classList.contains("hidden")){
        roundOptions.classList.add("hidden");
        console.log("options screen disabled");
    }

    let opponentMove = RandomRange(1, 2);
    if (opponentMove == 1){
        gameStatus.innerText = "Your opponent enters for Ippon Seoi Nage!";
        changeImage(1);
    } else{
        gameStatus.innerText = "You are being countered!";
        changeImage(5);
    }
    
    let FvF = playerMove == 1 && opponentMove == 1; // Fight vs Fight
    let FvC = playerMove == 1 && opponentMove == 2; // Fight vs Counter
    let CvF = playerMove == 2 && opponentMove == 1; // Counter vs Fight

    if (FvF){
        // Reaction time test:
        runReactionTest();
    } 
    else if (FvC) {
        // Accuracy test:
        runAimTrainer();
    } 
    else {
        if (CvF){
            gameStatus.innerText = "You are countering your opponent!";
            changeImage(3);
        }

        // Timing test:
        runCounterTest();
    }    
}

// This function runs when both the player and the opponent chooses to fight:
function runReactionTest(){
    // Set reaction test visible:
    if (reactionTest.classList.contains("hidden")){
        reactionTest.classList.remove("hidden");
    }

    // Get a random time from 3s to 5s
    let randomTime = RandomRange(3, 5);

    reactionTimeoutId = setTimeout(function(){
        reactionTest.style.backgroundColor = "green";
        reactionTest.innerText = "Click!";
        reactionStartTime = Date.now();
    }, randomTime * 1000);
}

// Update aim trainer's timer
function updateAimTimeout(){
    aimTimer--;
    aimTimeLeft.innerText = "Timer: " + aimTimer;
    console.log(accurateClicks, totalClicks);

    if (aimTimer > 0) {
        setTimeout(updateAimTimeout, 1000);
    } else {
        if (!aimWindow.classList.contains("hidden")) {
            aimWindow.classList.add("hidden");
        }

        if (accurateClicks / totalClicks > 0.75){
            playerScore = 20;
        }

        runResult();
    }
}

// This function runs when the player chooses to fight while the opponent chooses to counter:
function runAimTrainer(){
    totalClicks = 0;
    accurateClicks = 0;
    aimTimer = 5;

    opponentScore = 10;
    playerScore = 0;

    // Set aim window visible:
    if (aimWindow.classList.contains("hidden")){
        aimWindow.classList.remove("hidden");
    }

    // Set aim trainer visible:
    if (aimTrainer.classList.contains("hidden")){
        aimTrainer.classList.remove("hidden");
    }

    setTimeout(updateAimTimeout, 1000);
}

// Updates the counter line:
function updateCounterLine() {
    lineX += lineSpeed;

    if (lineX + counterLine.offsetWidth >= counterTest.offsetWidth) {
        lineX = counterTest.offsetWidth - counterLine.offsetWidth; // Prevent overlap
        lineSpeed = -Math.abs(lineSpeed); // Change direction
    } 
    else if (lineX <= 0) {
        lineX = 0; // Prevent overlap
        lineSpeed = Math.abs(lineSpeed); // Change direction
    }
    
    counterLine.style.left = lineX+"px";
}

// This function runs when the player chooses to counter:
function runCounterTest(){
    // Set counter test visible:
    if (counterTest.classList.contains("hidden")){
        counterTest.classList.remove("hidden");
    }

    // Random range:
    range = RandomRange(0, counterTest.offsetWidth - counterRange.offsetWidth);
    counterRange.style.left = range + "px";

    lineIntId = setInterval(updateCounterLine, 10);
}

// This function is used to determine who wins:
function runResult(){
    if (playerScore > opponentScore){ // Player wins
        gameStatus.innerText = "Ippon! You win!";
        winSFX.play();
        changeImage(4);
    } 
    else if (playerScore < opponentScore) { // Player loses
        gameStatus.innerText = "You fell flat on your back.";
        loseSFX.play();
        changeImage(2);
    }

    // Tie goes to the next round

    // Reset:
    resetRound();

    // Show the play again button:
    if (playAgainContainer.classList.contains("hidden")){
        playAgainContainer.classList.remove("hidden");
    }
}

// This function is used to reset / restart a round:
function resetRound(){
    // Reset:
    playerScore = 0;
    opponentScore = 0;
    reactionStartTime = null;
    playerMove = null;
    range = null;
    lineX = 0;
}





// Reset website button:
const labelBtn = document.getElementById("label-btn");
function initResetBtn() {
    labelBtn.addEventListener("click", function() {
        // Reset Technique Slider:
        techniqueIndex = -1;
        nextTechnique();

        // Reset Quiz:
        quizScore = 0;
        scorebox.innerHTML = "Score: 0";
        for (let i = 0; i < answers.length; i++) {
            let q = document.querySelector("input[name='q" + (i+1) + "']:checked");
            if (q){
                q.checked = false;
            }
        }

        // Close all open sections:
        interactiveSectionBtns.forEach(function(btn){
            const section = btn.parentElement;
            const content = section.querySelector(".interactive-target");
            content.classList.add("hidden");
        });
        
        // Close all cards:
        cards.forEach(function(card){
            if (card.classList.contains("card-flipped")){
                card.classList.remove("card-flipped");
            } 
        });

        // Reset Game:
        resetRound();
        if (startMenu.classList.contains("hidden")) {
            startMenu.classList.remove("hidden");
        }

        if (!ongoingGame.classList.contains("hidden")) {
            ongoingGame.classList.add("hidden");
        }

        if (!playAgainContainer.classList.contains("hidden")) {
            playAgainContainer.classList.add("hidden");
        }

        gameStatus.innerText = "Choose your next move";
  
        reactionTest.classList.add("hidden");
        counterTest.classList.add("hidden");
        aimTrainer.classList.add("hidden");
        aimWindow.classList.add("hidden");
        aimAccuracy.innerText = "Accuracy: 0% (>75%)";
        aimTimeLeft.innerText = "Time left: 5";

        // Clear timers
        if (reactionTimeoutId){
            clearTimeout(reactionTimeoutId);
            reactionTimeoutId = null;
        }
        
        if (lineIntId){
            clearInterval(lineIntId);
            lineIntId = null;
        }
        
        // Reset pages
        pages.forEach(function(page) {
            if (page.id != "history"){
                page.classList.add("hidden");
            } else {
                page.classList.remove("hidden");
            }
        });
    });
}


// Full screen:
const enterFS = document.getElementById("full-screen-icon");
const exitFS = document.getElementById("exit-full-screen-icon");
const enterContainer = document.querySelector(".full-screen");
const exitContainer = document.querySelector(".exit-full-screen");

function initFullScreen(){
    enterFS.addEventListener("click",enterFullscreen);
    exitFS.addEventListener("click",exitFullscreen);
}


function enterFullscreen() { //must be called by user generated event
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }

    enterContainer.classList.remove("showIcon");
    exitContainer.classList.add("showIcon");
}
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }

    exitContainer.classList.remove("showIcon");
    enterContainer.classList.add("showIcon");
}