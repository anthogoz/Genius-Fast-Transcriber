import type { UnmatchedBracket } from '@/types';

const PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
};

const CLOSING_CHARS: Record<string, string> = {
  ')': '(',
  ']': '[',
};

export function findUnmatchedBracketsAndParentheses(text: string): UnmatchedBracket[] {
  const unmatched: UnmatchedBracket[] = [];
  const stack: { char: string; position: number }[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (PAIRS[char]) {
      stack.push({ char, position: i });
    } else if (CLOSING_CHARS[char]) {
      if (stack.length === 0) {
        unmatched.push({ char, position: i, type: 'closing-without-opening' });
      } else {
        const last = stack[stack.length - 1];
        if (PAIRS[last.char] === char) {
          stack.pop();
        } else {
          unmatched.push({ char, position: i, type: 'wrong-pair' });
          stack.pop();
        }
      }
    }
  }

  for (const item of stack) {
    unmatched.push({ char: item.char, position: item.position, type: 'opening-without-closing' });
  }

  return unmatched;
}
