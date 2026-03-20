import type {
  CorrectionCounts,
  CorrectionOptions,
  CorrectionResult,
  CorrectionRule,
  Locale,
  SongData,
} from '@/types';

export const REPEAT_MARKER_REGEX = /\s*[(（]?\s*[xX×]\s*(\d+)\s*[)）]?\s*$/;

export function isSectionTag(line: string): boolean {
  const trimmed = line.trim().replace(REPEAT_MARKER_REGEX, '');

  // On considère comme "Tag" ce qui commence par [ et finit par ]
  // ou ce qui se termine par une annotation Genius (ID)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return true;
  }

  // Annotation: [Texte](12345) ou [[Texte]](12345) ou [Texte] (12345)
  if (/^\[+.*\]+\s*\(\d+\)$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Liste des mots-clés typiques de début de section sur Genius
 */
const SECTION_KEYWORDS = [
  'Couplet',
  'Verse',
  'Refrain',
  'Chorus',
  'Pont',
  'Bridge',
  'Intro',
  'Outro',
  'Pre-Chorus',
  'Pré-refrain',
  'Post-Chorus',
  'Post-refrain',
  'Hook',
  'Instrumental',
  'Solo',
  'Skit',
  'Interlude',
  'Paroles',
  'Słowa',
  'Zwrotka',
  'Refren',
  'Mostek',
];

/**
 * Détermine si un tag est une véritable en-tête de section (ex: [Verse])
 * et non un simple marqueur de texte inconnu [?] ou une ligne de paroles avec tags.
 */
export function isHeadingTag(line: string): boolean {
  if (!isSectionTag(line)) return false;
  const trimmed = line.trim().replace(REPEAT_MARKER_REGEX, '');

  // 1. On nettoie la ligne de son annotation éventuelle à la fin
  const withoutAnnotation = trimmed.replace(/\s*\(\d+\)$/, '');

  // 2. On extrait le contenu des crochets (gère [[...]])
  const tagMatch = withoutAnnotation.match(/^\[+([^\]]+)\]+/);
  if (!tagMatch) return false;
  const tagContent = tagMatch[1].trim();

  // Si c'est un placeholder pur [?], ce n'est jamais un titre
  if (/^\?+$/.test(tagContent)) return false;

  // 3. On extrait la partie description (avant : ou " - ")
  // On ne split par le tiret QUE s'il a des espaces pour préserver "Post-Chorus"
  const tagDescription = tagContent.split(/[:]|(\s+[-]\s+)/)[0].trim();

  // 4. On vérifie si la description contient un mot-clé Genius comme mot entier
  return SECTION_KEYWORDS.some((keyword) => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\b)${escapedKeyword}(\\b|\\d|$)`, 'i');
    return regex.test(tagDescription);
  });
}

export function correctLineSpacing(text: string): { newText: string; correctionsCount: number } {
  // Sépare d'abord les tags collés sur la même ligne (ex: [Header][Intro])
  // qui est un problème fréquent lors du copier-coller
  let internalCount = 0;
  // On ne sépare que si le deuxième tag est un vrai titre (évite de séparer [Verse 1][?])
  const preProcessedText = text.replace(/\]([^\S\r\n]*)\[/g, (match, _spaces, offset, fullText) => {
    const afterOpenBracket = fullText.slice(offset + match.length - 1);
    const nextBracketEnd = afterOpenBracket.indexOf(']');
    if (nextBracketEnd !== -1) {
      const tagContent = afterOpenBracket.slice(0, nextBracketEnd + 1);
      if (!isHeadingTag(tagContent)) return match;
    }

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
        if (nextLine.trim() !== '' && isHeadingTag(nextLine)) {
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
          if (isHeadingTag(linesWithAddedSpacing[k])) {
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
    id: 'repetitions',
    progressKey: 'progress_step_repetitions',
    execute: (text, corrections, opts) => {
      if (!opts.repetitions) return text;

      function expand(lines: string[]): { lines: string[]; count: number } {
        const result: string[] = [];
        let internalCount = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const match = line.match(REPEAT_MARKER_REGEX);

          if (match) {
            const num = Number.parseInt(match[1], 10);
            if (num > 1 && num <= 10) {
              const contentToRepeat = line.replace(REPEAT_MARKER_REGEX, '').trim();
              internalCount++;

              if (isHeadingTag(contentToRepeat)) {
                // Section level repetition: [Chorus] x2
                const blockLines: string[] = [];
                let j = i + 1;
                while (j < lines.length && !isHeadingTag(lines[j])) {
                  blockLines.push(lines[j]);
                  j++;
                }

                // Recursively expand repetitions inside the block
                const { lines: expandedBlock, count: subCount } = expand(blockLines);
                internalCount += subCount;

                // Clean block from trailing empty lines
                const cleanBlock = [...expandedBlock];
                while (cleanBlock.length > 0 && cleanBlock[cleanBlock.length - 1].trim() === '') {
                  cleanBlock.pop();
                }

                result.push(contentToRepeat);
                // Repeat the block content `num` times
                for (let k = 0; k < num; k++) {
                  if (cleanBlock.length > 0) {
                    result.push(...cleanBlock);
                  }
                }

                i = j - 1;
                continue;
              } else {
                // Line level repetition: Line text x3
                for (let k = 0; k < num; k++) {
                  result.push(contentToRepeat);
                }
                continue;
              }
            }
          }
          result.push(line);
        }
        return { lines: result, count: internalCount };
      }

      const inputLines = text.split('\n');
      const { lines: finalLines, count } = expand(inputLines);

      if (count > 0) corrections.repetitions = count;
      return finalLines.join('\n');
    },
  },
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
    id: 'tagSeparator',
    progressKey: 'progress_step_tag_separator',
    execute: (text, corrections, opts) => {
      if (!opts.tagSeparator) return text;
      const lines = text.split('\n');
      let count = 0;
      const newLines = lines.map((line) => {
        if (!isHeadingTag(line)) return line;

        // 0. Preliminary cleanup: spaces inside tags (apostrophes are handled by the apostrophes rule later)
        const tagPattern = /\[([^\]]+)\]/g;
        let newLine = line.replace(tagPattern, (tag) => {
          // Normalize spaces inside tags
          return tag.replace(/(\[|\()\s+|\s+(\]|\))/g, '$1$2');
        });

        // 1. Normalize " - " to " : "
        // Use spaces around the hyphen to avoid splitting compound tags like "Post-Chorus"
        const separatorPattern = /(?<=\[)([^\]\-:]+)\s+[-]\s+([^\]]+)(?=\])/g;
        newLine = newLine.replace(separatorPattern, '$1 : $2');

        // 2. Normalize colons and multiple artists: [A: B, C] -> [A : B & C]
        const artistPattern = /\[([^\]:]+)\s*:\s*([^\]]+)\]/g;
        newLine = newLine.replace(artistPattern, (_match, typePartRaw, artistPartRaw) => {
          const typePart = typePartRaw.trim();
          const artistPart = artistPartRaw.trim();

          const artists = artistPart
            .split(/[,&]|\band\b/i)
            .map((a: string) => a.trim())
            .filter((a: string) => a.length > 0);

          let normalizedArtists = artistPart;
          if (artists.length === 1) {
            normalizedArtists = artists[0];
          } else if (artists.length > 1) {
            const lastArtist = artists.pop();
            normalizedArtists = `${artists.join(', ')} & ${lastArtist}`;
          }

          return `[${typePart} : ${normalizedArtists}]`;
        });

        if (newLine !== line) {
          count++;
          return newLine;
        }
        return line;
      });
      if (count > 0) corrections.tagSeparator = count;
      return newLines.join('\n');
    },
  },
  {
    id: 'yPrime',
    progressKey: 'progress_step_yprime',
    execute: (text, corrections, opts) => {
      if (!opts.yPrime) return text;
      const pattern = /\b(Y|y)['´`ʻ‘’]/g;
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
      const pattern = /[´`ʻ‘’]/g;
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
        if (isSectionTag(line)) return line;

        let newLine = line;

        // 1. Supprime d'abord tous les espaces avant TOUTE ponctuation pour normaliser
        // Mais on ne le fait que si ce n'est pas déjà correct pour éviter le ping-pong

        // Règle . et , (toujours collés)
        const dotComma = newLine.replace(/\s+([.,])/g, '$1');
        if (dotComma !== newLine) {
          // On ne compte qu'une fois par ligne pour ne pas effrayer l'utilisateur
          newLine = dotComma;
        }

        // 1. Appliquer d'abord l'espacement selon la langue
        if (locale === 'fr') {
          // Français : doit avoir UN espace avant, sauf si on est juste après un crochet [
          const withSpace = newLine
            .replace(/(?<![\s[])([?!:;])/g, ' $1') // Ajoute si manque, sauf après [
            .replace(/\[\s+([?!:;])/g, '[$1') // Supprime si déjà là après [
            .replace(/\s+([?!:;])/g, ' $1'); // Normalise à un seul espace
          newLine = withSpace;
        } else {
          // Anglais/Polonais : doit être collé
          const noSpace = newLine.replace(/\s+([?!:;])/g, '$1');
          newLine = noSpace;
        }

        // 1.5 Remplacer les successions de points (...) par l'ellipse (…), partout dans la ligne
        if (!isSectionTag(newLine)) {
          newLine = newLine.replace(/\.{3,}/g, '…');
        }

        // 2. Règle Genius : suppression des . , et ; en fin de ligne
        // On le fait en dernier pour s'assurer que les espaces rajoutés par la règle FR sont aussi nettoyés
        if (!isSectionTag(newLine)) {
          newLine = newLine.replace(/[.,;]+\s*$/, '');
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
    id: 'bracketSpaces',
    progressKey: 'progress_step_quotes', // Group with quotes for simplicity
    execute: (text, corrections, opts) => {
      if (!opts.quoteSpaces) return text; // Group with quoteSpaces option
      let count = 0;
      const lines = text.split('\n');
      const newLines = lines.map((line) => {
        // Supprime les espaces internes des parenthèses ( ) et crochets [ ]
        const pattern = /([([])\s+|\s+([)\]])/g;
        const newLine = line.replace(pattern, (_match, open, close) => {
          count++;
          return open || close;
        });
        return newLine;
      });
      if (count > 0) corrections.bracketSpaces = count;
      return newLines.join('\n');
    },
  },
  {
    id: 'quoteSpaces',
    progressKey: 'progress_step_quotes',
    execute: (text, corrections, opts) => {
      if (!opts.quoteSpaces) return text;
      let totalCount = 0;

      const lines = text.split('\n');
      // Version finale simplifiée et robuste :
      const robustLines = lines.map((line) => {
        let open = true;
        let newLine = '';
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

      let expectedHeader = generateSongHeader(songData, locale);

      // If tagSeparator is on, apply artist normalization to the header too
      if (opts.tagSeparator) {
        const tagRule = CORRECTION_RULES.find((r) => r.id === 'tagSeparator');
        if (tagRule) {
          const dummyCorrections = initCorrectionsObject();
          expectedHeader = tagRule.execute(expectedHeader, dummyCorrections, opts, locale);
        }
      }

      if (headerIndex !== -1) {
        if (lines[headerIndex].trim() !== expectedHeader.trim()) {
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
    const artists = [...songData.featuringArtists];
    let artistsFormatted = '';
    
    if (artists.length === 1) {
      artistsFormatted = artists[0];
    } else {
      const lastArtist = artists.pop();
      artistsFormatted = `${artists.join(', ')} & ${lastArtist}`;
    }

    featStr =
      (locale === 'fr' ? ' ft. ' : ' (feat. ')
      + artistsFormatted
      + (locale === 'pl' ? ')' : '');
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
    repetitions: options.repetitions !== false,
    tagSeparator: options.tagSeparator !== false,
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
    repetitions: 0,
    tagSeparator: 0,
    bracketSpaces: 0,
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
