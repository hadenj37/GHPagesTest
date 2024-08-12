/// ======= GLOBALS ======= ///
const styleNames = ["navy-style", "grey-style", "green-style", "penguin-style"];

/// ======= FUNCTIONS ======= ///
window.onload = function(){
    // get styleIndex from local storage if it exists
    try {
        var styleIndex = parseInt(localStorage.getItem("styleIndex"));
        if (isNaN(styleIndex)) {
            localStorage.setItem("styleIndex", "0");
            styleIndex = 0;
        }
    } catch (err) {
        console.error(err);
        localStorage.setItem("styleIndex", "0");
        styleIndex = 0;
    }

    // Set body's class to set style
    var bodyElement = document.getElementById("bod");
    bodyElement.className = styleNames[styleIndex];
}

function cycleStyle() {
    // Increment styleIndex
    var styleIndex = parseInt(localStorage.getItem("styleIndex"));
    styleIndex += 1;
    styleIndex %= styleNames.length;
    localStorage.setItem("styleIndex", styleIndex.toString());

    // Set body's class to set style
    var bodyElement = document.getElementById("bod");
    bodyElement.className = styleNames[styleIndex];
}