const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const markup = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

class Element {
  constructor(className = '', elements = null) {
    this.children = [];
    this.elements = elements;
    this.dataset = {};
    this.listeners = {};
    this.attributes = {};
    this.textContent = '';
    this.className = className;
    this.classList = {
      add: (...names) => names.forEach(name => this.classes.add(name)),
      remove: (...names) => names.forEach(name => this.classes.delete(name)),
      contains: name => this.classes.has(name),
      toggle: (name, force) => {
        const enabled = force === undefined ? !this.classes.has(name) : force;
        if (enabled) this.classes.add(name);
        else this.classes.delete(name);
        return enabled;
      }
    };
    this.classes = new Set(className.split(/\s+/).filter(Boolean));
  }

  set className(value) {
    this._className = value;
    this.classes = new Set(value.split(/\s+/).filter(Boolean));
  }

  set id(value) { this._id = value; this.elements?.set(value, this); }
  get id() { return this._id; }
  get className() { return [...this.classes].join(' '); }
  set innerHTML(_) { this.children = []; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) {
    this.attributes[name] = value;
    if (name === 'id') this.id = value;
  }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { this.listeners.click?.({ preventDefault() {} }); }
  showModal() { this.open = true; }
  remove() {}
}

function createGame(savedState = null) {
  const elements = new Map();
  for (const [, id, classes] of markup.matchAll(/<[^>]+id="([^"]+)"[^>]*class="([^"]*)"/g)) {
    elements.set(id, new Element(classes, elements));
  }
  for (const [, id] of markup.matchAll(/<[^>]+id="([^"]+)"/g)) {
    if (!elements.has(id)) elements.set(id, new Element('', elements));
  }

  const documentListeners = {};
  const document = {
    getElementById: id => elements.get(id),
    createElement: () => new Element('', elements),
    querySelectorAll: selector => selector === '.key'
      ? [...elements.values()].flatMap(element => element.children)
        .flatMap(row => row.children || []).filter(element => element.classList.contains('key'))
      : [],
    addEventListener: (name, callback) => { documentListeners[name] = callback; },
    execCommand: () => true
  };
  const storage = new Map(savedState ? [['palavre-state-v1', JSON.stringify(savedState)]] : []);
  const clipboard = { text: '' };
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['1970-01-01T12:00:00Z'])); }
  }
  const context = {
    document,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    window: { scrollTo() {}, setTimeout: callback => { callback(); return 1; } },
    navigator: { clipboard: { writeText: async text => { clipboard.text = text; } } },
    Date: FixedDate,
    clearTimeout() {},
    setTimeout: callback => { callback(); return 1; },
    console
  };
  vm.runInNewContext(app, context);

  const press = key => {
    const button = document.querySelectorAll('.key').find(item => item.dataset.key === key);
    assert.ok(button, `tecla ${key} existe`);
    button.click();
  };
  const type = word => [...word].forEach(press);
  const state = () => JSON.parse(storage.get('palavre-state-v1'));
  return { elements, press, type, state, clipboard };
}

test('palavra inválida e repetida não gastam tentativas', () => {
  const game = createGame();
  game.elements.get('start-button').click();
  game.type('PANDA');
  game.press('ENTER');
  game.type('PANDA');
  game.press('ENTER');
  assert.match(game.elements.get('status-message').textContent, /já tentou/);
  assert.equal(game.elements.get('keyboard').attributes['aria-label'].startsWith('Teclado virtual. 1'), true);

  for (let index = 0; index < 5; index++) game.press('⌫');
  game.type('ZZZZZ');
  game.press('ENTER');
  assert.match(game.elements.get('status-message').textContent, /não está na lista/);
  assert.equal(game.state().days['1970-01-01'].guesses.length, 1);
});

test('avalia posições corretas, presentes e ausentes', () => {
  const game = createGame();
  game.elements.get('start-button').click();
  game.type('RATOS');
  game.press('ENTER');
  assert.equal(game.elements.get('tile-0-0').classList.contains('present'), true);
  assert.equal(game.elements.get('tile-0-1').classList.contains('absent'), true);
  assert.equal(game.elements.get('tile-0-2').classList.contains('present'), true);
});

test('salva e restaura uma partida em andamento', () => {
  const first = createGame();
  first.elements.get('start-button').click();
  first.type('RATOS');
  first.press('ENTER');
  const resumed = createGame(first.state());
  resumed.elements.get('start-button').click();
  assert.equal(resumed.elements.get('tile-0-0').textContent, 'R');
  assert.match(resumed.elements.get('status-message').textContent, /Continue/);
});

test('encerra após seis erros e registra a derrota', () => {
  const game = createGame();
  game.elements.get('start-button').click();
  for (const word of ['PANDA', 'RATOS', 'LIMAO', 'MANGA', 'ARROZ', 'MILHO']) {
    game.type(word);
    game.press('ENTER');
  }
  assert.equal(game.state().days['1970-01-01'].guesses.length, 6);
  assert.equal(game.state().stats.played, 1);
  assert.equal(game.state().stats.wins, 0);
  assert.equal(game.elements.get('answer-word').textContent, 'TIGRE');
});

test('vitória atualiza estatísticas e compartilha sem revelar a resposta', async () => {
  const game = createGame();
  game.elements.get('start-button').click();
  game.type('TIGRE');
  game.press('ENTER');
  assert.equal(game.elements.get('answer-word').textContent, 'TIGRE');
  assert.equal(game.state().stats.wins, 1);
  game.elements.get('share-button').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(game.clipboard.text);
  assert.equal(game.clipboard.text.includes('TIGRE'), false);
});
