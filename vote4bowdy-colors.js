/* Vote4Bowdy worker colors. Load after the existing page script. */
(function () {
  const COLORS = ['#ff6575','#36d8f3','#36df91','#ffc44d','#bd87ff','#f48bb9','#fb923c'];
  const label = ['Red','Blue','Green','Gold','Purple','Pink','Orange'];
  const colorKey = 'v4bColor';
  const getColor = () => localStorage.getItem(colorKey) || '#ff6575';
  const esc = s => String(s || '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function choiceUI() {
    const name = document.getElementById('name');
    if (!name || document.getElementById('colorChoices')) return;
    const wrap = document.createElement('div');
    wrap.id = 'colorChoices';
    wrap.className = 'v4b-colors';
    wrap.innerHTML = '<div class="v4b-color-label">Route color</div>' + COLORS.map((c,i)=>'<button type="button" class="v4b-color" data-color="'+c+'" title="'+label[i]+'" aria-label="'+label[i]+'" style="background:'+c+'"></button>').join('');
    name.closest('.name').insertAdjacentElement('afterend',wrap);
    function select(c) { localStorage.setItem(colorKey,c); wrap.querySelectorAll('.v4b-color').forEach(b=>b.classList.toggle('selected',b.dataset.color===c)); }
    wrap.querySelectorAll('.v4b-color').forEach(b=>b.addEventListener('click',()=>select(b.dataset.color)));
    select(getColor());
  }
  function patchSupabase() {
    if (!window.sb || window.__v4bColorPatched) return;
    window.__v4bColorPatched = true;
    const originalFrom = window.sb.from.bind(window.sb);
    window.sb.from = function(table) {
      const query = originalFrom(table);
      if (table !== 'v4b_workers') return query;
      const originalInsert = query.insert.bind(query), originalUpdate = query.update.bind(query);
      query.insert = function(values, ...rest) {
        const add = v => ({...v, color: v.color || getColor()});
        return originalInsert(Array.isArray(values) ? values.map(add) : add(values), ...rest);
      };
      query.update = function(values, ...rest) { return originalUpdate({...values, color: values.color || getColor()}, ...rest); };
      return query;
    };
  }
  function managerColors() {
    if (!window.map || !window.sb || window.__v4bManagerColors) return;
    window.__v4bManagerColors = true;
    const originalFrom = window.sb.from.bind(window.sb);
    window.sb.from = function(table) {
      const q = originalFrom(table);
      if (table !== 'v4b_workers') return q;
      const originalSelect = q.select.bind(q);
      q.select = function(...args) { return originalSelect(...args).then ? originalSelect(...args) : originalSelect(...args); };
      return q;
    };
  }
  const style = document.createElement('style');
  style.textContent = '.v4b-colors{margin:8px 0 3px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}.v4b-color-label{width:100%;font-size:10px;color:#91a4c2;text-transform:uppercase;letter-spacing:.1em;font-weight:800}.v4b-color{width:27px;height:27px;border:2px solid transparent;border-radius:50%;padding:0;cursor:pointer;box-shadow:0 0 0 1px #425575}.v4b-color.selected{border-color:#fff;box-shadow:0 0 0 3px #ffffff55}.v4b-color:focus-visible{outline:2px solid #fff;outline-offset:3px}@media(max-width:620px){.v4b-color{width:32px;height:32px}}';
  document.head.appendChild(style);
  function boot(){ choiceUI(); patchSupabase(); managerColors(); }
  document.addEventListener('DOMContentLoaded', boot); setTimeout(boot,700); setTimeout(boot,1600);
})();
