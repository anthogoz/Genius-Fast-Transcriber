import type {
  CorrectionCounts,
  CorrectionOptions,
  CorrectionResult,
  CorrectionRule,
  Locale,
} from '@/types';

export function isSectionTag(line: string): boolean {
  const trimmed = line.trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    if (/^\[\?+\]$/.test(trimmed)) return false;
    return true;
  }

  if (/^\[\[.*\]\]\(.*\)$/.test(trimmed)) {
    return true;
  }

  return false;
}

export function correctLineSpacing(text: string): { newText: string; correctionsCount: number } {
  // Sépare d'abord les tags collés sur la même ligne (ex: [Header][Intro])
  // qui est un problème fréquent lors du copier-coller
  let internalCount = 0;
  const preProcessedText = text.replace(/\]([^\S\r\n]*)\[/g, (match) => {
    internalCount++;
    return ']\n\n[';
  });

  const originalLines = preProcessedText.split('\n');
  let correctionsCount = internalCount;

  if (originalLines.length === 0) {
    return { newText: '', correctionsCount: 0 };
  }

  const linesWithAddedSpacing: string[] = [];

  for (let i = 0; i < originalLines.length; i++) {
    const currentLine = originalLines[i];
    linesWithAddedSpacing.push(currentLine);

    if (currentLine.trim() !== '') {
      if (i + 1 < originalLines.length) {
        const nextLine = originalLines[i + 1];
        if (nextLine.trim() !== '' && isSectionTag(nextLine)) {
          linesWithAddedSpacing.push('');
          correctionsCount++;
        }
      }
    }
  }

  const cleanedLines: string[] = [];

  for (let i = 0; i < linesWithAddedSpacing.length; i++) {
    const currentLine = linesWithAddedSpacing[i];
    const trimmedLine = currentLine.trim();

    if (trimmedLine !== '') {
      cleanedLines.push(currentLine);
    } else {
      if (cleanedLines.length === 0) {
        correctionsCount++;
        continue;
      }

      const prevLine = cleanedLines[cleanedLines.length - 1];

      let nextLineIsTag = false;
      let hasNextContent = false;

      for (let k = i + 1; k < linesWithAddedSpacing.length; k++) {
        if (linesWithAddedSpacing[k].trim() !== '') {
          hasNextContent = true;
          if (isSectionTag(linesWithAddedSpacing[k])) {
            nextLineIsTag = true;
          }
          break;
        }
      }

      if (!hasNextContent) {
        correctionsCount++;
        continue;
      }

      if (nextLineIsTag) {
        if (prevLine.trim() === '') {
          correctionsCount++;
        } else {
          cleanedLines.push(currentLine);
        }
      } else {
        correctionsCount++;
      }
    }
  }

  const newText = cleanedLines.join('\n');
  if (text === newText) return { newText, correctionsCount: 0 };
  if (correctionsCount === 0 && text !== newText) correctionsCount = 1;

  return { newText, correctionsCount };
}

