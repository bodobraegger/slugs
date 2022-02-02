function getCanvasHeight() {
    return document.getElementById("phaser_container").clientHeight;
}
  
function getCanvasWidth() {
    return document.getElementById("phaser_container").clientWidth;
}
  
function pointOnCircle(x=0, y=0, radius=10, angle=0.5) {
    let p = new Vector2(x + radius * Math.cos(angle),
    y + radius * Math.sin(angle));
    return p;
}

function randomElement(array = []) {
    return array[Math.floor(Math.random()*array.length)]
}

function changeStylesheetRule(stylesheet, selector, property, value) {
    selector = selector.toLowerCase();
    property = property.toLowerCase();
    value = value.toLowerCase();

    for(var i = 0; i < stylesheet.cssRules.length; i++) {
        var rule = stylesheet.cssRules[i];
        if(rule.selectorText === selector) {
            rule.style[property] = value;
            return;
        }
    }
    stylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
}

function nearestPowerOf2(n=0) {
    if(n<1) return 1;
    else if(n>2147483647) return 1073741824;
    return 1 << 31 - Math.clz32(n);
}