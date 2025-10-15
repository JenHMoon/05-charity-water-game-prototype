// 팝업 오버레이 show/hide 로직
document.addEventListener('DOMContentLoaded', function() {
	// back-btn 클릭 시 팝업 표시
	const backBtn = document.getElementById('backBtn');
	const popupOverlay = document.getElementById('popupOverlay');
	const popupButtons = document.querySelectorAll('.popup-btn');

	if (backBtn && popupOverlay) {
		backBtn.addEventListener('click', function() {
			popupOverlay.style.display = 'flex';
		});
	}

	// 팝업 내 Resume/Home 버튼 클릭 시 동작
	popupButtons.forEach(function(btn) {
		btn.addEventListener('click', function() {
			// Resume: 새 게임 시작 (새로고침)
			if (btn.id === 'resumeBtn') {
				window.location.reload();
			} else {
				// 나머지는 팝업만 닫기
				popupOverlay.style.display = 'none';
			}
		});
	});

	// 헤더의 restartBtn(↻) 클릭 시 새로고침
	const headerRestartBtn = document.getElementById('restartBtn');
	if (headerRestartBtn) {
		headerRestartBtn.addEventListener('click', function() {
			window.location.reload();
		});
	}

	// 팝업 바깥 영역 클릭 시 닫기 (선택적)
	popupOverlay && popupOverlay.addEventListener('click', function(e) {
		if (e.target === popupOverlay) {
			popupOverlay.style.display = 'none';
		}
	});
});

//New Logic
const GRID_ROWS = 4;
const GRID_COLS = 3;
const MAX_MOVES = 10;

let currentLevel = 1;
let gridState = [];
let currentMoves = 0;
let gameStopped = false;

/// Answer for Level 1
const LEVEL1_SOLUTION = [
    { r: 0, c: 0, type: 'pipe', isHorizontal: false },
    { r: 1, c: 0, type: 'bend-pipe', bendState: 2 },
    { r: 1, c: 1, type: 'pipe', isHorizontal: true },
    { r: 1, c: 2, type: 'bend-pipe', bendState: 4 },
    { r: 2, c: 2, type: 'pipe', isHorizontal: false },
    { r: 3, c: 2, type: 'pipe', isHorizontal: false }
];

/// Answer for Level 2
const LEVEL2_SOLUTION = [
    { r: 0, c: 0, type: 'bend-pipe', bendState: 2 },
    { r: 0, c: 1, type: 'pipe', isHorizontal: true },
    { r: 0, c: 2, type: 'bend-pipe', bendState: 4},
    { r: 1, c: 2, type: 'pipe', isHorizontal: false },
    { r: 2, c: 2, type: 'pipe', isHorizontal: false },
    { r: 3, c: 2, type: 'pipe', isHorizontal: false }
];

// =============================================================
// RANDOM INITIALIZATION (shared for all levels)
// =============================================================
function applyRandomRotationToSolutionTile(solTile) {
    if (solTile.type === 'pipe') {
        const offset = Math.floor(Math.random() * 2); // 0 or 1
        return {
            type: 'pipe',
            isHorizontal: offset === 0 ? solTile.isHorizontal : !solTile.isHorizontal
        };
    } else {
        const offset = Math.floor(Math.random() * 4); // 0..3
        const initialState = ((solTile.bendState - 1 + offset) % 4) + 1;
        return { type: 'bend-pipe', bendState: initialState };
    }
}

// --- Generate grid for a given level ---
function generateInitialGridForLevel(level) {
    const solMap = {};
    const solution = level === 1 ? LEVEL1_SOLUTION : LEVEL2_SOLUTION;
    solution.forEach(t => solMap[`${t.r},${t.c}`] = t);

    return Array.from({ length: GRID_ROWS }, (_, r) =>
        Array.from({ length: GRID_COLS }, (_, c) => {
            const key = `${r},${c}`;
            if (solMap[key]) {
                return applyRandomRotationToSolutionTile(solMap[key]);
            } else {
                if (Math.random() < 0.5)
                    return { type: 'pipe', isHorizontal: Math.random() < 0.5 };
                else
                    return { type: 'bend-pipe', bendState: Math.floor(Math.random() * 4) + 1 };
            }
        })
    );
}

