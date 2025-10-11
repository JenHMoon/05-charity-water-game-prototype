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

// 3x4 그리드(총 12개 타일)에 파이프 이미지를 무작위로 배치하고, 클릭 시 90도씩 회전하게 만듭니다.
document.addEventListener('DOMContentLoaded', () => {
	// 모든 .tile 요소를 선택합니다.
	const tiles = document.querySelectorAll('.tile');

	// 파이프 이미지 파일명과 개수 준비 (총 12개)
	// bend-pipe: 5개, pipe: 4개, t-pipe: 3개
	const pipeImages = [];
	for (let i = 0; i < 5; i++) pipeImages.push('img/bend-pipe.png');
	for (let i = 0; i < 4; i++) pipeImages.push('img/pipe.png');
	for (let i = 0; i < 3; i++) pipeImages.push('img/t-pipe.png');

	// pipeImages 배열을 무작위로 섞기 (Fisher-Yates)
	for (let i = pipeImages.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pipeImages[i], pipeImages[j]] = [pipeImages[j], pipeImages[i]];
	}

	// 타일 개수와 이미지 개수가 다르면 오류 방지 (3x4=12개만 할당)
	tiles.forEach((tile, idx) => {
		tile.dataset.rotation = '0';
		// 파이프 이미지 엘리먼트 생성 및 추가
		if (idx < pipeImages.length) {
			const img = document.createElement('img');
			img.src = pipeImages[idx];
			img.alt = 'pipe';
			img.className = 'pipe-img';
			tile.appendChild(img);
		}
		// 클릭 시 90도씩 회전
		tile.addEventListener('click', () => {
			let rotation = parseInt(tile.dataset.rotation, 10);
			rotation = (rotation + 90) % 360;
			tile.dataset.rotation = rotation.toString();
			tile.style.transform = `rotate(${rotation}deg)`;
		});
	});
});
