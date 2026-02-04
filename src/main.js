import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('memo-input');
  const craftBtn = document.getElementById('craft-btn');
  const adminModeCheckbox = document.getElementById('admin-mode');

  // Load saved memos
  loadMemos();

  craftBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      alert('Please write something on the sign!');
      return;
    }

    const selectedWood = document.querySelector('input[name="wood"]:checked').value;

    // Create new memo object
    const newMemo = {
      id: Date.now().toString(), // Unique ID
      text: text,
      woodType: selectedWood,
      timestamp: Date.now()
    };

    addMemoToBoard(newMemo);
    saveMemo(newMemo);

    input.value = '';
  });

  // Allow Ctrl+Enter to submit
  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      craftBtn.click();
    }
  });

  // Admin Mode Toggle
  adminModeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      const password = prompt('Enter Admin Password:');
      if (password === '20240623') {
        document.body.classList.add('admin-active');
      } else {
        alert('Incorrect password!');
        e.target.checked = false; // Uncheck the box
      }
    } else {
      document.body.classList.remove('admin-active');
    }
  });
});

function addMemoToBoard(memo) {
  const columnId = `stack-${memo.woodType}`;
  const column = document.getElementById(columnId);

  if (!column) {
    console.error(`Column not found for wood type: ${memo.woodType}`);
    return;
  }

  const sign = document.createElement('div');
  sign.classList.add('sign', memo.woodType);
  sign.dataset.id = memo.id; // Store ID on element for reference

  // Sign Content
  const textSpan = document.createElement('span');
  textSpan.textContent = memo.text;
  sign.appendChild(textSpan);

  // Delete Button
  const deleteBtn = document.createElement('div');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = 'X';
  deleteBtn.title = 'Delete Note';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent bubbling
    if (confirm('Delete this note?')) {
      deleteMemo(memo.id);
      sign.remove();
    }
  });
  sign.appendChild(deleteBtn);

  // Animation for placing
  sign.style.opacity = '0';
  sign.style.transform = 'translateY(-20px)';
  sign.style.transition = 'all 0.3s ease';

  column.appendChild(sign);

  // Trigger animation
  requestAnimationFrame(() => {
    sign.style.opacity = '1';
    sign.style.transform = 'translateY(0)';
  });
}

function saveMemo(memo) {
  const memos = getMemos();
  memos.push(memo);
  localStorage.setItem('minecraft-memos', JSON.stringify(memos));
}

function deleteMemo(id) {
  const memos = getMemos();
  const updatedMemos = memos.filter(m => m.id !== id);
  localStorage.setItem('minecraft-memos', JSON.stringify(updatedMemos));
}

function getMemos() {
  return JSON.parse(localStorage.getItem('minecraft-memos') || '[]');
}

function loadMemos() {
  let memos = getMemos();
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  // Auto-delete logic: Filter out old memos
  const freshMemos = memos.filter(memo => {
    // Handle legacy memos (which might not have timestamp or id)
    // If no timestamp, give it one now (or delete? let's keep it to be safe)
    if (!memo.timestamp) return true;

    return (now - memo.timestamp) < oneWeekMs;
  });

  // If we filtered anything out, update storage
  if (freshMemos.length !== memos.length) {
    localStorage.setItem('minecraft-memos', JSON.stringify(freshMemos));
    console.log(`Auto-deleted ${memos.length - freshMemos.length} old memos.`);
  }

  freshMemos.forEach(memo => {
    // Legacy support: ensure ID exists if missing
    if (!memo.id) memo.id = Date.now().toString() + Math.random();
    addMemoToBoard(memo);
  });
}
