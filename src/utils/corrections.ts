import type {
  CorrectionCounts,
  CorrectionOptions,
  CorrectionResult,
  CorrectionRule,
  Locale,
  SongData,
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
    id: 'majuscules',
    progressKey: 'progress_step_majuscules',
    execute: (text, corrections, opts) => {
      if (!opts.majuscules) return text;
      // Met une majuscule au début de chaque ligne et supprime les espaces initiaux, sauf si c'est un tag [Section]
      const lines = text.split('\n');
      let count = 0;
      const newLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed || isSectionTag(trimmed)) return line;
        
        const firstChar = trimmed[0];
        const capitalized = firstChar.toUpperCase() + trimmed.slice(1);
        
        if (line !== capitalized) {
          count++;
          return capitalized;
        }
        return line;
      });
      if (count > 0) corrections.majuscules = count;
      return newLines.join('\n');
    },
  },
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
      let count = 0;
      
      // On traite le texte ligne par ligne pour plus de précision
      const lines = text.split('\n');
      const newLines = lines.map((line) => {
        let newLine = line;

        // 1. Supprime d'abord tous les espaces avant TOUTE ponctuation pour normaliser
        // Mais on ne le fait que si ce n'est pas déjà correct pour éviter le ping-pong
        
        // Règle . et , (toujours collés)
        const dotComma = newLine.replace(/\s+([.,])/g, '$1');
        if (dotComma !== newLine) {
          // On ne compte qu'une fois par ligne pour ne pas effrayer l'utilisateur
          newLine = dotComma;
        }

        // Règle ! ? : ; (dépend de la langue)
        if (locale === 'fr') {
          // Français : doit avoir UN espace avant
          const withSpace = newLine.replace(/(?<!\s)([?!:;])/g, ' $1') // Ajoute si manque
                                   .replace(/\s{2,}([?!:;])/g, ' $1'); // Réduit si trop
          newLine = withSpace;
        } else {
          // Anglais/Polonais : doit être collé
          const noSpace = newLine.replace(/\s+([?!:;])/g, '$1');
          newLine = noSpace;
        }

        // 2. Règle Genius : suppression des . et , en fin de ligne
        if (!isSectionTag(newLine)) {
          newLine = newLine.replace(/[.,]+[^\S\r\n]*$/, '');
        }

        if (newLine !== line) count++;
        return newLine;
      });

      if (count > 0) corrections.punctuation = count;
      return newLines.join('\n');
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
      let totalCount = 0;
      
      const lines = text.split('\n');
      const newLines = lines.map((line) => {
        let quoteIndex = 0;
        // On traite chaque guillemet selon sa position (impair = ouvrant, pair = fermant)
        return line.replace(/"/g, (match, offset) => {
          quoteIndex++;
          const isOpening = quoteIndex % 2 !== 0;
          
          if (isOpening) {
            // Ouvrant : on nettoie les espaces qui suivent
            const after = line.slice(offset + 1);
            const spacesMatch = after.match(/^ +/);
            if (spacesMatch && after[spacesMatch[0].length] && after[spacesMatch[0].length] !== ' ') {
              totalCount++;
              // On ne renvoie que le guillemet, le replace original s'occupe du reste
              // Mais attendez, replace remplace SEULEMENT le guillemet.
              // On doit aussi consommer les espaces.
            }
          }
          return match;
        });
      });

      // Correction de la logique : on doit utiliser une approche globale par ligne
      const finalLines = lines.map(line => {
        let isOpening = true;
        let result = "";
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') {
            result += '"';
            if (isOpening) {
              // On saute les espaces après l'ouvrant
              while (line[i+1] === ' ') {
                i++;
                totalCount++;
              }
            } else {
              // On a déjà ajouté les espaces avant ? Non, on doit les avoir sautés AVANT d'ajouter le guillemet.
            }
            isOpening = !isOpening;
          } else {
            result += line[i];
          }
        }
        return result;
      });

      // Version finale simplifiée et robuste :
      const robustLines = lines.map(line => {
        let open = true;
        let newLine = "";
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') {
            if (open) {
              // Ouvrant : garde le guillemet et saute les espaces APRÈS
              newLine += '"';
              while (i + 1 < line.length && line[i + 1] === ' ') {
                i++;
                totalCount++;
              }
            } else {
              // Fermant : saute les espaces AVANT et garde le guillemet
              while (newLine.endsWith(' ')) {
                newLine = newLine.slice(0, -1);
                totalCount++;
              }
              newLine += '"';
            }
            open = !open;
          } else {
            newLine += line[i];
          }
        }
        return newLine;
      });

      if (totalCount > 0) corrections.quoteSpaces = totalCount;
      return robustLines.join('\n');
    },
  },
  {
    id: 'songHeader',
    progressKey: 'progress_step_songHeader',
    execute: (text, corrections, opts, locale, songData) => {
      if (!opts.songHeader || !songData || locale === 'en') return text;

      const lines = text.split('\n');
      let headerIndex = -1;
      const frPattern = /^\[Paroles de.*\]$/i;
      const plPattern = /^\[Słowa do.*\]$/i;

      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const trimmed = lines[i].trim();
        if (frPattern.test(trimmed) || plPattern.test(trimmed)) {
          headerIndex = i;
          break;
        }
      }

      const expectedHeader = generateSongHeader(songData, locale);

      if (headerIndex !== -1) {
        if (lines[headerIndex].trim() !== expectedHeader) {
          lines[headerIndex] = expectedHeader;
          corrections.songHeader = 1;
          return lines.join('\n');
        }
        return text;
      }

      corrections.songHeader = 1;
      return `${expectedHeader}\n\n${text.trimStart()}`;
    },
  },
];

export function generateSongHeader(songData: SongData, locale: Locale): string {
  let featStr = '';
  if (songData.featuringArtists.length > 0) {
    featStr =
      (locale === 'fr' ? ' ft. ' : ' (feat. ') +
      songData.featuringArtists.join(', ') +
      (locale === 'pl' ? ')' : '');
  }

  return locale === 'fr'
    ? `[Paroles de "${songData.title}"${featStr}]`
    : `[Słowa do utworu "${songData.title}"${featStr}]`;
}


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
    majuscules: options.majuscules !== false,
    songHeader: options.songHeader !== false,
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
    majuscules: 0,
    songHeader: 0,
  };
}

function calculateTotalCorrections(corrections: CorrectionCounts): number {
  return Object.values(corrections).reduce((sum, val) => sum + (val || 0), 0);
}

export function applyAllTextCorrectionsToString(
  text: string,
  locale: Locale,
  options: Partial<CorrectionOptions> = {},
  songData?: SongData,
): CorrectionResult {
  const opts = getDefaultOptions(options);
  let currentText = text;
  const corrections = initCorrectionsObject();

  for (const rule of CORRECTION_RULES) {
    currentText = rule.execute(currentText, corrections, opts, locale, songData);
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
  songData?: SongData,
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

    currentText = rule.execute(currentText, corrections, opts, locale, songData);
  }

  return {
    newText: currentText,
    correctionsCount: calculateTotalCorrections(corrections),
    corrections,
  };
}
