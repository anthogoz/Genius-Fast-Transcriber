interface TransformResult {
  newText: string;
  correctionsCount: number;
}

export function applyTextTransformToDivEditor(
  editorNode: HTMLElement,
  transformFunction: (text: string) => TransformResult,
): number {
  const selection = window.getSelection();
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
  let currentTextContent = '';
  const lineElements: Node[] = [];
  let nodeBuffer = '';

  editorNode.childNodes.forEach((child) => {
    if (child.nodeName === 'BR') {
      if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
      nodeBuffer = '';
      lineElements.push(document.createElement('br'));
    } else if (child.nodeType === Node.TEXT_NODE) {
      nodeBuffer += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
      nodeBuffer = '';
      if (child.nodeName === 'DIV' || child.nodeName === 'P') {
        if (child.textContent?.trim() !== '') {
          lineElements.push(child.cloneNode(true));
        } else if ((child as Element).querySelector('br')) {
          lineElements.push(document.createElement('br'));
        }
      } else {
        nodeBuffer += child.textContent;
      }
    }
  });
  if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));

  currentTextContent = '';
  for (const el of lineElements) {
    if (el.nodeName === 'BR') {
      currentTextContent += '\n';
    } else if (el.nodeType === Node.TEXT_NODE) {
      currentTextContent += el.textContent;
    } else if (el.nodeName === 'DIV' || el.nodeName === 'P') {
      currentTextContent += `${el.textContent}\n`;
    }
  }
  currentTextContent = currentTextContent.replace(/\n+$/, '');

  const { newText, correctionsCount } = transformFunction(currentTextContent);

  if (currentTextContent !== newText || correctionsCount > 0) {
    editorNode.innerHTML = '';
    const lines = newText.split('\n');
    lines.forEach((lineText, index, arr) => {
      const lineDiv = document.createElement('div');
      if (lineText === '') {
        if (!(index === arr.length - 1 && arr.length > 1 && !newText.endsWith('\n\n'))) {
          lineDiv.appendChild(document.createElement('br'));
        }
      } else {
        lineDiv.textContent = lineText;
      }
      editorNode.appendChild(lineDiv);
    });

    if (editorNode.childNodes.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.appendChild(document.createElement('br'));
      editorNode.appendChild(emptyDiv);
    }

    if (range && selection) {
      try {
        const lastDiv = editorNode.lastChild;
        if (lastDiv) {
          const newRange = document.createRange();
          if (lastDiv.nodeName === 'DIV') {
            if (lastDiv.firstChild && lastDiv.firstChild.nodeName === 'BR') {
              newRange.setStartBefore(lastDiv.firstChild);
            } else if (lastDiv.firstChild && lastDiv.firstChild.nodeType === Node.TEXT_NODE) {
              newRange.setStart(lastDiv.firstChild, lastDiv.firstChild.textContent?.length ?? 0);
            } else {
              newRange.selectNodeContents(lastDiv);
              newRange.collapse(false);
            }
          } else {
            newRange.setStart(lastDiv, lastDiv.textContent?.length ?? 0);
          }
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (e) {
        console.warn('[GFT] Failed to restore selection after transform:', e);
      }
    }

    editorNode.focus();
    editorNode.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }

  return correctionsCount;
}

export function replaceAndHighlightInDiv(
  editorNode: HTMLElement,
  searchRegex: RegExp,
  replacementTextOrFn: string | ((...args: string[]) => string),
  highlightClass: string,
): number {
  let replacementsMadeCount = 0;
  const treeWalker = document.createTreeWalker(editorNode, NodeFilter.SHOW_TEXT);
  const nodesToProcess: Text[] = [];
  while (treeWalker.nextNode()) nodesToProcess.push(treeWalker.currentNode as Text);

  for (const textNode of nodesToProcess) {
    const localSearchRegex = new RegExp(
      searchRegex.source,
      searchRegex.flags.includes('g') ? searchRegex.flags : `${searchRegex.flags}g`,
    );

    if (!textNode.nodeValue?.match(localSearchRegex)) continue;

    const parent = textNode.parentNode;
    if (
      !parent
      || (parent.nodeType === Node.ELEMENT_NODE
        && (parent as Element).classList.contains(highlightClass))
    )
      continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null = localSearchRegex.exec(textNode.nodeValue ?? '');
    let nodeChangedThisIteration = false;
    localSearchRegex.lastIndex = 0;

    while (match !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(textNode.nodeValue?.substring(lastIndex, match.index)),
        );
      }

      const actualReplacement =
        typeof replacementTextOrFn === 'function'
          ? replacementTextOrFn(match[0], ...match.slice(1))
          : match[0].replace(
              new RegExp(searchRegex.source, searchRegex.flags.replace('g', '')),
              replacementTextOrFn,
            );

      const span = document.createElement('span');
      span.className = highlightClass;
      span.style.cssText =
        'background-color: #f9ff55 !important; border-radius: 2px !important; padding: 0 1px !important; animation: lyrics-helper-fadeout 2s ease-out forwards !important;';
      span.textContent = actualReplacement;
      fragment.appendChild(span);
      lastIndex = localSearchRegex.lastIndex;
      nodeChangedThisIteration = true;
      replacementsMadeCount++;

      if (lastIndex === match.index && localSearchRegex.source !== '') localSearchRegex.lastIndex++;
      if (lastIndex === 0 && localSearchRegex.source === '' && match[0] === '') break;

      match = localSearchRegex.exec(textNode.nodeValue ?? '');
    }

    if (lastIndex < textNode.nodeValue?.length) {
      fragment.appendChild(document.createTextNode(textNode.nodeValue?.substring(lastIndex)));
    }

    if (nodeChangedThisIteration && fragment.childNodes.length > 0) {
      parent.replaceChild(fragment, textNode);
    }
  }

  return replacementsMadeCount;
}

