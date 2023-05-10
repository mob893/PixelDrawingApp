Boolean.prototype.mytoggle = function() {
    if (this.valueOf()) {
        return false
    };
    return true;
}

let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
let actionStack = [];
let memotos = [];
const app = $('#app');
let ratio = 32;
// Create canvas & cell
let canvas = $('.canvas');
let cell = `<div class="cell"></div>`;
let cells = "";
for (var i = 0; i<ratio*ratio; i++) {
    cell = `<div class="cell"></div>`;
    cells += cell;
};
canvas.innerHTML += cells;
cells = $$('.cell');
//Config canvas & cell 
let cellSize = 20;
let canvasSize = ratio*cellSize
canvas.style.width = canvasSize+'px';
canvas.style.height = canvasSize+'px';
cells.forEach(function (cell) {
    var width = cellSize+'px';
    var height = cellSize+'px';
    cell.style.width = width;
    cell.style.height = height;
    cell.style.backgroundColor = 'white';
    cell.dataset.preColor = cell.style.backgroundColor;
    // cell.addEventListener('mousemove', e=> {
    //     var mouseType = e.buttons;
    //     // console.log(e.target);
        
    // })
})


// Grid
let gridBtn = $('.gridBtn');
let gridStatus = true;
gridBtn.addEventListener('mousedown', e=>{
    if (gridStatus) {
        cells.forEach(function (cell) {
            cell.style.border = 'none'
        })
    } else {
        cells.forEach(function (cell) {
            cell.style.border = '1px solid black'
        })
    }
    gridStatus = gridStatus.mytoggle();
})

// erase button
let eraseMode = false;
let eraseBtn = $('.eraseBtn');
eraseBtn.addEventListener('click', e=> {
    eraseMode = true
})
// color picking
let colorPicker = $('.colorPicker');
let brushColor = 'black';
let secondColor = 'red';
let eraseColor = 'white';
colorPicker.addEventListener('contextmenu', e => {
    e.preventDefault();
    var color = e.srcElement.dataset.color;
    secondColor = color;
})
colorPicker.addEventListener('mouseup', e=> {
    var color = e.srcElement.dataset.color
    brushColor = color;
});

// BRUSH --------------------------------------

let brushBtn = $('.brushBtn');
// Click brush button: disable delete mode
brushBtn.addEventListener('click', e=>{
    eraseMode = false;
});
// right click 
canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    var cell = e.srcElement;
    actionStackPush(cell, cell.style.backgroundColor);
    drawCell(cell, secondColor);
});

canvas.addEventListener("click",e => {
    var cell = e.srcElement;
    actionStackPush(cell, cell.style.backgroundColor);
    if (!eraseMode) {
        drawCell(cell,brushColor);
    } else
        eraseCell(cell);
});
canvas.addEventListener("mousemove",e => {
    var cell = e.srcElement;
    var mouseType = e.buttons;
    if (eraseMode && mouseType!=0 ) {
        actionStackPush(cell, cell.style.backgroundColor);
        eraseCell(cell)
    } else {
        switch (mouseType) {
        case 1: 
            actionStackPush(cell, cell.style.backgroundColor);
            drawCell(cell, brushColor);
            break;
        case 2:
            actionStackPush(cell, cell.style.backgroundColor);
            drawCell(cell, secondColor);
        default:
            break;
        }
    }
});

// UNDOOOOOOOOOOOOOOOOOOO
let undoBtn = $('.undoBtn');
undoBtn.addEventListener('click',e=>{
    var memory = memotos.pop();
    var actions = memory ? memory.actions : 0;
    var length = actions.length;
    var action;
    for (var i = 0; i < length; i++) {
        action = actions.pop();
        if (action) 
        action.lastElement.style.backgroundColor = action.lastColor;
    }
});

app.addEventListener('mouseup', e=>{
    if (actionStack.length != 0 ) {
        memotos.push({actions: actionStack})
        actionStack = [];
    }
});
// Function
function drawCell(target, color) {
    target.style.backgroundColor = color;
};
function eraseCell(target) {
    target.style.backgroundColor = eraseColor;
};
function actionStackPush(lastElement, lastColor) {
    if (!(lastElement==canvas)) {
        if (actionStack.length==0) {
            actionStack.push({
                lastElement: lastElement,
                lastColor: lastColor
            });
        } 
        else
        {
            var top = actionStack[actionStack.length-1];
            if (!(top.lastElement == lastElement && top.lastColor == lastColor)) {
                actionStack.push({
                    lastElement: lastElement,
                    lastColor: lastColor
                });
            };
        };
    }
};

// Output canvas
let saveBtn = $('.saveAsBtn');
saveBtn.addEventListener('click', e => {
    // Create a tab that used to custom dowload file
    var downloadConfirm = document.createElement('div');
    downloadConfirm.classList.add('downloadConfirm');
    downloadConfirm.innerHTML = `
        <div class="download_fileName">Name of file:
        </br> 
            <textarea> </textarea>
        </div>
        <button class="download_btn dowloadBtn">
        Dowload
        </button>
        <button class="download_btn cancelBtn">
        Cancel
        </button>
    `;

    app.appendChild(downloadConfirm);
    var dowloadBtn = $('.dowloadBtn');
    var cancelBtn = $('.cancelBtn');

    // Add event onclick to cancel button
    cancelBtn.addEventListener('click', e=> {
        app.removeChild(downloadConfirm);
    });

    // Add event onclick to dowload button
    dowloadBtn.addEventListener('click', e => {
        var fileName = $('textarea').value;
        var output = canvas.outerHTML;
        output += `
        <style>
        * {
        margin: 0;
        padding: 0;
        outline: 0;
        font-family: sans-serif;
        user-select: none;
        }
        .canvas {
        position: absolute;
        display: flex;
        flex-flow: row wrap;
        width: 800px;
        height: 800px;
        background-color: white !important;
        }
        .cell {
            width: 25px;
            height: 25px;
            box-sizing: border-box;
        }
        </style>`
        // console.log(output);
        var link = document.createElement('a');
        var file = new Blob([output], {type: 'text/plain'});
        link.href = URL.createObjectURL(file);
        link.download = `${fileName}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
        app.removeChild(downloadConfirm);
    })
})
// console.log(canvas.outerHTML)
// action = {
//     lastElement: ,
//     lastColor: 
// }
