var DECAY = -0.2;

class Ring{
    constructor(opacity) {
        this.opacity = opacity;
        this.radius = 0;
    }

    tic() {
        this.radius += 1;
        this.opacity *= 0.99;
        if (this.opacity < 0.02) {
            return false;
        } else {
            return true;
        }
    }
}

class Ripple {
    constructor(x, y, r, g, b) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.t = 0;
        this.curOp = this.calcOp();
        this.count = 0;
        this.circles = [];
    }

    tic() {
        var removals = [];
        for (var i in this.circles) {
            var circle = this.circles[i];
            if (!circle.tic()) {
                removals.push(i);
            }
        }
        if (Math.pow(Math.E, DECAY * this.t) > 0.2 || this.curOp > 0.01) {
            this.circles.push(new Ring(this.curOp));
            this.t += 0.025;
            this.curOp = this.calcOp();
            this.count++;
        }
        this.drawCircles();
        while (removals.length > 0) {
            this.circles.splice(removals.pop(), 1);
        }
    }

    calcOp() {
        return Math.pow(Math.E, DECAY * this.t)*Math.pow(Math.cos(this.t), 2)
    }

    drawCircles() {
        for (var i in this.circles) {
            var circle = this.circles[i];
            var op = circle.opacity;
            var r = circle.radius;
            drawCircle(this.x, this.y, r, this.r, this.g, this.b, op);
        }
    }

    isDone() {
        return this.circles.length == 0;
    }
}

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toString() {
        return "rgb("+this.r+", "+this.g+", "+this.b+")";
    }
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var ripples = [];
var colors = [  new Color(100, 150, 255),
                new Color(0, 0, 255),
                new Color(255, 0, 0),
                new Color(0, 255, 0),
                new Color(100, 0, 100),
                new Color(200, 150, 0)]

function init() {
    window.addEventListener('resize', resizeCanvas, false);
    $('#color').css("background-color", currentColor().toString()); 
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

init();
var inAction;

function currentColor() {
    return colors[0];
}

function nextColor() {
    colors.push(colors.splice(0, 1)[0]);
    return currentColor();
}

function tic() {
    clear();
    var forDeletion = [];
    for (var r in ripples) {
        ripples[r].tic();
        if (ripples[r].isDone()) {
            forDeletion.push(r);
        }
    }
    while (forDeletion.length > 0) {
        ripples.splice(forDeletion.pop(), 1);
    }
}


async function action() {
    inAction = true;
    while (ripples.length > 0) {
        await new Promise(resolve => {
            setTimeout(() => {
                resolve(tic());
            }, 0.5);
        });
    }
    inAction = false;
}

// async function whileRipple() {
//     do {
//         await rippleNext(ripples[0]);
//     } while (ripples[0].circles.length > 0);
//     console.log("Done");
// }

function drawCircle(x, y, radius, r, g, b, opacity) {
    ctx.strokeStyle = 'rgba('+r+', '+g+', '+b+', '+opacity+')';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
}

async function clear() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
}

function newRipple(x, y) {
    return new Ripple(x, y, currentColor().r, currentColor().g, currentColor().b)
}


$("#canvas").click(function(event) {
    ripples.push(newRipple(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
    if (!inAction) {
        action();
    }
})
$(document).keydown(function(event) {
    if (event.key == "n") {
        color = nextColor();
        $('#color').css("background-color", color.toString()); 
    }
})