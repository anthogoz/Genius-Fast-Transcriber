import type { DiffChunk } from '@/types';

export function computeDiff(original: string, modified: string): DiffChunk[] {
  const m = original.length;
  const n = modified.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === modified[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
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
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
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

export function highlightDifferences(originalText: string, correctedText: string): string {
  const MAX_DP_MATRIX_CELLS = 2_500_000;

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatWithVisibleNewLines(text: string): string {
    return escapeHtml(text).replace(
      /\n/g,
      '<span style="opacity: 0.5; font-size: 0.8em;">↵</span>\n',
    );
  }

  function highlightSingleChunk(type: 'added' | 'removed', text: string): string {
    const formatted = formatWithVisibleNewLines(text);
    if (type === 'removed') {
      return `<span style="background-color: #ffcccc; color: #cc0000; text-decoration: line-through; border-radius: 2px;">${formatted}</span>`;
    }
    return `<span style="background-color: #ccffcc; color: #006600; font-weight: bold; border-radius: 2px;">${formatted}</span>`;
  }

  const matrixCells = (originalText.length + 1) * (correctedText.length + 1);
  if (matrixCells > MAX_DP_MATRIX_CELLS) {
    let prefix = 0;
    const originalLength = originalText.length;
    const correctedLength = correctedText.length;

    while (
      prefix < originalLength
      && prefix < correctedLength
      && originalText[prefix] === correctedText[prefix]
    ) {
      prefix++;
    }

    let suffix = 0;
    while (
      suffix < originalLength - prefix
      && suffix < correctedLength - prefix
      && originalText[originalLength - 1 - suffix] === correctedText[correctedLength - 1 - suffix]
    ) {
      suffix++;
    }

    const commonPrefix = correctedText.slice(0, prefix);
    const commonSuffix = correctedText.slice(correctedLength - suffix);
    const removedMiddle = originalText.slice(prefix, originalLength - suffix);
    const addedMiddle = correctedText.slice(prefix, correctedLength - suffix);

    let html = formatWithVisibleNewLines(commonPrefix);
    if (removedMiddle) {
      html += highlightSingleChunk('removed', removedMiddle);
    }
    if (addedMiddle) {
      html += highlightSingleChunk('added', addedMiddle);
    }
    html += formatWithVisibleNewLines(commonSuffix);
    return html;
  }

  const diffChunks = computeDiff(originalText, correctedText);
  let html = '';

  for (const chunk of diffChunks) {
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