export const CORRECTION_RULES: CorrectionRule[] = [
  {
    id: 'yPrime',
    progressKey: 'progress_step_yprime',
    execute: (text, corrections, opts) => {
      if (!opts.yPrime) return text;
      const pattern = /\b(Y|y)['''´`ʻ]/g;
      const newText = text.replace(pattern, (_match, firstLetter: string) =>
        firstLetter === 'Y' ? 'Y ' : 'y ',
      );
      if (newText !== text) corrections.yPrime = (text.match(pattern) || []).length;
      return newText;
    },
  },
  {
    id: 'apostrophes',
    progressKey: 'progress_step_apostrophes',
    execute: (text, corrections, opts) => {
      if (!opts.apostrophes) return text;
      const pattern = /[''´`ʻ]/g;
      const newText = text.replace(pattern, "'");
      if (newText !== text) corrections.apostrophes = (text.match(pattern) || []).length;
      return newText;
    },
  },
  {
    id: 'oeuLigature',
    progressKey: 'progress_step_oeu',
    execute: (text, corrections, opts) => {
      if (!opts.oeuLigature) return text;
      const pattern = /([Oo])eu/g;
      const newText = text.replace(pattern, (_match, firstLetter: string) =>
        firstLetter === 'O' ? 'Œu' : 'œu',
      );
      if (newText !== text) corrections.oeuLigature = (text.match(pattern) || []).length;
      return newText;
    },
  },
  {
    id: 'frenchQuotes',
    progressKey: 'progress_step_quotes',
    execute: (text, corrections, opts) => {
      if (!opts.frenchQuotes) return text;
      const pattern = /[«»]/g;
      const newText = text.replace(pattern, '"');
      if (newText !== text) corrections.frenchQuotes = (text.match(pattern) || []).length;
      return newText;
    },
  },
  {
    id: 'longDash',
    progressKey: 'progress_step_dash',
    execute: (text, corrections, opts, locale) => {
      if (!opts.longDash) return text;
      if (locale === 'pl') {
        const pattern = / - /g;
        const newText = text.replace(pattern, ' — ');
        if (newText !== text) corrections.longDash = (text.match(pattern) || []).length;
        return newText;
      }
      const pattern = /[—–]/g;
      const newText = text.replace(pattern, '-');
      if (newText !== text) corrections.longDash = (text.match(pattern) || []).length;
      return newText;
    },
  },
  {
    id: 'punctuation',
    progressKey: 'progress_step_punctuation',
    execute: (text, corrections, opts, locale) => {
      if (!opts.punctuation) return text;
      if (locale !== 'pl' && locale !== 'en') {
        const pattern = /([^ \n[(<])([?!])/g;
        const newText = text.replace(pattern, '$1 $2');
        if (newText !== text) corrections.punctuation = (text.match(pattern) || []).length;
        return newText;
      }
      return text;
    },
  },
  {
    id: 'doubleSpaces',
    progressKey: 'progress_step_spaces',
    execute: (text, corrections, opts) => {
      if (!opts.doubleSpaces) return text;
      const pattern = / {2,}/g;
      const newText = text.replace(pattern, ' ');
      if (newText !== text) corrections.doubleSpaces = (text.match(pattern) || []).length;
      return newText;
    },
  },
  {
    id: 'spacing',
    progressKey: 'progress_step_spacing',
    execute: (text, corrections, opts) => {
      if (!opts.spacing) return text;
      const result = correctLineSpacing(text);
      if (result.correctionsCount > 0) {
        corrections.spacing = result.correctionsCount;
        return result.newText;
      }
      return text;
    },
  },
  {
    id: 'quoteSpaces',
    progressKey: 'progress_step_quotes',
    execute: (text, corrections, opts) => {
      if (!opts.quoteSpaces) return text;
      // Nettoie UNIQUEMENT les espaces horizontaux à l'intérieur des guillemets
      // On évite [^\S\r\n] (espace non-ligne) pour ne pas fusionner de lignes ou manger des tags
      
      // 1. Espaces après un guillemet ouvrant : (" texte) -> ("texte)
      // On considère ouvrant si début de ligne ou précédé d'un espace/parenthèse, et suivi d'un caractère
      const patternOpen = /(^|[\s(\[])"([^\S\r\n]+)(?=\S)/g;
      
      // 2. Espaces avant un guillemet fermant : (texte ") -> (texte")
      // On considère fermant si précédé d'un caractère et suivi d'un espace/ponctuation/fin
      const patternClose = /(\S)([^\S\r\n]+)"(?=[\s.,;!?)\]]|$)/g;
      
      let count = 0;
      let result = text.replace(patternOpen, (match, prefix) => {
        count++;
        return prefix + '"';
      });
      
      result = result.replace(patternClose, (match, char) => {
        count++;
        return char + '"';
      });
      
      if (count > 0) corrections.quoteSpaces = count;
      return result;
    },
  },
];

export function getDefaultOptions(options: Partial<CorrectionOptions> = {}): CorrectionOptions {
  return {
    yPrime: options.yPrime !== false,
    apostrophes: options.apostrophes !== false,
    oeuLigature: options.oeuLigature !== false,
    frenchQuotes: options.frenchQuotes !== false,
    longDash: options.longDash !== false,
    doubleSpaces: options.doubleSpaces !== false,
    punctuation: options.punctuation !== false,
    spacing: options.spacing !== false,
    quoteSpaces: options.quoteSpaces !== false,
  };
}

function initCorrectionsObject(): CorrectionCounts {
  return {
    yPrime: 0,
    apostrophes: 0,
    oeuLigature: 0,
    frenchQuotes: 0,
    longDash: 0,
    punctuation: 0,
    doubleSpaces: 0,
    spacing: 0,
    quoteSpaces: 0,
  };
}

function calculateTotalCorrections(corrections: CorrectionCounts): number {
  return Object.values(corrections).reduce((sum, val) => sum + (val || 0), 0);
}

export function applyAllTextCorrectionsToString(
  text: string,
  locale: Locale,
  options: Partial<CorrectionOptions> = {},
): CorrectionResult {
  const opts = getDefaultOptions(options);
  let currentText = text;
  const corrections = initCorrectionsObject();

  for (const rule of CORRECTION_RULES) {
    currentText = rule.execute(currentText, corrections, opts, locale);
  }

  return {
    newText: currentText,
    correctionsCount: calculateTotalCorrections(corrections),
    corrections,
  };
}

export async function applyAllTextCorrectionsAsync(
  text: string,
  locale: Locale,
  showProgressFn?: (step: number, total: number, message: string) => void,
): Promise<CorrectionResult> {
  const showProgress = showProgressFn ?? (() => {});
  const opts = getDefaultOptions({});
  let currentText = text;
  const corrections = initCorrectionsObject();
  const totalSteps = CORRECTION_RULES.length;

  for (let i = 0; i < CORRECTION_RULES.length; i++) {
    const rule = CORRECTION_RULES[i];

    if (rule.progressKey) {
      showProgress(i + 1, totalSteps, rule.progressKey);
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    currentText = rule.execute(currentText, corrections, opts, locale);
  }

  return {
    newText: currentText,
    correctionsCount: calculateTotalCorrections(corrections),
    corrections,
  };
}
