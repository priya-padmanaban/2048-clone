// by priya
// 08/27/15
// concept credit goes to http://gabrielecirulli.github.io/2048/

void setup() {
  size(400, 400);
}

var DIMENSIONS = 4;
var ANIMATE_TIME = 12;

var BACKGROUND = color(250, 248, 239);
var TILE = color(204, 192, 179);
var GRID = color(187, 173, 160);
var TEXTCOL = color(119, 110, 101);

var score = 0;
var turns = 0;
var animation = 0;
var lastTile = false;
var result = false;

// get grid size and position for drawing
var border = 50;
var gridBorder = 8;
var gridSize = width - border;
var tileSize = floor((gridSize - gridBorder) / DIMENSIONS) - gridBorder;
var halfTile = tileSize / 2;
gridSize = DIMENSIONS * (tileSize + gridBorder) + gridBorder;
border = width - gridSize;
var gx = gridBorder + border / 2;
var gy = gridBorder + border - 8;
var fontSize = tileSize * 0.7;
var myFont = createFont("Sans", fontSize);

// create an 2D array of 0s
var createGrid = function() {
    var grid = [];
    
    for (var x = 0; x < DIMENSIONS; x++) {
        var row = [];
        for (var y = 0; y < DIMENSIONS; y++) {
            row.push(0);
        }
        grid.push(row);
    }
    
    return grid;
};

// return an array of positions where the grid is 0
var getEmptyPositions = function(grid) {
    var emptyPositions = [];
    
    for (var x = 0; x < DIMENSIONS; x++) {
        for (var y = 0; y < DIMENSIONS; y++) {
            if (grid[x][y] === 0) {
                emptyPositions.push({ x: x, y: y });
            }
        }
    }
    
    return emptyPositions;
};

// check whether it is possible to merge tiles without sliding
// (used to test whether player has lost the game)
var possibleMerges = function(grid) {
    for (var x = 0; x < DIMENSIONS; x++) {
        for (var y = 0; y < DIMENSIONS; y++) {
            if (x > 0 && grid[x][y] === grid[x - 1][y]) {
                return true;
            }
            if (y > 0 && grid[x][y] === grid[x][y - 1]) {
                return true;
            }
        }
    }

    return false;
};

// add a tile to a random empty position
// if no empty positions then end game
var addRandomTile = function(grid) {
    var emptyPositions = getEmptyPositions(grid);
    var n = floor(random(emptyPositions.length));
    var position = emptyPositions[n];
    
    if (random() < 0.9) {
        grid[position.x][position.y] = 1;
    } else {
        grid[position.x][position.y] = 2;
    }
    
    lastTile = position;
    animation = ANIMATE_TIME;
    
    if (emptyPositions.length === 1 && !possibleMerges(grid)) {
        result = "lose";
    }
};

// flip the grid vertically
var flipGrid = function(grid) {
    var newGrid = [];
    
    for (var y = 0; y < DIMENSIONS; y++) {
        newGrid.push(grid[DIMENSIONS - y - 1]);
    }
    
    return newGrid;
};

// move grid through 90 degrees clockwise or anti-clockwise if reverse is true
var rotateGrid = function(grid, reverse) {
    var newGrid = [];
    
    for (var y = 0; y < DIMENSIONS; y++) {
        var row = [];
        for (var x = 0; x < DIMENSIONS; x++) {
            var nx = reverse ? x : DIMENSIONS - x - 1;
            var ny = reverse ? DIMENSIONS - y - 1 : y;
            row.push(grid[nx][ny]);
        }
        newGrid.push(row);
    }
    
    return newGrid;
};

var moveLeft = function(grid) {
    var move = false;
    
    for (var y = 0; y < DIMENSIONS; y++) {
        var merged = false;
        for (var x = 1; x < DIMENSIONS; x++) {
            if (grid[x][y] > 0) {
                var mx = x; // position after moving
                
                // move to leftmost empty space
                for (var x2 = 0; x2 < x; x2++) {
                    if (grid[x2][y] === 0) {
                        grid[x2][y] = grid[x][y];
                        grid[x][y] = 0;
                        mx = x2;
                        move = true;
                        break;
                    }
                }
                
                // check for merge
                if (merged) {
                    merged = false;
                } else {
                    if (mx > 0 && grid[mx - 1][y] === grid[mx][y]) {
                        score += pow(2, grid[mx][y] + 1);
                        grid[mx - 1][y]++;
                        grid[mx][y] = 0;
                        move = true;
                        merged = true;
                        if (grid[mx - 1][y] === 11) {
                            result = "win";
                        }
                    }
                }
            }
        }
    }
    
    return move;
};

var grid = createGrid();
addRandomTile(grid);
addRandomTile(grid);

var drawGrid = function() {
    noStroke();
    fill(GRID);
    rect(border / 2, border - 8, gridSize, gridSize, 10);
    
    // tiles
    textAlign(CENTER, CENTER);
    textFont(myFont);
    
    for (var x = 0; x < DIMENSIONS; x++) {
        for (var y = 0; y < DIMENSIONS; y++) {
            var tx = gx + x * (tileSize + gridBorder);
            var ty = gy + y * (tileSize + gridBorder);
            
            fill(TILE);
            rect(tx, ty, tileSize, tileSize, 5);
            
            if (grid[x][y] > 0) {
                pushMatrix();
                translate(tx + halfTile, ty + halfTile);
                
                // animate with pop!!
                if (animation && lastTile.x === x && lastTile.y === y) {
                    scale(1.15 - abs((animation - 3) / ANIMATE_TIME));
                    animation--;
                }
                
                fill(lerpColor(BACKGROUND, color(255, 255, 0), grid[x][y] / 13));
                rect(-halfTile, -halfTile, tileSize, tileSize, 5);
                
                var val = pow(2, grid[x][y]);
                var digits = ceil(log(val + 1) / log(10));
                fill(TEXTCOL);
                textSize(2 * fontSize / (digits + 1));
                text(val, 0, 0);
                
                popMatrix();
            }
            
        }    
    }
};

var draw = function() {
    background(BACKGROUND);
    
    fill(TEXTCOL);
    textSize(15);
    textAlign(LEFT, CENTER);
    text("Score: " + score, 16, 20);
    text("Turn: " + turns, 140, 20);
    
    drawGrid();
    if (result) {
        fill(20);
        textSize(18);
        textAlign(LEFT, CENTER);
        text("You " + result +"!", 240, 20);
    }
    
};

var keyPressed = function() {
    if (result === 'lose' || animation > 5) { return; }
    
    var move;
    switch (keyCode) {
        case UP:
            grid = rotateGrid(grid);
            move = moveLeft(grid);
            grid = rotateGrid(grid, true);
            break;
        case DOWN:
            grid = rotateGrid(grid, true);
            move = moveLeft(grid);
            grid = rotateGrid(grid);
            break;
        case LEFT:
            move = moveLeft(grid);
            break;
        case RIGHT:
            grid = flipGrid(grid);
            move = moveLeft(grid);
            grid = flipGrid(grid);
            break;
    }
    
    if (move) {
        turns++;
        addRandomTile(grid);
    }
};