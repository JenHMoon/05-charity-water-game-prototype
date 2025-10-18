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

	// 팝업 내 Resume 버튼 클릭 시 동작
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

let currentMode = 'easy'; // 'easy' | 'normal' | 'hard'
let gridState = [];
let currentMoves = 0;
let gameStopped = false;


const EASY_SOLUTION_1 = [
    { r: 0, c: 0, type: 'pipe', isHorizontal: false },
    { r: 1, c: 0, type: 'bend-pipe', bendState: 2 },
    { r: 1, c: 1, type: 'pipe', isHorizontal: true },
    { r: 1, c: 2, type: 'bend-pipe', bendState: 4 },
    { r: 2, c: 2, type: 'pipe', isHorizontal: false },
    { r: 3, c: 2, type: 'pipe', isHorizontal: false }
];

const NORMAL_SOLUTION_1 = [
    { r: 0, c: 0, type: 'bend-pipe', bendState: 2 },
    { r: 0, c: 1, type: 'pipe', isHorizontal: true },
    { r: 0, c: 2, type: 'bend-pipe', bendState: 4 },
    { r: 1, c: 2, type: 'pipe', isHorizontal: false },
    { r: 2, c: 2, type: 'pipe', isHorizontal: false },
    { r: 3, c: 2, type: 'pipe', isHorizontal: false }
];

const HARD_SOLUTION_1 = [
    { r: 0, c: 0, type: 'bend-pipe', bendState: 2 },
    { r: 0, c: 1, type: 'pipe', isHorizontal: true },
    { r: 0, c: 2, type: 'bend-pipe', bendState: 4 },
    { r: 1, c: 2, type: 'bend-pipe', bendState: 1 },
    { r: 1, c: 1, type: 'pipe', isHorizontal: true },
    { r: 1, c: 0, type: 'bend-pipe', bendState: 3 },
    { r: 2, c: 0, type: 'pipe', isHorizontal: false },
    { r: 3, c: 0, type: 'bend-pipe', bendState: 2 },
    { r: 3, c: 1, type: 'bend-pipe', bendState: 1 },
    { r: 2, c: 1, type: 'bend-pipe', bendState: 3 },
    { r: 2, c: 2, type: 'bend-pipe', bendState: 4 },
    { r: 3, c: 2, type: 'pipe', isHorizontal: false }
];

// =============================================================
// RANDOM INITIALIZATION (shared for all levels)
// =============================================================
function applyRandomRotationToSolutionTile(solTile) {
    if (!solTile) return { type: 'pipe', isHorizontal: Math.random() < 0.5 };

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

function getSolutionForMode(mode) {
    if (mode === 'easy') return EASY_SOLUTION_1;
    if (mode === 'normal') return NORMAL_SOLUTION_1;
    if (mode === 'hard') return HARD_SOLUTION_1;
    return [];
}

// --- Generate grid for a given mode ---
function generateInitialGridForMode(mode) {
    const solMap = {};
    const solution = getSolutionForMode(mode);
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
// =============================================================
function renderGrid() {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const tileEl = document.getElementById(`tile-${r}-${c}`);
            if (!tileEl) continue;

            const tile = gridState[r][c] || { type: 'pipe', isHorizontal: true };
            tileEl.innerHTML = '';

            const img = document.createElement('img');
            img.src = tile.type === 'pipe' ? 'img/pipe.png' : 'img/bend-pipe.png';
            img.className = 'pipe-img';
            tileEl.appendChild(img);

            let rotation = 0;
            if (tile.type === 'pipe') rotation = tile.isHorizontal ? 0 : 90;
            else rotation = (tile.bendState - 1) * 90;

            img.style.transform = `rotate(${rotation}deg)`;
            img.style.transformOrigin = '50% 50%';

            tileEl.dataset.type = tile.type;
        }
    }
}

function updateUI() {
    document.getElementById('moves').textContent = currentMoves;
}

// =============================================================
// GAME LOGIC
// =============================================================
function rotateTile(r, c) {
    const tile = gridState[r][c];
    if (!tile) return;
    if (tile.type === 'pipe') tile.isHorizontal = !tile.isHorizontal;
    else tile.bendState = tile.bendState % 4 + 1;
}

