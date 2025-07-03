const character = document.getElementById('character');
const doors = document.querySelectorAll('.door');
const walls = document.querySelectorAll('.wall');
const signs = document.querySelectorAll('.sign');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const closePopup = document.getElementById('close-popup');
const overlay = document.getElementById('overlay');
const doorMessage = document.getElementById('message');
const signMessage = document.getElementById('sign-message');

const moveAmount = 4;
let x = 50;
let y = 600;
let currentDoor = null;
let currentSign = null;
let isPopupOpen = false;

let doorTouch = 0;
let signTouch = 0;

let lastCollision = null; // 마지막 충돌 타입: 'door', 'sign', 또는 null

const keysPressed = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false
};

const buttons = {
  ArrowLeft: document.getElementById('left'),
  ArrowUp: document.getElementById('up'),
  ArrowDown: document.getElementById('down'),
  ArrowRight: document.getElementById('right'),
  f: document.getElementById('f-key')  // F키 버튼
};

// 버튼에 pressed 클래스 추가/제거를 분리해서 처리
function addPressEffect(key) {
  const btn = buttons[key.toLowerCase()];
  if (!btn) return;
  btn.classList.add('pressed');
}

function removePressEffect(key) {
  const btn = buttons[key.toLowerCase()];
  if (!btn) return;
  btn.classList.remove('pressed');
}

function pressEffect(key) {
  addPressEffect(key);
  setTimeout(() => removePressEffect(key), 100);
}

function updatePosition() {
  const maxX = window.innerWidth - character.offsetWidth;
  const maxY = window.innerHeight - character.offsetHeight;
  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));
  character.style.left = `${x}px`;
  character.style.top = `${y}px`;
}

function getCollidingElement(nextX, nextY, targets) {
  const charRect = {
    left: nextX,
    right: nextX + character.offsetWidth,
    top: nextY,
    bottom: nextY + character.offsetHeight
  };

  for (const target of targets) {
    const rect = target.getBoundingClientRect();
    const gameRect = document.getElementById('game-area').getBoundingClientRect();
    const offsetX = rect.left - gameRect.left;
    const offsetY = rect.top - gameRect.top;

    if (!(charRect.right < offsetX ||
          charRect.left > offsetX + rect.width ||
          charRect.bottom < offsetY ||
          charRect.top > offsetY + rect.height)) {
      return target;
    }
  }
  return null;
}

function gameLoop() {
  if (!isPopupOpen) {
    let nextX = x;
    let nextY = y;

    if (keysPressed.ArrowLeft) nextX -= moveAmount;
    if (keysPressed.ArrowRight) nextX += moveAmount;
    if (keysPressed.ArrowUp) nextY -= moveAmount;
    if (keysPressed.ArrowDown) nextY += moveAmount;

    const collidedWall = getCollidingElement(nextX, nextY, walls);
    const collidedDoor = getCollidingElement(nextX, nextY, doors);
    const collidedSign = getCollidingElement(nextX, nextY, signs);

    if (!collidedWall) {
      x = nextX;
      y = nextY;
    }

    if (collidedDoor) {
      currentDoor = collidedDoor;
      doorTouch = 1;
      lastCollision = 'door';
    } else {
      currentDoor = null;
      doorTouch = 0;
      if (lastCollision === 'door') lastCollision = null;
    }

    if (collidedSign) {
      currentSign = collidedSign;
      signTouch = 1;
      lastCollision = 'sign';
    } else {
      currentSign = null;
      signTouch = 0;
      if (lastCollision === 'sign') lastCollision = null;
    }

    if (lastCollision === 'door' && doorTouch === 1) {
      doorMessage.classList.remove('hidden');
      signMessage.classList.add('hidden');
    } else if (lastCollision === 'sign' && signTouch === 1) {
      signMessage.classList.remove('hidden');
      doorMessage.classList.add('hidden');
    } else {
      doorMessage.classList.add('hidden');
      signMessage.classList.add('hidden');
    }

    updatePosition();
  }

  requestAnimationFrame(gameLoop);
}
gameLoop();

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (key in keysPressed && !keysPressed[key]) {
    keysPressed[key] = true;
    addPressEffect(key);
  }

  if ((key === 'f' || key === 'F') && doorTouch === 1 && !isPopupOpen) {
    addPressEffect('f');
    const link = currentDoor?.dataset.link;
    if (link) {
      window.open(link, '_blank');
      doorMessage.classList.add('hidden');
    }
  }

  if ((key === 'f' || key === 'F') && signTouch === 1 && !isPopupOpen) {
    addPressEffect('f');
    const signContent = currentSign?.dataset.content || '기본 팝업 내용입니다.';
    popupContent.textContent = signContent;
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
    isPopupOpen = true;
    signMessage.classList.add('hidden');
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key;
  if (key in keysPressed) {
    keysPressed[key] = false;
    removePressEffect(key);
  }
});

// 방향키 버튼 마우스/터치 이벤트로 키다운/keyup, 버튼 효과 동기화
['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'].forEach(key => {
  const btn = buttons[key];
  if (!btn) return;

  btn.addEventListener('mousedown', () => {
    if (!keysPressed[key]) {
      keysPressed[key] = true;
      addPressEffect(key);
    }
  });
  btn.addEventListener('mouseup', () => {
    if (keysPressed[key]) {
      keysPressed[key] = false;
      removePressEffect(key);
    }
  });
  btn.addEventListener('mouseleave', () => {
    if (keysPressed[key]) {
      keysPressed[key] = false;
      removePressEffect(key);
    }
  });
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!keysPressed[key]) {
      keysPressed[key] = true;
      addPressEffect(key);
    }
  }, {passive: false});
  btn.addEventListener('touchend', () => {
    if (keysPressed[key]) {
      keysPressed[key] = false;
      removePressEffect(key);
    }
  });
});

// F 버튼 클릭 시 효과 및 기능 실행 (단발 클릭)
buttons.f.addEventListener('click', () => {
  pressEffect('f');

  if (doorTouch === 1 && !isPopupOpen) {
    const link = currentDoor?.dataset.link;
    if (link) {
      window.open(link, '_blank');
      doorMessage.classList.add('hidden');
    }
  } else if (signTouch === 1 && !isPopupOpen) {
    const signContent = currentSign?.dataset.content || '기본 팝업 내용입니다.';
    popupContent.textContent = signContent;
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
    isPopupOpen = true;
    signMessage.classList.add('hidden');
  }
});

closePopup.onclick = () => {
  popup.classList.add('hidden');
  overlay.classList.add('hidden');
  isPopupOpen = false;
};
