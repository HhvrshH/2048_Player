function Player2048(n) {
  this.sum_g = 
  this.boardSize = n;
}

Player2048.prototype.getCurrentState = function() {
  const tiles = document.querySelectorAll('.tiles .tile-item');
  const grid = Array.from({ length: 4 }, () => Array(4).fill(0));

  tiles.forEach(tile => {
    const positionClass = Array.from(tile.classList).find(cls =>
      cls.match(/tile-(\d)-(\d)/)
    );

    if (positionClass) {
      const match = positionClass.match(/tile-(\d)-(\d)/);
      if (match) {
        const rowFromBottom = parseInt(match[1], 10);
        const colFromRight = parseInt(match[2], 10);

        const row = 3 - rowFromBottom;
        const col = 3 - colFromRight;

        const value = parseInt(tile.getAttribute('data-v'), 10);
        grid[row][col] = value || 0;
      }
    }
  });

  function reverseArray(array) {
    return array.map(row => row.reverse()).reverse();
  }

  function transposeArray(array) {
    return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
  }

  function flattenArray(array) {
    return array.reduce((acc, row) => acc.concat(row), []);
  }

  const reversedArray = reverseArray(grid);
  const transposedArray = transposeArray(reversedArray);
  const flattenedArray = flattenArray(transposedArray);

  console.log(flattenedArray);
  return flattenedArray;
};


Player2048.prototype.move = function(direction) {
  switch (direction) {
    case 1: 
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        code: 'ArrowUp',
        keyCode: 38, 
        which: 38
      }));
      break;
    case 2: 
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        keyCode: 37, 
        which: 37
      }));
      break;
    case 3: 
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40, 
        which: 40
      }));
      break;
    case 4: 
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        code: 'ArrowRight',
        keyCode: 39, 
        which: 39
      }));
      break;
    default:
      console.log("Invalid direction");
  }
};


Player2048.prototype.simulateUp = function(current, i) {
  i = i || 0;
  if (i == 3)
    return this.simulate(current.slice(), 0, this.boardSize, 1, this.boardSize, function(o, p) {
      return o <= p;
    }, function(o, p) {
      return o >= p;
    });
  return this.simulate(current.slice(), 0, this.boardSize, 1, this.boardSize, function(o, p) {
    return o <= p;
  }, function(o, p) {
    return o >= p;
  })[i];
}

Player2048.prototype.simulateDown = function(current, i) {
  i = i || 0;
  if (i == 3)
    return this.simulate(current.slice(), this.boardSize * (this.boardSize - 1), this.boardSize * this.boardSize, 1, -1 * this.boardSize, function(o, p) {
      return o >= p;
    }, function(o, p) {
      return o <= p;
    });
  return this.simulate(current.slice(), this.boardSize * (this.boardSize - 1), this.boardSize * this.boardSize, 1, -1 * this.boardSize, function(o, p) {
    return o >= p;
  }, function(o, p) {
    return o <= p;
  })[i];
}

Player2048.prototype.simulateLeft = function(current, i) {
  i = i || 0;
  if (i == 3)
    return this.simulate(current.slice(), 0, this.boardSize * (this.boardSize - 1) + 1, this.boardSize, 1, function(o, p) {
      return o <= p;
    }, function(o, p) {
      return o >= p;
    });
  return this.simulate(current.slice(), 0, this.boardSize * (this.boardSize - 1) + 1, this.boardSize, 1, function(o, p) {
    return o <= p;
  }, function(o, p) {
    return o >= p;
  })[i];
}

Player2048.prototype.simulateRight = function(current, i) {
  i = i || 0;
  if (i == 3)
    return this.simulate(current.slice(), this.boardSize - 1, Math.pow(this.boardSize, 2), this.boardSize, -1, function(o, p) {
      return o >= p;
    }, function(o, p) {
      return o <= p;
    });
  return this.simulate(current.slice(), this.boardSize - 1, Math.pow(this.boardSize, 2), this.boardSize, -1, function(o, p) {
    return o >= p;
  }, function(o, p) {
    return o <= p;
  })[i];
}

Player2048.prototype.simulateScore = function(current, move) {
  switch (move) {
    case 1:
      return this.simulateUp(current, 3);
    case 2:
      return this.simulateLeft(current, 3);
    case 3:
      return this.simulateDown(current, 3);
    case 4:
      return this.simulateRight(current, 3);
    default:
      console.log("invalid move");
      return null;
  }
}

