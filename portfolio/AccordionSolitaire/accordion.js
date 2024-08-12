// ======= Globals ======= ///
const suits = ["♣","♥","♠","♦"]; // CHaSeD order
const values = ["Joker","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const playspace = document.getElementById("gameboard");
var deck = [];

class Card{
    constructor(rank, suitIndex){
        // Validate input
        if(rank < 0 || rank > 13){
            console.error(`Invalid value: ${rank}`);
        }
        if(suitIndex < 0 || suitIndex > 3){
            console.error(`Invlaid suit index: ${suitIndex}`);
        }

        // Construct
        this.value = rank;
        this.suit = suitIndex;
        this.selected = false;
        this.available = false;
    }

    matches(other) {
        if (!(other instanceof Card)) {
            console.error(`${other} is not of type Card\; cannot compare`);
        }

        var equal = false;
        equal ||= this.value == other.value;
        equal ||= this.suit == other.suit;
        return equal;
    }
    
    getString() {
        if (this.value == 0){ return "Joker"; }
        return `${values[this.value]}${suits[this.suit]}`;
    }

}

function showHelp() {
    var menu = document.getElementById("help-box");
    menu.classList.toggle("hidden");
}

function initializeGame(){
    var winbox = document.getElementById("game-over-box");
    if(!winbox.classList.contains("hidden")) {
        winbox.classList.toggle("hidden");
    }
    
    // Make cards
    playspace.innerHTML = "";
    deck = [];
    for(let s = 0; s <= 3; s++){
        for(let v = 1; v <= 13; v++){
            deck.push(new Card(v, s));
        }
    }

    // Shuffle cards (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
    for( let i = 51; i >= 1; i--) {
        var j = Math.floor((i+1)*Math.random()); // random integer such that 0 ≤ j ≤ i
        [deck[j], deck[i]] = [deck[i], deck[j]];
    }

    // Add cards to DOM (i.e. deal to table)
    deck.forEach((card, index) => {
        playspace.innerHTML += `<div class=\"card\" index=\"${index}\" onclick=\"handleClick(this)\">${card.getString()}</div>`;
    });

    updateDisplay();
}

/*
PRECONDITION: Backend has been updated by player action, but the UI has not
POSTCONDITION: The UI is reconciled with the backend data
*/
function updateDisplay() {
    var domCards = [...playspace.getElementsByClassName("card")];
    // Loop thru deck & display
    for(var ind = 0; ind < deck.length; ind++) {
        // Compare
        if(domCards[ind].textContent != deck[ind].getString()) {
            domCards[ind].textContent = deck[ind].getString(); // Replace text, dom index should remain the same
        }

        // Check color
        if((deck[ind].suit % 2 == 1) != domCards[ind].classList.contains("red") )

        // Check coloring
        if (domCards[ind].classList.contains("red") != (deck[ind].suit % 2 == 1) ) {
            domCards[ind].classList.toggle("red");
        }
        if (domCards[ind].classList.contains("selected") != deck[ind].selected ) {
            domCards[ind].classList.toggle("selected");
        }
        if (domCards[ind].classList.contains("available") != deck[ind].available ) {
            domCards[ind].classList.toggle("available");
        }
    }
    // Cull extra DOM cards, if any
    while(ind < domCards.length) {
        domCards[ind].remove();
        ind++;
    }
}

function clearSelections() {
    // Clear selection & availability
    let hilightedCards = deck.filter(card => (card.selected || card.available));
    hilightedCards.forEach(card => {
        card.selected = card.available = false;
    });
    updateDisplay();
}

function gameOver(score) {
    var winbox = document.getElementById("game-over-box");
    if (score == 1)
        winbox.innerHTML = `<h2>Congratulations! You stacked all the cards!</h2>`;
    else
       winbox.innerHTML = `<h2>You finished with ${score} cards remaining.</h2>`;
    winbox.classList.toggle("hidden");
}

function winCheck() {
    if(deck.length > 1) {
        // Check for possible moves
        for(let ind = 0; ind < deck.length-1; ind++){
            if(deck[ind].matches(deck[ind+1])) {
                return;
            }
            try {
                if(deck[ind].matches(deck[ind+3])) {
                    return;
                }
            } catch (RangeError) {
                continue;
            }
        }
    }

    // No more moves
    gameOver(deck.length);
}

function handleClick(domCard) {
    // Validate input
    var cardIndex = parseInt(domCard.getAttribute("index"));
    if(cardIndex < 0 || cardIndex >= deck.length) {
        throw new RangeError(`Index ${cardIndex} is out of range.`);
    }
    
    if(deck[cardIndex].available) {  
        // Move Card
        if (deck[cardIndex+1].selected) {
            console.log(`moving card ${cardIndex+1} of ${deck.length}, ${deck[cardIndex+1].getString()} onto card ${cardIndex} of ${deck.length}, ${deck[cardIndex].getString()}`);
            deck[cardIndex] = deck.splice(cardIndex+1, 1)[0];
            console.log(`Now card ${cardIndex} of ${deck.length} is ${deck[cardIndex].getString()}`)
        } else {
            deck[cardIndex] = deck.splice(cardIndex+3, 1)[0];
        }

        clearSelections();
        winCheck();

    } else if(!deck[cardIndex].selected) {
        console.log(`card ${cardIndex} of ${deck.length}, ${deck[cardIndex].getString()} is now selected`);
        clearSelections();
        deck[cardIndex].selected = true;

        // Find available cards
        let checkInd = cardIndex - 3;
        if(checkInd >= 0) {
            if(deck[checkInd].matches(deck[cardIndex])) {
                deck[checkInd].available = true;
            }
        }
        checkInd += 2;
        if(checkInd >= 0) {
            if(deck[checkInd].matches(deck[cardIndex])) {
                deck[checkInd].available = true;
            }
        }

        updateDisplay();

    } else /*if(deck[ind].selected)*/{
        // Undo selection
        console.log(`card ${cardIndex} of ${deck.length}, ${deck[cardIndex].getString()} is no longer selected`);
        clearSelections();
    }
}