// =============================================================
// GRID RENDERING + UI UPDATES
// It loops through every cell (r, c)
// of the gridState (the logical state of the board)
// For UI update
// Simply updates the DOM text for the “Moves” counter
// and “Level” indicator
// =============================================================
function renderGrid() {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const tileEl = document.getElementById(`tile-${r}-${c}`);
            if (!tileEl) continue;

            const tile = gridState[r][c];
            tileEl.innerHTML = '';

            const img = document.createElement('img');
            img.src = tile.type === 'pipe' ? 'img/pipe.png' : 'img/bend-pipe.png';
            img.className = 'pipe-img';
            tileEl.appendChild(img);

            let rotation = 0;
            if (tile.type === 'pipe') rotation = tile.isHorizontal ? 0 : 90;
            else rotation = (tile.bendState - 1) * 90;

            tileEl.style.transform = `rotate(${rotation}deg)`;
            tileEl.dataset.type = tile.type;
        }
    }
}

function updateUI() {
    document.getElementById('moves').textContent = currentMoves;
    document.getElementById('level').textContent = currentLevel;
}

// =============================================================
// GAME LOGIC
// I changed here a lot, since this way is the easiest for creating!
// =============================================================
function rotateTile(r, c) {
    const tile = gridState[r][c];
    if (tile.type === 'pipe') tile.isHorizontal = !tile.isHorizontal;
    else tile.bendState = tile.bendState % 4 + 1;
}

function isLevel1Cleared() {
    const t = gridState;
    return (
        t[0][0]?.type === 'pipe' && !t[0][0].isHorizontal &&
        t[1][0]?.type === 'bend-pipe' && t[1][0].bendState === 2 &&
        t[1][1]?.type === 'pipe' && t[1][1].isHorizontal &&
        t[1][2]?.type === 'bend-pipe' && t[1][2].bendState === 4 &&
        t[2][2]?.type === 'pipe' && !t[2][2].isHorizontal &&
        t[3][2]?.type === 'pipe' && !t[3][2].isHorizontal
    );
}

function isLevel2Cleared() {
    const t = gridState;
    return (
        t[0][0]?.type === 'bend-pipe' && t[0][0].bendState === 2 &&
        t[0][1]?.type === 'pipe' && t[0][1].isHorizontal &&
        t[0][2]?.type === 'bend-pipe' && t[0][2].bendState === 4 &&
        t[1][2]?.type === 'pipe' && !t[1][2].isHorizontal &&
        t[2][2]?.type === 'pipe' && !t[2][2].isHorizontal &&
        t[3][2]?.type === 'pipe' && !t[3][2].isHorizontal
    );
}

function handleTileClick(r, c) {
    if (gameStopped) return;

    if (currentMoves >= MAX_MOVES) {
        showLoseOverlay();
        return;
    }

    rotateTile(r, c);
    currentMoves++;
    updateUI();
    renderGrid();

    if (currentLevel === 1 && isLevel1Cleared()) {
        showWinOverlay();
        return;
    }
    if (currentLevel === 2 && isLevel2Cleared()) {
        showWinOverlay();
        return;
    }

    if (currentMoves >= MAX_MOVES && !isCurrentLevelCleared()) {
        showLoseOverlay();
    }
}
function isCurrentLevelCleared() {
    if (currentLevel === 1) return isLevel1Cleared();
    if (currentLevel === 2) return isLevel2Cleared();
    return false;
}
// =============================================================
// Here is notification overlays
// =============================================================
function showWinOverlay() {
    document.getElementById('winOverlay').style.display = 'flex';
}
function showLoseOverlay() {
    document.getElementById('loseOverlay').style.display = 'flex';
}

// =============================================================
// INITIALIZATION + LEVEL SWITCHING
// Initializing logic helper method
// Helper method is basically function that I need to call many times
// in the other parts of code
// =============================================================
function initializeLevel(level) {
    currentLevel = level;
    currentMoves = 0;
    gameStopped = false;
    gridState = generateInitialGridForLevel(level);
    updateUI();
    renderGrid();
    document.getElementById('gridContainer').style.display = 'grid';
    document.getElementById('gameEndScreen').style.display = 'none';
}

// =============================================================
// EVENT LISTENERS
// In order User to know what is goind on
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const el = document.getElementById(`tile-${r}-${c}`);
            if (el) el.addEventListener('click', () => handleTileClick(r, c));
        }
    }

    document.getElementById('tryAgainBtn')?.addEventListener('click', () => {
        initializeLevel(currentLevel);
        document.getElementById('loseOverlay').style.display = 'none';
    });

    document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
        document.getElementById('winOverlay').style.display = 'none';
        if (currentLevel === 1) initializeLevel(2);
        else if (currentLevel === 2) {
            alert("Congratulations!! You've cleared all levels for now, I am working on more higher Levels!!");
            // Attention, whenever Appdate the level, need to update this part too
            stopPlaying();
        }
    });

    document.getElementById('stopBtn')?.addEventListener('click', stopPlaying);

    initializeLevel(1);
});