Player2048.prototype.simulate = function(c, initial, end, increment, shift, F1, F2) {
  var current = c.slice();
  var availableCells = [];
  var totalMerged = 0;

  for (var o = 0; o < 3; o++) {
    for (var i = initial; i < end; i += increment) {
      for (var j = i + shift; F1(j, i + shift * (this.boardSize - 1)); j += shift) {
        var tmp = j;
        var summed = false;
        for (var n = j - shift; F2(n, i); n -= shift) {
          if (o % 2 == 0) {
            if (current[n] == 0 && current[tmp] != 0) {
              current[n] = current[tmp];
              current[tmp] = 0;
            }
            tmp = n;
          } else {
            if (current[j - shift] == current[j] && !summed) {
              current[j - shift] *= 2;
              totalMerged += current[j - shift];
              current[j] = 0;
              summed = true;
            }
          }
        }
      }
    }
  }

  if (!this.isEquals(current, c)) {
    for (var i = 0; i < current.length; i++) {
      if (current[i] == 0) availableCells.push(i);
    }

    if (availableCells.length) {
      current[availableCells[Math.floor(Math.random() * availableCells.length)]] = this.getNumber();
    }
  }

  return [current.slice(0), totalMerged];
};

Player2048.prototype.getNumber = function() {
  if (Math.random() <= 0.7) {
      return 2;
    }
    return 4;
};

Player2048.prototype.estimateState = function(current, move) {
  var sim = this.simulateScore(current, move);
  var value = sim[1];
  var emptyCells = this.getFrequency(0, sim[0]);
  return value + emptyCells;
};

Player2048.prototype.estimateStateInDepth = function(current, depth) {
  var up = this.simulateUp(current.slice(0));
  var left = this.simulateLeft(current.slice(0));
  var down = this.simulateDown(current.slice(0));
  var right = this.simulateRight(current.slice(0));

  if (depth <= 1) {
    var r = [
      !this.isEquals(up, current) ? this.estimateState(current, 1) : -8196,
      !this.isEquals(left, current) ? this.estimateState(current, 2) : -8196,
      !this.isEquals(down, current) ? this.estimateState(current, 3) : -8196,
      !this.isEquals(right, current) ? this.estimateState(current, 4) : -8196
    ];
    return r;
  } else {
    var r = [
      (!this.isEquals(up, current) ? this.estimateState(current, 1) * depth + Math.max.apply(Math, this.estimateStateInDepth(up, depth - 1)) : -8196 * depth),
      (!this.isEquals(left, current) ? this.estimateState(current, 2) * depth + Math.max.apply(Math, this.estimateStateInDepth(left, depth - 1)) : -8196 * depth),
      (!this.isEquals(down, current) ? this.estimateState(current, 3) * depth + Math.max.apply(Math, this.estimateStateInDepth(down, depth - 1)) : -8196 * depth),
      (!this.isEquals(right, current) ? this.estimateState(current, 4) * depth + Math.max.apply(Math, this.estimateStateInDepth(right, depth - 1)) : -8196 * depth)
    ];
    return r;
  }
};

Player2048.prototype.sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

Player2048.prototype.play = async function(maxMoves = Infinity                      // ТУТ НАСТРАИВЕМ МАКС КОЛИЧЕСТВО ХОДОВ
  , delayMs = 700) {                                                                // ТУТ ЗАДЕРЖКУ МЕЖДУ ХОДАМИ
  var self = this;
  var movesCount = 0; 

  while (movesCount < maxMoves) {
    
    var values = self.estimateStateInDepth(self.getCurrentState(), 7);
    var max = Math.max.apply(Math, values);
    var bestMove = values.indexOf(max) + 1;

    
    var simResult = self.simulateScore(self.getCurrentState(), bestMove);

    
    if (simResult === null) {
      console.log("No possible move, exiting.");
      break;
    }

    self.move(bestMove);
    movesCount++;

    await self.sleep(delayMs);
    
    if (simResult[0] === 0) {
      console.log("No progress in the game, exiting.");
      break;
    }
  }

  console.log(`Game finished after ${movesCount} moves.`);
};

Player2048.prototype.isEquals = function(a1, a2) {
  if (a1.length != a2.length) return false;
  for (var i = 0; i < a1.length; i++) {
    if (a1[i] != a2[i]) return false;
  }
  return true;
};

Player2048.prototype.getFrequency = function(e, a) {
  var f = 0;
  for (var i = 0; i < a.length; i++) {
    if (a[i] == e) f = f + 1;
  }
  return f;
};

var player = new Player2048(4);
player.play();