export function createTextareaReplacementOverlay(
  textarea: HTMLTextAreaElement,
  originalText: string,
  newText: string,
  searchPattern: RegExp,
  color = '#f9ff55',
): void {
  const existingOverlay = document.getElementById('gft-textarea-overlay');
  if (existingOverlay) existingOverlay.remove();

  if (originalText === newText) return;

  const modifiedPositions = new Set<number>();

  const originalMatches: { start: number; end: number; text: string }[] = [];
  const localSearchRegex = new RegExp(searchPattern.source, searchPattern.flags);
  let match: RegExpExecArray | null = localSearchRegex.exec(originalText);
  localSearchRegex.lastIndex = 0;

  while (match !== null) {
    originalMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });
    if (!searchPattern.flags.includes('g')) break;

    match = localSearchRegex.exec(originalText);
  }

  let offset = 0;
  for (const originalMatch of originalMatches) {
    const posInNew = originalMatch.start + offset;
    const originalLength = originalMatch.end - originalMatch.start;

    const charAfterMatch = originalText[originalMatch.end];
    let newLength = 0;

    if (charAfterMatch) {
      let k = posInNew;
      while (k < newText.length && newText[k] !== charAfterMatch) {
        newLength++;
        k++;
      }
    } else {
      newLength = newText.length - posInNew;
    }

    for (let i = posInNew; i < posInNew + newLength; i++) {
      modifiedPositions.add(i);
    }

    offset += newLength - originalLength;
  }

  const overlay = document.createElement('div');
  overlay.id = 'gft-textarea-overlay';

  const cs = window.getComputedStyle(textarea);
  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 1;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
    font-family: ${cs.fontFamily};
    font-size: ${cs.fontSize};
    line-height: ${cs.lineHeight};
    padding: ${cs.padding};
    border: ${cs.border};
    box-sizing: border-box;
  `;

  const rect = textarea.getBoundingClientRect();
  const parentRect = textarea.offsetParent
    ? textarea.offsetParent.getBoundingClientRect()
    : { top: 0, left: 0 };
  const parentScrollTop = textarea.offsetParent
    ? (textarea.offsetParent as HTMLElement).scrollTop
    : 0;
  const parentScrollLeft = textarea.offsetParent
    ? (textarea.offsetParent as HTMLElement).scrollLeft
    : 0;

  overlay.style.top = `${rect.top - parentRect.top + parentScrollTop}px`;
  overlay.style.left = `${rect.left - parentRect.left + parentScrollLeft}px`;
  overlay.style.width = `${textarea.offsetWidth}px`;
  overlay.style.height = `${textarea.offsetHeight}px`;

  let htmlContent = '';
  for (let i = 0; i < newText.length; i++) {
    const char = newText[i];
    const escaped =
      char === '<'
        ? '&lt;'
        : char === '>'
          ? '&gt;'
          : char === '&'
            ? '&amp;'
            : char === '\n'
              ? '<br>'
              : char;

    if (modifiedPositions.has(i)) {
      htmlContent += `<span class="gft-correction-overlay" style="background-color: ${color}; opacity: 0.6; border-radius: 2px; padding: 0 1px; color: transparent; font-weight: inherit;">${escaped}</span>`;
    } else {
      htmlContent += `<span style="color: transparent;">${escaped}</span>`;
    }
  }

  overlay.innerHTML = htmlContent;
  textarea.parentNode?.insertBefore(overlay, textarea);

  const syncScroll = () => {
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  };

  textarea.addEventListener('scroll', syncScroll);

  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
      textarea.removeEventListener('scroll', syncScroll);
    }
  }, 2000);
}
