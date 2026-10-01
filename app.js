const form = document.querySelector('#requestForm');
const output = document.querySelector('#responseOutput');
const initialResponse = {
  users: [
    { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
    { id: 2, name: 'Grace Hopper', role: 'Scientist' },
  ],
  total: 2,
};

let lastResponse = initialResponse;

function displayJson(data) {
  const escaped = JSON.stringify(data, null, 2)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replace(/("(?:\\.|[^"\\])*")(?=\s*:)/g, '<span class="json-key">$1</span>')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="json-string">$1</span>')
    .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="json-number">$1</span>');
  output.innerHTML = `<code>${escaped}</code>`;
}

function setLoading(loading) {
  const button = form.querySelector('.send-button span');
  button.textContent = loading ? 'Running…' : 'Run test';
  form.querySelector('.send-button').disabled = loading;
}

async function runRequest(event) {
  event?.preventDefault();
  setLoading(true);
  const started = performance.now();
  const url = document.querySelector('#url').value.trim();
  const method = document.querySelector('#method').value;
  let status = 200;
  let statusText = 'OK';
  let data;
  let error = null;

  try {
    if (url.startsWith('demo://')) {
      await new Promise(resolve => setTimeout(resolve, 420));
      data = initialResponse;
    } else {
      const headers = {};
      document.querySelectorAll('.key-value-row').forEach(row => {
        const fields = row.querySelectorAll('input');
        if (fields[0].value.trim()) headers[fields[0].value.trim()] = fields[1].value.trim();
      });
      const options = { method, headers };
      if (!['GET', 'DELETE'].includes(method)) options.body = document.querySelector('#requestBody').value;
      const response = await fetch(url, options);
      status = response.status;
      statusText = response.statusText;
      const text = await response.text();
      try { data = JSON.parse(text); } catch { data = { response: text }; }
    }
  } catch (requestError) {
    error = requestError;
    status = 0;
    statusText = 'NETWORK ERROR';
    data = { error: requestError.message, hint: 'The target may not allow cross-origin browser requests.' };
  }

  const elapsed = Math.round(performance.now() - started);
  lastResponse = data;
  displayJson(data);
  updateResults(status, statusText, elapsed, data, error);
  setLoading(false);
  document.querySelector('#runCount').textContent = Number(document.querySelector('#runCount').textContent) + 1;
}

function updateResults(status, statusText, elapsed, data, error) {
  const expectedStatus = Number(document.querySelector('#expectedStatus').value);
  const expectedTime = Number(document.querySelector('#expectedTime').value);
  const bodyNeedle = document.querySelector('#expectedBody').value;
  const checks = [status === expectedStatus, elapsed < expectedTime, JSON.stringify(data).includes(bodyNeedle)];
  const passed = checks.filter(Boolean).length;
  const success = passed === checks.length && !error;
  document.querySelectorAll('.assertion-icon').forEach((icon, index) => {
    icon.textContent = checks[index] ? '✓' : '×';
    icon.classList.toggle('failed', !checks[index]);
  });
  const banner = document.querySelector('#resultBanner');
  banner.classList.toggle('failed', !success);
  banner.querySelector('.result-check').textContent = success ? '✓' : '×';
  document.querySelector('#resultTitle').textContent = success ? 'All checks passed' : 'Some checks failed';
  document.querySelector('#resultSubtitle').textContent = `${passed} of ${checks.length} assertions completed successfully`;
  document.querySelector('#resultTime').textContent = 'Just now';
  const badge = document.querySelector('#statusBadge');
  badge.textContent = `${status || '—'} ${statusText}`;
  badge.classList.toggle('bad', status < 200 || status >= 300);
  document.querySelector('#timeBadge').textContent = `${elapsed} ms`;
  document.querySelector('#sizeBadge').textContent = `${(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB`;
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === tab));
  document.querySelector('#headersPanel').classList.toggle('hidden', tab.dataset.tab !== 'headers');
  document.querySelector('#bodyPanel').classList.toggle('hidden', tab.dataset.tab !== 'body');
}));

document.querySelector('#addHeader').addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'key-value-row';
  row.innerHTML = '<input aria-label="Header name" placeholder="Header" /><input aria-label="Header value" placeholder="Value" /><button type="button" class="remove-row" aria-label="Remove header">×</button>';
  document.querySelector('#headersPanel').insertBefore(row, document.querySelector('#addHeader'));
});

document.addEventListener('click', event => {
  if (event.target.matches('.remove-row')) event.target.parentElement.remove();
});

document.querySelector('#resetButton').addEventListener('click', () => {
  form.reset();
  document.querySelector('#url').value = 'demo://users';
  displayJson(initialResponse);
  updateResults(200, 'OK', 128, initialResponse, null);
});

document.querySelector('#copyButton').addEventListener('click', async () => {
  await navigator.clipboard.writeText(JSON.stringify(lastResponse, null, 2));
  const toast = document.querySelector('#toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
});

document.querySelector('#themeToggle').addEventListener('click', () => document.body.classList.toggle('dark'));
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') runRequest(event);
});
form.addEventListener('submit', runRequest);
