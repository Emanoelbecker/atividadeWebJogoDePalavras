(() => {
  'use strict';

  const WORD_LENGTH = 5;
  const MAX_ATTEMPTS = 6;
  const STORAGE_KEY = 'palavre-state-v1';
  const ROWS = ['QWERTYUIOP'.split(''), 'ASDFGHJKL'.split(''), ['ENTER', ...'ZXCVBNM'.split(''), '⌫']];
  const PUZZLES = [
    { word: 'TIGRE', category: 'Animais' }, { word: 'PRATO', category: 'Comida' },
    { word: 'ATOMO', category: 'Ciência' }, { word: 'NADAR', category: 'Esportes' },
    { word: 'ZEBRA', category: 'Animais' }, { word: 'MELAO', category: 'Comida' },
    { word: 'NUTRI', category: 'Ciência' }, { word: 'GOLFE', category: 'Esportes' },
    { word: 'COBRA', category: 'Animais' }, { word: 'CACAU', category: 'Comida' },
    { word: 'LASER', category: 'Ciência' }, { word: 'RUGBY', category: 'Esportes' },
    { word: 'RATOS', category: 'Animais' }, { word: 'PIZZA', category: 'Comida' },
    { word: 'LASER', category: 'Ciência' }, { word: 'RUGBY', category: 'Esportes' }
  ];
  // Todas as respostas têm cinco letras; entradas de demonstração são mantidas simples e sem acentos.
  const VALID_WORDS = new Set([
    ...PUZZLES.map(p => p.word), 'PANDA','LOUVA','CAVALO','LEOES','GATOS','CACHO','PERAS','UVAAS',
    'BANCO','LIMAO','MANGA','ARROZ','MILHO','PAPEL','LIVRO','NADAR','CORRE','TENIS','FUTEBOL',
    'MARTE','SOLAR','PLANO','FISCA','SABER','TERRA','NUVEM','VENTO','FOLHA','FLORA','FAUNA',
    'FELIZ','AMIGO','CASAS','BOLAS','PNEUS','SINAL','PONTO','PULSO','SOMAR','LINHA','SONHO'
  ]);
  const $ = id => document.getElementById(id);
  const views = { home: $('home-view'), game: $('game-view'), result: $('result-view') };
  let state = loadState();
  let puzzle = getPuzzleForToday();
  let guesses = [];
  let currentGuess = '';
  let finished = false;
  let keyStates = {};
  let messageTimer;

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }
  function dayNumber(dateString) {
    const [y,m,d] = dateString.split('-').map(Number);
    return Math.floor(Date.UTC(y,m-1,d) / 86400000);
  }
  function getPuzzleForToday() {
    const day = dayNumber(todayKey());
    return PUZZLES[((day % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];
  }
  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && parsed.days && parsed.stats) return parsed;
    } catch (_) {}
    return { days: {}, stats: { played: 0, wins: 0, streak: 0, bestStreak: 0, lastPlayed: null, lastWin: null, lastWord: null } };
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { showMessage('Não foi possível salvar neste navegador.', true); }
  }
  function normalize(word) {
    return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
  }
  function evaluateGuess(guess, answer) {
    const result = Array(WORD_LENGTH).fill('absent');
    const remaining = answer.split('');
    // Primeiro marca letras na posição correta.
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === answer[i]) { result[i] = 'correct'; remaining[i] = null; }
    }
    // Depois consome apenas ocorrências ainda disponíveis, lidando com letras repetidas.
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] === 'correct') continue;
      const index = remaining.indexOf(guess[i]);
      if (index !== -1) { result[i] = 'present'; remaining[index] = null; }
    }
    return result;
  }
  function getDayRecord() { return state.days[todayKey()] || null; }
  function showView(name) {
    Object.entries(views).forEach(([key, element]) => element.classList.toggle('hidden', key !== name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function updateHome() {
    $('home-category').textContent = puzzle.category;
    const stats = state.stats;
    $('home-streak').textContent = stats.streak || 0;
    $('home-wins').textContent = stats.played ? `${Math.round(stats.wins / stats.played * 100)}%` : '0%';
    $('home-played').textContent = stats.played || 0;
    $('start-button').textContent = getDayRecord() ? 'Ver resultado de hoje →' : 'Jogar agora →';
  }
  function setupGame() {
    const record = getDayRecord();
    guesses = record ? [...record.guesses] : [];
    currentGuess = '';
    finished = !!(record && record.finished);
    keyStates = {};
    guesses.forEach(guess => mergeKeyStates(guess, evaluateGuess(guess, puzzle.word)));
    $('game-title').textContent = puzzle.category;
    $('today-date').textContent = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
    buildBoard();
    buildKeyboard();
    renderBoard();
    renderKeyboard();
    if (finished) showMessage(record.won ? 'Você já encontrou a palavra de hoje!' : 'Desafio concluído. Volte amanhã!');
    else showMessage(guesses.length ? 'Continue de onde parou.' : 'Sua primeira tentativa começa agora.');
  }
  function buildBoard() {
    const board = $('board'); board.innerHTML = '';
    for (let r = 0; r < MAX_ATTEMPTS; r++) {
      const row = document.createElement('div'); row.className = 'board-row'; row.setAttribute('role','row');
      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement('div'); tile.className = 'tile'; tile.setAttribute('role','gridcell');
        tile.id = `tile-${r}-${c}`; row.appendChild(tile);
      }
      board.appendChild(row);
    }
  }
  function buildKeyboard() {
    const keyboard = $('keyboard'); keyboard.innerHTML = '';
    ROWS.forEach(keys => {
      const row = document.createElement('div'); row.className = 'keyboard-row';
      keys.forEach(key => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'key';
        button.textContent = key === '⌫' ? '⌫' : key === 'ENTER' ? 'ENVIAR' : key;
        if (key === 'ENTER' || key === '⌫') button.classList.add('wide');
        button.setAttribute('aria-label', key === '⌫' ? 'Apagar letra' : key === 'ENTER' ? 'Enviar tentativa' : key);
        button.addEventListener('click', () => handleKey(key));
        button.dataset.key = key;
        row.appendChild(button);
      });
      keyboard.appendChild(row);
    });
  }
  function renderBoard() {
    for (let r = 0; r < MAX_ATTEMPTS; r++) {
      const committed = guesses[r];
      const evaluation = committed ? evaluateGuess(committed, puzzle.word) : null;
      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = $(`tile-${r}-${c}`);
        tile.className = 'tile';
        const letter = committed ? committed[c] : (r === guesses.length ? currentGuess[c] : '');
        tile.textContent = letter || '';
        if (committed) tile.classList.add(evaluation[c]);
        else if (letter) tile.classList.add('filled');
      }
    }
    $('keyboard').setAttribute('aria-label', `Teclado virtual. ${guesses.length} de ${MAX_ATTEMPTS} tentativas usadas.`);
  }
  function mergeKeyStates(guess, result) {
    guess.split('').forEach((letter, i) => {
      const rank = { absent: 1, present: 2, correct: 3 };
      if (!keyStates[letter] || rank[result[i]] > rank[keyStates[letter]]) keyStates[letter] = result[i];
    });
  }
  function renderKeyboard() {
    document.querySelectorAll('.key').forEach(button => {
      button.classList.remove('correct','present','absent');
      const status = keyStates[button.dataset.key];
      if (status) button.classList.add(status);
    });
  }
  function showMessage(message, isError = false) {
    const el = $('status-message');
    el.textContent = message;
    el.classList.toggle('error', isError);
    clearTimeout(messageTimer);
  }
  function handleKey(key) {
    if (finished) return;
    if (key === 'ENTER') { submitGuess(); return; }
    if (key === '⌫' || key === 'BACKSPACE') { currentGuess = currentGuess.slice(0,-1); renderBoard(); return; }
    const letter = normalize(key);
    if (/^[A-Z]$/.test(letter) && currentGuess.length < WORD_LENGTH) {
      currentGuess += letter; renderBoard();
    }
  }
  function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) { showMessage('Digite uma palavra com 5 letras.', true); return; }
    if (!VALID_WORDS.has(currentGuess)) { showMessage('Essa palavra não está na lista. Tente outra.', true); return; }
    if (guesses.includes(currentGuess)) { showMessage('Você já tentou essa palavra.', true); return; }
    guesses.push(currentGuess);
    const evaluation = evaluateGuess(currentGuess, puzzle.word);
    mergeKeyStates(currentGuess, evaluation);
    currentGuess = '';
    const won = guesses[guesses.length - 1] === puzzle.word;
    const lost = !won && guesses.length >= MAX_ATTEMPTS;
    if (won || lost) {
      finished = true;
      recordResult(won);
      renderBoard(); renderKeyboard();
      window.setTimeout(() => showResult(won), 320);
    } else {
      saveInProgress();
      renderBoard(); renderKeyboard();
      showMessage('Boa! Use as cores para a próxima tentativa.');
    }
  }
  function saveInProgress() {
    state.days[todayKey()] = { guesses: [...guesses], finished: false, won: false, category: puzzle.category };
    saveState();
  }
  function recordResult(won) {
    const today = todayKey();
    if (state.days[today] && state.days[today].finished) return;
    const stats = state.stats;
    const yesterday = new Date(dayNumber(today) * 86400000 - 86400000).toISOString().slice(0,10);
    stats.played += 1;
    if (won) {
      stats.wins += 1;
      stats.streak = stats.lastPlayed === yesterday ? stats.streak + 1 : 1;
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
      stats.lastWin = today;
    } else {
      stats.streak = 0;
    }
    stats.lastPlayed = today;
    stats.lastWord = puzzle.word;
    state.days[today] = { guesses: [...guesses], finished: true, won, category: puzzle.category, answer: puzzle.word };
    saveState();
  }
  function showResult(won) {
    $('result-symbol').textContent = won ? '✦' : '↻';
    $('result-title').textContent = won ? 'Você conseguiu!' : 'Quase lá!';
    $('result-description').textContent = won ? 'Mandou bem! Você descobriu a palavra do dia.' : 'O desafio de hoje terminou. Amanhã tem uma nova palavra.';
    $('answer-word').textContent = puzzle.word;
    $('answer-category').textContent = puzzle.category;
    $('result-attempts').textContent = `${guesses.length}/6`;
    $('result-streak').textContent = state.stats.streak;
    $('result-winrate').textContent = `${state.stats.played ? Math.round(state.stats.wins / state.stats.played * 100) : 0}%`;
    $('share-feedback').textContent = '';
    showView('result');
    updateHome();
  }
  function makeShareText() {
    const record = getDayRecord();
    const symbols = record.guesses.map(guess => evaluateGuess(guess, puzzle.word).map(status => ({ correct: '🟩', present: '🟨', absent: '⬛' }[status])).join(''));
    return `Palavre ${todayKey()} ${record.won ? record.guesses.length : 'X'}/6\\nTema: ${puzzle.category}\\n${symbols.join('\\n')}\\nJogue o desafio diário!`;
  }
  async function shareResult() {
    const text = makeShareText();
    try {
      if (navigator.share) { await navigator.share({ title: 'Meu resultado no Palavre', text }); $('share-feedback').textContent = 'Resultado compartilhado!'; }
      else if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); $('share-feedback').textContent = 'Resultado copiado. Pode compartilhar com seus amigos!'; }
      else {
        const area = document.createElement('textarea'); area.value = text; area.setAttribute('readonly',''); area.style.position='absolute'; area.style.left='-9999px'; document.body.appendChild(area); area.select();
        const copied = document.execCommand('copy'); area.remove();
        $('share-feedback').textContent = copied ? 'Resultado copiado. Pode compartilhar com seus amigos!' : 'Não foi possível copiar automaticamente.';
      }
    } catch (error) {
      if (error && error.name !== 'AbortError') $('share-feedback').textContent = 'Não foi possível compartilhar. Tente novamente.';
    }
  }
  function updateStatsDialog() {
    const s = state.stats, rate = s.played ? Math.round(s.wins / s.played * 100) : 0;
    $('stat-played').textContent = s.played; $('stat-wins').textContent = s.wins; $('stat-rate').textContent = `${rate}%`;
    $('stat-streak').textContent = s.streak; $('stat-best').textContent = s.bestStreak; $('stat-last').textContent = s.lastWord || '—';
  }
  function openToday() {
    setupGame();
    const record = getDayRecord();
    if (record && record.finished) { showResult(record.won); return; }
    showView('game');
  }

  $('start-button').addEventListener('click', openToday);
  $('brand-home').addEventListener('click', event => { event.preventDefault(); updateHome(); showView('home'); });
  $('back-home').addEventListener('click', () => { updateHome(); showView('home'); });
  $('result-home').addEventListener('click', () => { updateHome(); showView('home'); });
  $('share-button').addEventListener('click', shareResult);
  $('help-open').addEventListener('click', () => $('help-dialog').showModal());
  $('game-help').addEventListener('click', () => $('help-dialog').showModal());
  $('stats-open').addEventListener('click', () => { updateStatsDialog(); $('stats-dialog').showModal(); });
  document.addEventListener('keydown', event => {
    if (!$('game-view').classList.contains('hidden') && !$('help-dialog').open && !$('stats-dialog').open) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Enter') handleKey('ENTER');
      else if (event.key === 'Backspace') handleKey('BACKSPACE');
      else if (/^[a-zA-ZÀ-ÿ]$/.test(event.key)) handleKey(event.key);
    }
  });
  updateHome();
  // Mostra uma partida concluída do dia sem permitir uma segunda.
  if (getDayRecord() && getDayRecord().finished) $('start-button').textContent = 'Ver resultado de hoje →';
})();
