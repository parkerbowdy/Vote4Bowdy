/* Vote4Bowdy assigned worker colors — load after the main page script. */
(function () {
  const PALETTE = ['#ff6575','#36d8f3','#36df91','#ffc44d','#bd87ff','#f48bb9','#fb923c'];
  const DEFAULT = '#ff6575';
  const normalize = c => /^#[0-9a-fA-F]{6}$/.test(String(c || '')) ? c : DEFAULT;

  async function assignColor() {
    if (!window.sb || !window.workerId) return;
    try {
      const { data, error } = await window.sb
        .from('v4b_workers')
        .select('id,color,created_at')
        .eq('campaign', 'jeffersontown')
        .order('created_at', { ascending: true });
      if (error) throw error;
      const mine = (data || []).find(w => w.id === window.workerId);
      if (!mine) return;
      if (/^#[0-9a-fA-F]{6}$/.test(String(mine.color || ''))) {
        localStorage.setItem('v4bAssignedColor', mine.color);
        return;
      }
      const used = new Set((data || []).filter(w => w.id !== window.workerId).map(w => normalize(w.color)));
      const color = PALETTE.find(c => !used.has(c)) || PALETTE[(data || []).findIndex(w => w.id === window.workerId) % PALETTE.length] || DEFAULT;
      const { error: updateError } = await window.sb.from('v4b_workers').update({ color }).eq('id', window.workerId);
      if (updateError) throw updateError;
      localStorage.setItem('v4bAssignedColor', color);
    } catch (error) {
      console.warn('Could not assign a worker color:', error.message);
    }
  }

  function hidePicker() {
    const picker = document.getElementById('colorChoices');
    if (picker) picker.remove();
  }

  function boot() {
    hidePicker();
    assignColor();
  }

  document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 900);
  setTimeout(boot, 2200);
})();
