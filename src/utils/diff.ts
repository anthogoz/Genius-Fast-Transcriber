import type { DiffChunk } from '@/types';

export function computeDiff(original: string, modified: string): DiffChunk[] {
  const m = original.length;
  const n = modified.length;

  // Use Int32Array to save memory on large strings
  const dp = new Int32Array((m + 1) * (n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === modified[j - 1]) {
        dp[i * (n + 1) + j] = dp[(i - 1) * (n + 1) + (j - 1)] + 1;
      } else {
        dp[i * (n + 1) + j] = Math.max(
          dp[(i - 1) * (n + 1) + j],
          dp[i * (n + 1) + (j - 1)],
        );
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = m;
  let j = n;
  let currentCommon = '';
  let currentAdded = '';
  let currentRemoved = '';

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
      if (currentAdded) {
        chunks.unshift({ type: 'added', value: currentAdded });
        currentAdded = '';
      }
      if (currentRemoved) {
        chunks.unshift({ type: 'removed', value: currentRemoved });
        currentRemoved = '';
      }
      currentCommon = original[i - 1] + currentCommon;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])) {
      if (currentCommon) {
        chunks.unshift({ type: 'common', value: currentCommon });
        currentCommon = '';
      }
      if (currentRemoved) {
        chunks.unshift({ type: 'removed', value: currentRemoved });
        currentRemoved = '';
      }
      currentAdded = modified[j - 1] + currentAdded;
      j--;
    } else {
      if (currentCommon) {
        chunks.unshift({ type: 'common', value: currentCommon });
        currentCommon = '';
      }
      if (currentAdded) {
        chunks.unshift({ type: 'added', value: currentAdded });
        currentAdded = '';
      }
      currentRemoved = original[i - 1] + currentRemoved;
      i--;
    }
  }

  if (currentCommon) chunks.unshift({ type: 'common', value: currentCommon });
  if (currentAdded) chunks.unshift({ type: 'added', value: currentAdded });
  if (currentRemoved) chunks.unshift({ type: 'removed', value: currentRemoved });

  return chunks;
}

function computeLineDiff(original: string, modified: string): DiffChunk[] {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  const m = originalLines.length;
  const n = modifiedLines.length;

  const dp = new Int32Array((m + 1) * (n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (originalLines[i - 1] === modifiedLines[j - 1]) {
        dp[i * (n + 1) + j] = dp[(i - 1) * (n + 1) + (j - 1)] + 1;
      } else {
        dp[i * (n + 1) + j] = Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
      const line = `${originalLines[i - 1]}${i < m ? '\n' : ''}`;
      if (chunks.length > 0 && chunks[0].type === 'common') {
        chunks[0].value = line + chunks[0].value;
      } else {
        chunks.unshift({ type: 'common', value: line });
      }
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])) {
      const line = `${modifiedLines[j - 1]}${j < n ? '\n' : ''}`;
      if (chunks.length > 0 && chunks[0].type === 'added') {
        chunks[0].value = line + chunks[0].value;
      } else {
        chunks.unshift({ type: 'added', value: line });
      }
      j--;
    } else {
      const line = `${originalLines[i - 1]}${i < m ? '\n' : ''}`;
      if (chunks.length > 0 && chunks[0].type === 'removed') {
        chunks[0].value = line + chunks[0].value;
      } else {
        chunks.unshift({ type: 'removed', value: line });
      }
      i--;
    }
  }
  return chunks;
}


export function highlightDifferences(originalText: string, correctedText: string): string {
  const MAX_DP_MATRIX_CELLS = 2_500_000;

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatWithVisibleNewLines(text: string): string {
    return escapeHtml(text).replace(
      /\n/g,
      '<span style="opacity: 0.5; font-size: 0.8em;">↵</span>\n',
    );
  }

  const matrixCells = (originalText.length + 1) * (correctedText.length + 1);
  const diffChunks = matrixCells > MAX_DP_MATRIX_CELLS
    ? computeLineDiff(originalText, correctedText)
    : computeDiff(originalText, correctedText);

  let html = '';

  for (let k = 0; k < diffChunks.length; k++) {
    const chunk = diffChunks[k];
    const escapedValue = formatWithVisibleNewLines(chunk.value);

    if (chunk.type === 'removed') {
      html += `<span style="background-color: #ffcccc; color: #cc0000; text-decoration: line-through; border-radius: 2px;">${escapedValue}</span>`;
    } else if (chunk.type === 'added') {
      html += `<span style="background-color: #ccffcc; color: #006600; font-weight: bold; border-radius: 2px;">${escapedValue}</span>`;
    } else {
      html += escapedValue;
    }
  }

  return html;
}

