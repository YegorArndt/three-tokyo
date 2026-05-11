import { scenes, scenesById } from './scenes';
import type { SceneDef } from './scenes/types';

type PanelArgs = {
  onSelect: (def: SceneDef) => void;
};

const DEFAULT_ID = 'tokyo';

function readHashId(): string {
  const m = window.location.hash.match(/^#\/([\w-]+)$/);
  return m && scenesById.has(m[1]) ? m[1] : DEFAULT_ID;
}

function writeHashId(id: string) {
  const next = `#/${id}`;
  if (window.location.hash !== next) {
    history.replaceState(null, '', next);
  }
}

export function mountPanel({ onSelect }: PanelArgs) {
  const root = document.createElement('aside');
  root.id = 'panel';
  root.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">three-tokyo</div>
      <div class="panel-sub">Three.js scene gallery</div>
    </div>
    <ul class="panel-list" role="list"></ul>
    <div class="panel-footer">
      <a href="https://github.com/YegorArndt/three-tokyo" target="_blank" rel="noopener">GitHub →</a>
    </div>
  `;
  document.body.appendChild(root);

  const list = root.querySelector<HTMLUListElement>('.panel-list');
  if (!list) throw new Error('panel-list missing');

  const items = new Map<string, HTMLLIElement>();
  for (const def of scenes) {
    const li = document.createElement('li');
    li.className = 'panel-item';
    li.dataset.id = def.id;
    li.innerHTML = `
      <button type="button" class="panel-btn">
        <span class="panel-label">${def.label}</span>
        <span class="panel-blurb">${def.blurb}</span>
      </button>
    `;
    li.addEventListener('click', () => {
      writeHashId(def.id);
      select(def.id);
    });
    list.appendChild(li);
    items.set(def.id, li);
  }

  function select(id: string) {
    const def = scenesById.get(id);
    if (!def) return;
    for (const [otherId, el] of items) {
      el.classList.toggle('active', otherId === id);
    }
    onSelect(def);
  }

  window.addEventListener('hashchange', () => {
    select(readHashId());
  });

  const initialId = readHashId();
  writeHashId(initialId);
  select(initialId);

  const toggle = document.createElement('button');
  toggle.id = 'panel-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Toggle scene panel');
  toggle.textContent = '☰';
  toggle.addEventListener('click', () => root.classList.toggle('open'));
  document.body.appendChild(toggle);
}
