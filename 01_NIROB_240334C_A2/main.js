//function to pick random number from a min-max range
function RandomRange(min,max){
    return Math.round(Math.random()*(max-min)+min);
}

// Runs functions when all the content is loaded:
document.addEventListener("DOMContentLoaded", function() {
	// Initialise the technique slider:
	initTechniqueSlider();

	// Initialise the menu scrolling:
	initMenuScroll();

    // Initialise the cards:
    initCards();
	
    // Initialise the game:
    initGame();
});


// Menu scroll to section:
function initMenuScroll(){
	const menuBtns = document.querySelectorAll(".menu a");

    menuBtns.forEach(function(btn){
        btn.addEventListener("click", function(onClicked) {
			onClicked.preventDefault(); // Remove the usual snapping to the section

            // Smooth scroll to the section instead:
            const targetSection = document.querySelector(this.getAttribute("href"));
			targetSection.scrollIntoView({
                behavior: "smooth"
            });
		});
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

const statusImage = document.getElementById("status-image");

const roundOptions = document.getElementById("round-options");
const fightBtn = document.getElementById("fight-btn");
const counterBtn = document.getElementById("counter-btn");

const reactionTest = document.getElementById("reaction-test");
const counterTest = document.getElementById("counter-test");
const counterLine = document.getElementById("counter-line");
const counterRange = document.getElementById("counter-range");
const cpsTest = document.getElementById("cps-test");

const playAgainContainer = document.getElementById("play-again-container");
const playAgain = document.getElementById("play-again");

let playerMove; // the player chooses to fight (1), counter (2)

// Reaction test:
let reactionTimeoutId;
let reactionStartTime; // Used for attacking (reaction time tester)

// Counter test:
let lineX = 0;
let lineSpeed = 3;
let range;
let lineIntId;

// CPS test
let clickTimer = 5;
let totalClicks = 0;

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

    // The button to test total clicks:
    cpsTest.addEventListener("click", function(){
        if (cpsTest.classList.contains("hidden")) return;
        if (clickTimer <= 0) return;
        totalClicks++;
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

    if (!cpsTest.classList.contains("hidden")){
        cpsTest.classList.add("hidden");
    }

    cpsTest.innerHTML = "Click Me! (5)";
    gameStatus.innerText = "Choose your next move";

    if (roundOptions.classList.contains("hidden")){
        roundOptions.classList.remove("hidden");
    }

    if (!statusImage.classList.contains("hidden")){
        statusImage.classList.add("hidden");
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
    } else{
        gameStatus.innerText = "You are being countered!";
    }
    
    let FvF = playerMove == 1 && opponentMove == 1; // Fight vs Fight
    let FvC = playerMove == 1 && opponentMove == 2; // Fight vs Counter

    if (FvF){
        // Reaction time test
        runReactionTest();
    } 
    else if (FvC) {
        // CPS test
        runCPSTest();
    } 
    else {
        // Counter vs Counter does nothing
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

// Update the click timer:
function updateClickTimer(){
    if (clickTimer > 0){
        clickTimer -= 1;
        cpsTest.innerText = "Click Me! (" + clickTimer + ")";
        setTimeout(updateClickTimer, 1000);
    } else {
        cpsTest.innerText = totalClicks + " Clicks";
        playerScore = totalClicks;
        runResult();
    }
}

// This function runs when the player chooses to fight while the opponent chooses to counter:
function runCPSTest(){
    // Set cps test visible:
    if (cpsTest.classList.contains("hidden")){
        cpsTest.classList.remove("hidden");
    }

    totalClicks = 0;
    clickTimer = 5;
    opponentScore = 13;

    setTimeout(updateClickTimer, 1000);
}

// This function is used to determine who wins:
function runResult(){
    if (playerScore > opponentScore){ // Player wins
        gameStatus.innerText = "Ippon! You win!";
    } 
    else if (playerScore < opponentScore) { // Player loses
        gameStatus.innerText = "You fell flat on your back.";
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