// Function for Easy
function isEasyCleared() {
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

// Function for Normal
function isNormalCleared() {
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

// Function for Hard
function isHardCleared() {
    const t = gridState;
    return (
        t[0][0]?.type === 'bend-pipe' && t[0][0].bendState === 2 &&
        t[0][1]?.type === 'pipe' && t[0][1].isHorizontal &&
        t[0][2]?.type === 'bend-pipe' && t[0][2].bendState === 4 &&
        t[1][2]?.type === 'bend-pipe' && t[1][2].bendState === 1 &&
        t[1][1]?.type === 'pipe' && t[1][1].isHorizontal &&
        t[1][0]?.type === 'bend-pipe' && t[1][0].bendState === 3 &&
        t[2][0]?.type === 'pipe' && !t[2][0].isHorizontal &&
        t[3][0]?.type === 'bend-pipe' && t[3][0].bendState === 2 &&
        t[3][1]?.type === 'bend-pipe' && t[3][1].bendState === 1 &&
        t[2][1]?.type === 'bend-pipe' && t[2][1].bendState === 3 &&
        t[2][2]?.type === 'bend-pipe' && t[2][2].bendState === 4 &&
        t[3][2]?.type === 'pipe' && !t[3][2].isHorizontal
    );
}

function isCurrentLevelCleared() {
    if (currentMode === 'easy') return isEasyCleared();
    if (currentMode === 'normal') return isNormalCleared();
    if (currentMode === 'hard') return isHardCleared();
    return false;
}

function handleTileClick(r, c) {
    if (gameStopped) return;

    if (currentMoves <= 0) {
        showLoseOverlay();
        return;
    }

    rotateTile(r, c);
    currentMoves--;
    updateUI();
    renderGrid();


    if (isCurrentLevelCleared()) {
        showWinOverlay();
        return;
    }

    if (currentMoves <= 0 && !isCurrentLevelCleared()) {
        showLoseOverlay();
    }
}

// =============================================================
// Overlays
// =============================================================
function showWinOverlay() {
    document.getElementById('winOverlay').style.display = 'flex';
}
function showLoseOverlay() {
    document.getElementById('loseOverlay').style.display = 'flex';
}

// =============================================================
// Initialize level for a given mode
// mode: 'easy'|'normal'|'hard'
// =============================================================
function initializeLevel(mode = 'easy') {
    currentMode = mode;
    if (mode === 'easy') currentMoves = 10;
    else if (mode === 'normal') currentMoves = 10;
    else if (mode === 'hard') currentMoves = 15;
    gameStopped = false;

    gridState = generateInitialGridForMode(mode);
    updateUI();
    renderGrid();

    const gridEl = document.getElementById('gridContainer');
    if (gridEl) gridEl.style.display = 'grid';
    const endEl = document.getElementById('gameEndScreen');
    if (endEl) endEl.style.display = 'none';
}

// =============================================================
// EVENT LISTENERS
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const el = document.getElementById(`tile-${r}-${c}`);
            if (el) el.addEventListener('click', () => handleTileClick(r, c));
        }
    }

    document.getElementById('tryAgainBtn')?.addEventListener('click', () => {
        initializeLevel(currentMode);
        document.getElementById('loseOverlay').style.display = 'none';
    });

    document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
        document.getElementById('winOverlay').style.display = 'none';
        alert("Congrats!! You've cleared all available stages for this mode for now. I'm working on more levels!");
        if (typeof stopPlaying === 'function') stopPlaying();
    });

    if (document.getElementById('stopBtn')) {
        document.getElementById('stopBtn').addEventListener('click', () => {
            if (typeof stopPlaying === 'function') stopPlaying();
        });
    }

    // 난이도 버튼 활성화/비활성화 및 클릭 이벤트
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.id.replace('Btn', '').toLowerCase();
            initializeLevel(mode);
        });
    });
    // 최초 시작 시 easy 활성화
    document.getElementById('easyBtn')?.classList.add('active');
    initializeLevel('easy');

    // 힌트 팝업 show/hide 로직 추가
    const hintBtn = document.getElementById('hintBtn');
    const hintOverlay = document.getElementById('hintOverlay');
    const closeHintBtn = document.getElementById('closeHintBtn');
    if (hintBtn && hintOverlay && closeHintBtn) {
        hintBtn.addEventListener('click', function() {
            hintOverlay.style.display = 'flex';
        });
        closeHintBtn.addEventListener('click', function() {
            hintOverlay.style.display = 'none';
        });
    }
});

