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

	// 팝업 내 Resume/Restart/Home 버튼 클릭 시 팝업 닫기 (임시 동작)
	popupButtons.forEach(function(btn) {
		btn.addEventListener('click', function() {
			popupOverlay.style.display = 'none';
		});
	});

	// 팝업 바깥 영역 클릭 시 닫기 (선택적)
	popupOverlay && popupOverlay.addEventListener('click', function(e) {
		if (e.target === popupOverlay) {
			popupOverlay.style.display = 'none';
		}
	});
});



// 항상 풀 수 있는 파이프라인 퍼즐을 만드는 코드
document.addEventListener('DOMContentLoaded', () => {
	// 4행 3열 그리드의 타일을 2차원 배열로 관리합니다.
	// tile-0-0 ~ tile-3-2 (행, 열)
	// 힌트 버튼 클릭 시 정답 경로에 방향 화살표 표시
	const hintBtn = document.getElementById('hintBtn');
	const hintOverlay = document.getElementById('hintOverlay');
	const hintArrows = document.getElementById('hintArrows');
	const closeHintBtn = document.getElementById('closeHintBtn');

	// 방향에 따라 화살표 문자 반환
	function getArrow(from, to) {
		if (!from || !to) return '';
		const dr = to[0] - from[0];
		const dc = to[1] - from[1];
		if (dr === 1 && dc === 0) return '↓';
		if (dr === -1 && dc === 0) return '↑';
		if (dr === 0 && dc === 1) return '→';
		if (dr === 0 && dc === -1) return '←';
		return '';
	}

	if (hintBtn && hintOverlay && hintArrows && closeHintBtn) {
		hintBtn.addEventListener('click', function() {
			// 힌트 오버레이 표시
			hintOverlay.style.display = 'flex';
			// 정답 경로에 따라 화살표 표시
			hintArrows.innerHTML = '';
			for (let i = 0; i < path.length - 1; i++) {
				const from = path[i];
				const to = path[i+1];
				const arrow = getArrow(from, to);
				// 타일 위치와 방향 표시
				const div = document.createElement('div');
				div.style.fontSize = '2em';
				div.style.display = 'flex';
				div.style.alignItems = 'center';
				div.style.justifyContent = 'center';
				div.textContent = `(${from[0]},${from[1]}) ${arrow}`;
				hintArrows.appendChild(div);
			}
			// 마지막 타일
			const last = path[path.length-1];
			const div = document.createElement('div');
			div.style.fontSize = '2em';
			div.style.display = 'flex';
			div.style.alignItems = 'center';
			div.style.justifyContent = 'center';
			div.textContent = `(${last[0]},${last[1]})`;
			hintArrows.appendChild(div);
		});
		closeHintBtn.addEventListener('click', function() {
			hintOverlay.style.display = 'none';
		});
	}
  const ROWS = 4;
  const COLS = 3;
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(document.getElementById(`tile-${r}-${c}`));
    }
    tiles.push(row);
  }

		// 1. 정답 경로를 무작위로 생성 (우물: 0,0 → 수도꼭지: 3,2)
		// 시작(0,0)과 끝(3,2)은 반드시 세로(180도)로 연결되도록 경로를 만듭니다.
		let path = [[0,0]];
		let r = 0, c = 0;
		// 첫 칸은 반드시 아래로 시작
		r++;
		path.push([r, c]);
		// 중간 경로는 랜덤하게 오른쪽/아래로 이동
		while (r < ROWS - 1 || c < COLS - 1) {
			// 마지막 열에 도달하면 아래로만, 마지막 행에 도달하면 오른쪽으로만
			if (r === ROWS - 1) {
				c++;
			} else if (c === COLS - 1) {
				r++;
			} else {
				// 중간은 랜덤
				if (Math.random() < 0.5) r++;
				else c++;
			}
			path.push([r, c]);
		}
		// 마지막 칸은 반드시 위에서 내려오도록(세로 연결)
		if (path[path.length-2][0] !== ROWS-1) {
			// 마지막 바로 전 칸이 위가 아니면, 마지막 칸 바로 위로 이동
			path.splice(path.length-1, 0, [ROWS-2, COLS-1]);
		}

		// 2. 경로에 맞는 파이프와 방향을 미리 정해둡니다.
		// 각 칸에 {type, rotation} 저장
		const answerMap = {};
		// --- 정답 경로 및 각 타일의 정답 정보 콘솔 출력 (테스트용) ---
		console.log('정답 경로 (path):', JSON.stringify(path));
		console.log('정답 타일별 type/rotation:');
		for (let i = 0; i < path.length; i++) {
			const [answerCr, answerCc] = path[i];
			// 아래 줄에서 type/rotation은 answerMap에 저장하기 전이므로, 아래에서 저장 후 출력
			const [cr, cc] = path[i];
			let prev = path[i-1];
			let next = path[i+1];
			// 시작점(0,0): 반드시 아래로 연결
			if (!prev) {
				// 아래로 연결, pipe 또는 bend-pipe 중 랜덤
				if (next[0] === cr+1 && next[1] === cc) {
					// pipe(세로) 또는 bend-pipe(왼쪽 아래) 중 랜덤
					if (Math.random() < 0.5) {
						answerMap[`${cr},${cc}`] = {type: 'pipe', rotation: 90};
					} else {
						answerMap[`${cr},${cc}`] = {type: 'bend-pipe', rotation: 90};
					}
				}
				// 정답 정보 출력
				if (answerMap[`${answerCr},${answerCc}`]) {
					const info = answerMap[`${answerCr},${answerCc}`];
					console.log(`(${answerCr},${answerCc}): ${info.type} ${info.rotation}`);
				}
				continue;
			}
			// 끝점(3,2): 반드시 위에서 연결
			if (!next) {
				// 위에서 연결, pipe 또는 bend-pipe 중 랜덤
				if (prev[0] === cr-1 && prev[1] === cc) {
					if (Math.random() < 0.5) {
						answerMap[`${cr},${cc}`] = {type: 'pipe', rotation: 90};
					} else {
						answerMap[`${cr},${cc}`] = {type: 'bend-pipe', rotation: 180};
					}
				}
				if (answerMap[`${answerCr},${answerCc}`]) {
					const info = answerMap[`${answerCr},${answerCc}`];
					console.log(`(${answerCr},${answerCc}): ${info.type} ${info.rotation}`);
				}
				continue;
			}
			// 중간: 직선 or 꺾임
			if ((prev[0] === cr && next[0] === cr) || (prev[1] === cc && next[1] === cc)) {
				if (prev[0] === cr) {
					answerMap[`${cr},${cc}`] = {type: 'pipe', rotation: 0}; // 가로
				} else {
					answerMap[`${cr},${cc}`] = {type: 'pipe', rotation: 90}; // 세로
				}
			} else {
				// 꺾임: 방향에 따라 회전값 다름
				if (prev[0] < cr && next[1] > cc || next[0] < cr && prev[1] > cc) {
					answerMap[`${cr},${cc}`] = {type: 'bend-pipe', rotation: 0};
				}
				else if (prev[1] < cc && next[0] > cr || next[1] < cc && prev[0] > cr) {
					answerMap[`${cr},${cc}`] = {type: 'bend-pipe', rotation: 90};
				}
				else if (prev[0] > cr && next[1] > cc || next[0] > cr && prev[1] > cc) {
					answerMap[`${cr},${cc}`] = {type: 'bend-pipe', rotation: 270};
				}
				else {
					answerMap[`${cr},${cc}`] = {type: 'bend-pipe', rotation: 180};
				}
			}
			if (answerMap[`${answerCr},${answerCc}`]) {
				const info = answerMap[`${answerCr},${answerCc}`];
				console.log(`(${answerCr},${answerCc}): ${info.type} ${info.rotation}`);
			}
		}

	// 3. 실제로 타일에 파이프 이미지를 배치합니다.
	// 파이프 이미지 파일명: 'img/pipe.png'(직선), 'img/bend-pipe.png'(꺾임)
	// 나머지 타일은 랜덤하게 채움 (t-pipe 제거)
	const allTypes = ['pipe', 'bend-pipe'];
	// moves 계산 및 각 타일별 클릭 횟수 콘솔 출력
	let minMoves = 0;
	let clickInfo = [];
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			const tile = tiles[r][c];
			if (!tile) continue;
			tile.innerHTML = '';
			let type, rotation, initialRot;
			if (answerMap[`${r},${c}`]) {
				// 정답 경로 타일: 정답 type/rotation으로 배치
				type = answerMap[`${r},${c}`].type;
				rotation = answerMap[`${r},${c}`].rotation;
				initialRot = [0,90,180,270][Math.floor(Math.random()*4)]; // 무작위 시작 회전
			} else {
				// 나머지 타일: 랜덤 배치
				type = allTypes[Math.floor(Math.random()*allTypes.length)];
				rotation = [0,90,180,270][Math.floor(Math.random()*4)];
				initialRot = rotation;
			}
			let imgSrc = type === 'pipe' ? 'img/pipe.png' : 'img/bend-pipe.png';
			const img = document.createElement('img');
			img.src = imgSrc;
			img.alt = 'pipe';
			img.className = 'pipe-img';
			img.style.transform = `rotate(${initialRot}deg)`;
			tile.appendChild(img);
			tile.dataset.rotation = initialRot;
			tile.style.transform = `rotate(${initialRot}deg)`;
			tile.dataset.answerType = type;
			tile.dataset.answerRotation = rotation;
			// 정답 경로 타일이면 필요한 클릭 수 계산 및 출력용 배열 저장
			if (answerMap[`${r},${c}`]) {
				let diff = (rotation - initialRot + 360) % 360;
				let clicks = diff / 90;
				minMoves += clicks;
				clickInfo.push(`(${r},${c}): ${clicks}회`);
			}
		}
	}
	console.log('각 정답 경로 타일별 클릭 횟수:', clickInfo.join(', '));
	console.log('총 최소 클릭 수:', minMoves);

	// 승리 체크 함수
	function checkWin() {
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const tile = tiles[r][c];
				if (!tile) continue;
				// 정답 경로 타일만 체크
				if (answerMap[`${r},${c}`]) {
					// 현재 파이프 종류와 회전이 정답과 일치해야 함
					if (tile.dataset.answerType !== answerMap[`${r},${c}`].type) return false;
					if (parseInt(tile.dataset.rotation, 10) !== answerMap[`${r},${c}`].rotation) return false;
				}
			}
		}
		return true;
	}

			// 승리 오버레이 표시 함수
			function showWinOverlay() {
				const winOverlay = document.getElementById('winOverlay');
				if (winOverlay) winOverlay.style.display = 'flex';
			}

	// 4. 클릭 시 90도씩 회전 + 승리/패배 체크 + moves 감소
	let moves = Math.round(minMoves);
	const movesSpan = document.getElementById('moves');
	if (movesSpan) movesSpan.textContent = moves;
	let gameEnded = false;
	// 게임 시작 시 이미 정답이면 바로 승리
	if (checkWin()) {
		gameEnded = true;
		setTimeout(showWinOverlay, 200);
	}
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			const tile = tiles[r][c];
			if (!tile) continue;
			tile.addEventListener('click', () => {
				if (gameEnded) return;
				let rotation = parseInt(tile.dataset.rotation, 10);
				rotation = (rotation + 90) % 360;
				tile.dataset.rotation = rotation.toString();
				tile.style.transform = `rotate(${rotation}deg)`;
				// moves 감소
				moves--;
				if (movesSpan) movesSpan.textContent = moves;
				// 승리 체크
				if (checkWin()) {
					gameEnded = true;
					setTimeout(showWinOverlay, 200);
					return;
				}
				// 패배 체크
				if (moves <= 0) {
					gameEnded = true;
					setTimeout(() => {
						const loseOverlay = document.getElementById('loseOverlay');
						if (loseOverlay) loseOverlay.style.display = 'flex';
					}, 200);
				}
			});
		}
	}

				// Try Again 버튼 이벤트 연결
				const tryAgainBtn = document.getElementById('tryAgainBtn');
				if (tryAgainBtn) {
					tryAgainBtn.addEventListener('click', function() {
						window.location.reload();
					});
				}

			// Next Level 버튼 클릭 시 새 퍼즐로 리셋 (간단하게 새로고침)
			const nextBtn = document.getElementById('nextLevelBtn');
			if (nextBtn) {
				nextBtn.addEventListener('click', function() {
					window.location.reload();
				});
			}
});
