const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// 플레이어 및 기타 객체의 속성 초기화
const player = {
  x: canvas.width / 2,
  y: canvas.height - 30, // 플레이어를 화면 맨 아래로 위치
  width: 50,
  height: 20,
  color: 'blue',
  speed: 5
};

const bullets = [];
const enemies = [];
let missedEnemies = 0; // 놓친 적의 수
let hitEnemies = 0; // 맞춘 적의 수
const maxMissedEnemies = 3; // 놓치면 게임 오버
const bulletInterval = 100; // 총알 발사 간격 (밀리초)
const enemySpeed = 2; // 적의 속도
const maxEnemies = 3; // 화면에 유지할 적의 개수
const enemySpawnInterval = 2000; // 적 생성 간격 (밀리초)
const maxHitPoints = 1; // 적이 맞을 수 있는 최대 총알 수 (1로 설정하여 한 번만 맞으면 죽음)
let shooting = false; // 총알 발사 상태
let gameOverDisplayTime = 0; // 게임 오버 메시지 표시 시간

// 랜덤 색상 생성 함수
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 캔버스 크기 조정 함수
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.x = canvas.width / 2 - player.width / 2; // 플레이어의 초기 위치 조정
  player.y = canvas.height - player.height; // 플레이어를 화면 맨 아래로 이동
}

// 캔버스 크기 조정 이벤트 리스너
window.addEventListener('resize', resizeCanvas);

// 게임 초기화 함수
function initializeGame() {
  resizeCanvas(); // 캔버스 크기 초기화
  bullets.length = 0; // 총알 배열 초기화
  enemies.length = 0; // 적 배열 초기화
  missedEnemies = 0; // 놓친 적 수 초기화
  hitEnemies = 0; // 맞춘 적 수 초기화
  gameOverDisplayTime = 0; // 게임 오버 메시지 표시 시간 초기화
  for (let i = 0; i < maxEnemies; i++) {
    spawnEnemy();
  }
}

// 배경 그리기
function drawBackground() {
  context.fillStyle = 'black'; // 배경색을 검은색으로 설정
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// 플레이어 그리기
function drawPlayer() {
  context.fillStyle = player.color;
  context.fillRect(player.x, player.y, player.width, player.height);
}

// 총알 그리기
function drawBullets() {
  bullets.forEach((bullet, index) => {
    context.fillStyle = 'red';
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    bullet.y -= bullet.speed;

    // 총알이 화면 밖으로 나가면 삭제
    if (bullet.y + bullet.height < 0) {
      bullets.splice(index, 1);
    }
  });
}

// 적 그리기
function drawEnemies() {
  enemies.forEach((enemy) => {
    context.fillStyle = enemy.color; // 적의 색상 설정
    context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

// 맞춘 적 수 그리기
function drawHitEnemies() {
  context.fillStyle = 'white'; // 글씨 색상 설정
  context.font = '20px Arial';
  context.textAlign = 'right';
  context.fillText('Hit Enemies: ' + hitEnemies, canvas.width - 10, 20);
}

// 게임 오버 메시지 그리기
function drawGameOver() {
  if (gameOverDisplayTime > 0) {
    context.fillStyle = 'white';
    context.font = '40px Arial';
    context.textAlign = 'center';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    gameOverDisplayTime -= 1 / 60; // 메시지 표시 시간 감소 (60 FPS 기준)
  }
}

// 총알과 적의 충돌 감지
function checkCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // 충돌 시 적의 hitPoints 감소
        enemy.hitPoints -= 1;
        // 총알 삭제
        bullets.splice(bulletIndex, 1);

        // 적의 hitPoints가 0이 되면 적 삭제
        if (enemy.hitPoints <= 0) {
          enemies.splice(enemyIndex, 1);
          hitEnemies++; // 맞춘 적 수 증가
          // 적이 죽으면 새로운 적 생성
          spawnEnemy();
        }
      }
    });
  });
}

// 플레이어 위치 업데이트
function updatePlayerPosition(x) {
  player.x = Math.max(Math.min(x - player.width / 2, canvas.width - player.width), 0);
}

// 총알 발사 함수
function shootBullet() {
  const bullet = {
    x: player.x + player.width / 2 - 2.5,
    y: player.y - 10, // 플레이어 위쪽에서 발사
    width: 5,
    height: 10,
    speed: 7
  };
  bullets.push(bullet);
}

// 적 생성 함수
function spawnEnemy() {
  if (enemies.length < maxEnemies) {
    const enemy = {
      x: Math.random() * (canvas.width - 50), // 랜덤한 x 위치
      y: -20, // 화면 위쪽에서 시작
      width: 50,
      height: 20,
      color: getRandomColor(), // 랜덤 색상 지정
      hitPoints: maxHitPoints // 적의 초기 hitPoints 설정 (1로 설정하여 한 번만 맞으면 죽음)
    };
    enemies.push(enemy);
  }
}

// 적 이동 함수
function moveEnemies() {
  enemies.forEach((enemy) => {
    enemy.y += enemySpeed;

    // 적이 화면 밖으로 나가면 삭제 및 놓친 적 수 증가
    if (enemy.y > canvas.height) {
      enemies.splice(enemies.indexOf(enemy), 1);
      missedEnemies++;
      // 놓친 적 수가 최대 개수에 도달하면 게임 오버
      if (missedEnemies >= maxMissedEnemies) {
        gameOver();
      } else {
        // 놓친 적 수가 최대 개수에 도달하지 않았으면 새로운 적 생성
        spawnEnemy();
      }
    }
  });
}

// 게임 오버 처리
function gameOver() {
  gameOverDisplayTime = 3; // 3초 동안 게임 오버 메시지 표시
  setTimeout(initializeGame, 3000); // 3초 후에 게임 초기화
}

// 마우스 이동 이벤트 처리
function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  updatePlayerPosition(mouseX);
}

// 마우스 클릭 이벤트 처리
function handleMouseDown() {
  shooting = true;
}

// 마우스 클릭 해제 이벤트 처리
function handleMouseUp() {
  shooting = false;
}

// 총알 발사 타이머 설정
setInterval(() => {
  if (shooting) {
    shootBullet();
  }
}, bulletInterval);

// 적 생성 타이머 설정
setInterval(spawnEnemy, enemySpawnInterval);

// 게임 루프
function update() {
  drawBackground(); // 배경 그리기
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawHitEnemies(); // 맞춘 적 수 표시
  drawGameOver(); // 게임 오버 메시지 표시
  moveEnemies();
  checkCollisions();
  requestAnimationFrame(update);
}

// 이벤트 리스너
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);

// 게임 초기화
initializeGame();
update();
