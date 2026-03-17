import type { DiffChunk } from '@/types';

export function computeDiff(original: string, modified: string): DiffChunk[] {
  const m = original.length;
  const n = modified.length;
  const dp = new Int32Array((m + 1) * (n + 1));

  for (let i = 1; i <= m; i++) {
    const row = i * (n + 1);
    const prevRow = (i - 1) * (n + 1);
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === modified[j - 1]) {
        dp[row + j] = dp[prevRow + (j - 1)] + 1;
      } else {
        dp[row + j] = Math.max(dp[prevRow + j], dp[row + (j - 1)]);
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = m;
  let j = n;

  let currentCommon: string[] = [];
  let currentAdded: string[] = [];
  let currentRemoved: string[] = [];

  const flush = (type: 'added' | 'removed' | 'common' | 'all') => {
    if ((type === 'common' || type === 'all') && currentCommon.length > 0) {
      chunks.push({ type: 'common', value: currentCommon.reverse().join('') });
      currentCommon = [];
    }
    if ((type === 'added' || type === 'all') && currentAdded.length > 0) {
      chunks.push({ type: 'added', value: currentAdded.reverse().join('') });
      currentAdded = [];
    }
    if ((type === 'removed' || type === 'all') && currentRemoved.length > 0) {
      chunks.push({ type: 'removed', value: currentRemoved.reverse().join('') });
      currentRemoved = [];
    }
  };

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
      flush('added');
      flush('removed');
      currentCommon.push(original[i - 1]);
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])) {
      flush('common');
      currentAdded.push(modified[j - 1]);
      j--;
    } else {
      flush('common');
      currentRemoved.push(original[i - 1]);
      i--;
    }
  }

  flush('all');
  return chunks.reverse();
}

function computeLineDiff(original: string, modified: string): DiffChunk[] {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  const m = originalLines.length;
  const n = modifiedLines.length;

  const dp = new Int32Array((m + 1) * (n + 1));
  for (let i = 1; i <= m; i++) {
    const row = i * (n + 1);
    const prevRow = (i - 1) * (n + 1);
    for (let j = 1; j <= n; j++) {
      if (originalLines[i - 1] === modifiedLines[j - 1]) {
        dp[row + j] = dp[prevRow + (j - 1)] + 1;
      } else {
        dp[row + j] = Math.max(dp[prevRow + j], dp[row + (j - 1)]);
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
      const line = `${originalLines[i - 1]}${i < m ? '\n' : ''}`;
      if (chunks.length > 0 && chunks[chunks.length - 1].type === 'common') {
        chunks[chunks.length - 1].value = line + chunks[chunks.length - 1].value;
      } else {
        chunks.push({ type: 'common', value: line });
      }
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])) {
      const line = `${modifiedLines[j - 1]}${j < n ? '\n' : ''}`;
      if (chunks.length > 0 && chunks[chunks.length - 1].type === 'added') {
        chunks[chunks.length - 1].value = line + chunks[chunks.length - 1].value;
      } else {
        chunks.push({ type: 'added', value: line });
      }
      j--;
    } else {
      const line = `${originalLines[i - 1]}${i < m ? '\n' : ''}`;
      if (chunks.length > 0 && chunks[chunks.length - 1].type === 'removed') {
        chunks[chunks.length - 1].value = line + chunks[chunks.length - 1].value;
      } else {
        chunks.push({ type: 'removed', value: line });
      }
      i--;
    }
  }
  return chunks.reverse();
}

export function highlightDifferences(originalText: string, correctedText: string): string {

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

  // Force line-level diffing for better stability when expanding blocks
  const diffChunks = computeLineDiff(originalText, correctedText);

  let html = '';

  for (let k = 0; k < diffChunks.length; k++) {
    const chunk = diffChunks[k];
    
    // Check for "modified" lines (removed block followed by added block of same size)
    if (chunk.type === 'removed' && k + 1 < diffChunks.length && diffChunks[k + 1].type === 'added') {
      const removedVal = chunk.value.endsWith('\n') ? chunk.value.slice(0, -1) : chunk.value;
      const addedVal = diffChunks[k+1].value.endsWith('\n') ? diffChunks[k+1].value.slice(0, -1) : diffChunks[k+1].value;
      
      const removedLines = removedVal.split('\n');
      const addedLines = addedVal.split('\n');
      
      if (removedLines.length === addedLines.length) {
        for (let i = 0; i < removedLines.length; i++) {
          const charDiff = computeDiff(removedLines[i], addedLines[i]);
          for (const charChunk of charDiff) {
            const escaped = escapeHtml(charChunk.value);
            if (charChunk.type === 'removed') {
              html += `<span style="background-color: #ffcccc; color: #cc0000; text-decoration: line-through; border-radius: 2px;">${escaped}</span>`;
            } else if (charChunk.type === 'added') {
              html += `<span style="background-color: #ccffcc; color: #006600; font-weight: bold; border-radius: 2px;">${escaped}</span>`;
            } else {
              html += escaped;
            }
          }
          // Add the newline if it's not the last line of the ENTIRE file, 
          // or if the chunk originally had a newline at this position.
          if (i < removedLines.length - 1 || chunk.value.endsWith('\n')) {
            html += '<span style="opacity: 0.5; font-size: 0.8em;">↵</span>\n';
          }
        }
        k++; // Skip the 'added' chunk
        continue;
      }
    }

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

