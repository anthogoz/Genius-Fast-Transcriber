export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export function escapeRegExp(str: string): string {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cleanArtistName(name: string): string {
  if (!name) return '';
  let cleaned = name.trim();
  cleaned = decodeHtmlEntities(cleaned);

  const commonSuffixRegex =
    /\s*\((?:FRA|FR|UK|US|Feat\.|Featuring|Trad\.|Producer|Mix|Remix|Edit|Version|Live|Demo)[^)]*?\)\s*$/i;
  if (commonSuffixRegex.test(cleaned)) {
    cleaned = cleaned.replace(commonSuffixRegex, '').trim();
  }

  const trailingParenthesisRegex = /\s*\([^)]*\)\s*$/;
  if (trailingParenthesisRegex.test(cleaned)) {
    cleaned = cleaned.replace(trailingParenthesisRegex, '').trim();
  } else {
    const isolatedTrailingParenthesisRegex = /\)\s*$/;
    if (isolatedTrailingParenthesisRegex.test(cleaned)) {
      cleaned = cleaned.replace(isolatedTrailingParenthesisRegex, '').trim();
    }
  }

  const lastOpenParenIndex = cleaned.lastIndexOf('(');
  if (lastOpenParenIndex > -1 && cleaned.indexOf(')', lastOpenParenIndex) === -1) {
    if (cleaned.length - lastOpenParenIndex < 10) {
      cleaned = cleaned.substring(0, lastOpenParenIndex).trim();
    }
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

export function formatArtistList(artists: string[]): string {
  if (!artists || artists.length === 0) return '';
  if (artists.length === 1) return artists[0];
  if (artists.length === 2) return artists.join(' & ');
  return `${artists.slice(0, -1).join(', ')} & ${artists[artists.length - 1]}`;
}

export function extractArtistsFromMetaContent(metaContent: string): {
  main: string[];
  ft: string[];
} {
  const result: { main: string[]; ft: string[] } = { main: [], ft: [] };
  if (!metaContent) return result;

  let contentForArtists = decodeHtmlEntities(metaContent);

  const songTitleSeparatorMatch = contentForArtists.match(/\s[–-]\s/);
  if (songTitleSeparatorMatch?.index != null) {
    contentForArtists = contentForArtists.substring(0, songTitleSeparatorMatch.index).trim();
  }

  let ftContent: string | null = null;
  let mainPart = contentForArtists;

  const ftOuterMatch = contentForArtists.match(/\((Ft\.|Featuring)\s+(.*)\)\s*$/i);
  if (ftOuterMatch?.[2]) {
    ftContent = ftOuterMatch[2].trim();
    mainPart = contentForArtists.replace(ftOuterMatch[0], '').trim();
  }

  if (ftContent) {
    for (const name of ftContent.split(/[,&]\s*/)) {
      const cleaned = name.trim();
      if (cleaned) result.ft.push(cleaned);
    }
  }

  for (const name of mainPart.split(/[,&]\s*/)) {
    const cleanedName = name.trim();
    if (cleanedName) {
      if (!result.ft.some((ftArt) => ftArt.toLowerCase() === cleanedName.toLowerCase())) {
        result.main.push(cleanedName);
      }
    }
  }

  return result;
}
