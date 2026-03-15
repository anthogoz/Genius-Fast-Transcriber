export type ArtistSearchCandidate = {
  name: string;
  image_url: string;
};

export function extractArtistImage(albumUrl: string, mainArtists: string[]): string | null {
  const cleanUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      if (url.includes('genius.com/unsafe/')) {
        const unsafeSplit = url.split('/unsafe/');
        if (unsafeSplit.length > 1) {
          let remainder = unsafeSplit[1] ?? '';
          const encodedProtocolIndex = remainder.search(/https?%3A/i);
          if (encodedProtocolIndex !== -1) {
            remainder = remainder.substring(encodedProtocolIndex);
            return decodeURIComponent(remainder);
          }
          const protocolIndex = remainder.search(/https?:/i);
          if (protocolIndex !== -1) {
            return remainder.substring(protocolIndex);
          }
        }
      }
      if (url.includes('%3A') || url.includes('%2F')) {
        return decodeURIComponent(url);
      }
      return url;
    } catch {
      return url;
    }
  };

  const headerAvatar = document.querySelector<HTMLImageElement>(
    'div[class*="SongHeader"] a[href*="/artists/"] img',
  );
  if (headerAvatar?.src) return cleanUrl(headerAvatar.src);

  const aboutImg = document.querySelector<HTMLImageElement>(
    '[class*="AboutArtist__Container"] img, [class*="ArtistAvatar__Image"]',
  );
  if (aboutImg?.src) return cleanUrl(aboutImg.src);

  const metaImg = document.querySelector<HTMLMetaElement>(
    'meta[property="genius:track_artist_image"]',
  );
  if (metaImg?.content) return cleanUrl(metaImg.content);

  const primaryArtist = mainArtists[0];
  if (primaryArtist) {
    const candidate = Array.from(document.querySelectorAll<HTMLImageElement>('img')).find((img) => {
      const src = img.src || '';
      const alt = img.alt || '';
      return (
        alt.includes(primaryArtist)
        && src.includes('images.genius.com')
        && !src.includes('pixel')
        && !src.includes('placeholder')
        && (src.includes('avatar') || src.includes('profile') || img.width === img.height)
      );
    });
    if (candidate?.src) return cleanUrl(candidate.src);
  }

  return cleanUrl(albumUrl);
}

export async function searchArtistCandidates(query: string): Promise<ArtistSearchCandidate[]> {
  try {
    const searchUrl = `https://genius.com/api/search/artist?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const data = (await response.json()) as {
      response?: { sections?: Array<{ hits?: Array<{ result?: ArtistSearchCandidate }> }> };
    };
    const sections = data.response?.sections;
    const hits = sections?.[0]?.hits ?? [];

    return hits
      .map((hit) => hit.result)
      .filter((result): result is ArtistSearchCandidate => Boolean(result?.image_url));
  } catch {
    return [];
  }
}

export async function fetchArtistImageFromApi(
  artistName: string | null,
  unknownArtistLabel: string,
  forceSearch = false,
): Promise<string | null> {
  let songId: string | null = null;

  if (!forceSearch) {
    try {
      const metaNewRelic = document.querySelector<HTMLMetaElement>(
        'meta[name="newrelic-resource-path"]',
      );
      if (metaNewRelic?.content) {
        const match = metaNewRelic.content.match(/songs\/(\d+)/);
        if (match?.[1]) songId = match[1];
      }

      if (!songId) {
        const metaApp = document.querySelector<HTMLMetaElement>(
          'meta[name="twitter:app:url:iphone"], meta[name="twitter:app:url:googleplay"]',
        );
        if (metaApp?.content) {
          const match = metaApp.content.match(/songs\/(\d+)/);
          if (match?.[1]) songId = match[1];
        }
      }

      if (!songId) {
        const scripts = document.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"], script:not([src])',
        );
        for (const script of scripts) {
          const content = script.textContent ?? '';
          const match = content.match(/"id":(\d+),"_type":"song"/);
          if (match?.[1]) {
            songId = match[1];
            break;
          }
        }
      }

      if (songId) {
        const response = await fetch(`https://genius.com/api/songs/${songId}`);
        if (response.ok) {
          const data = (await response.json()) as {
            response?: { song?: { primary_artist?: { image_url?: string } } };
          };
          const imageUrl = data.response?.song?.primary_artist?.image_url;
          if (imageUrl) return imageUrl;
        }
      }
    } catch {
      // Fallback to artist search when song API is unavailable.
    }
  }

  if (!artistName || artistName === unknownArtistLabel) return null;

  try {
    let expectedUrl: string | null = null;
    const allLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'));
    const artistLink = allLinks.find(
      (a) => a.textContent?.trim() === artistName && a.href.includes('genius.com/artists/'),
    );
    if (artistLink?.href) expectedUrl = artistLink.href;

    const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(artistName)}`;
    const response = await fetch(searchUrl);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      response?: {
        sections?: Array<{
          type?: string;
          hits?: Array<{ result?: { url?: string; name?: string; image_url?: string } }>;
        }>;
      };
    };

    const artistSection = data.response?.sections?.find((section) => section.type === 'artist');
    const hits = artistSection?.hits ?? [];
    if (hits.length === 0) return null;

    let targetHit = expectedUrl ? hits.find((hit) => hit.result?.url === expectedUrl) : undefined;

    if (!targetHit) {
      const lower = artistName.toLowerCase();
      targetHit = hits.find((hit) => hit.result?.name?.toLowerCase() === lower);
    }

    if (!targetHit) {
      const escaped = artistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\b${escaped}\\b`, 'i');
      targetHit = hits.find((hit) => {
        const name = hit.result?.name ?? '';
        return re.test(name);
      });
    }

    const picked = targetHit ?? hits[0];
    return picked?.result?.image_url ?? null;
  } catch {
    return null;
  }
}

export function getDominantColor(img: HTMLImageElement): string {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 'rgb(0,0,0)';

    canvas.width = 100;
    canvas.height = 100;
    context.drawImage(img, 0, 0, 100, 100);

    const imageData = context.getImageData(0, 0, 100, 100).data;
    let r = 0;
    let g = 0;
    let b = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i] ?? 0;
      g += imageData[i + 1] ?? 0;
      b += imageData[i + 2] ?? 0;
    }

    const count = imageData.length / 4;
    return `rgb(${Math.floor(r / count)},${Math.floor(g / count)},${Math.floor(b / count)})`;
  } catch {
    return 'rgb(0,0,0)';
  }
}

export function getContrastColor(rgbString: string): 'black' | 'white' {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'white';

  const r = Number.parseInt(match[1] ?? '0', 10);
  const g = Number.parseInt(match[2] ?? '0', 10);
  const b = Number.parseInt(match[3] ?? '0', 10);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

export function renderLyricCardToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  artistName: string,
  songTitle: string,
  imageObj: HTMLImageElement | null,
  footerColor: string,
  textColor: 'black' | 'white',
  logoObj: HTMLImageElement | null,
  format: '1:1' | '16:9' | '9:16' = '16:9',
  zoom = 1,
) {
  const context = canvas.getContext('2d');
  if (!context) return;

  let width = 1280;
  let height = 720;
  let footerHeight = 140;
  let fontSizeText = 48 * zoom;
  let lineHeightText = 80 * zoom;
  let fontSizeFooter = 28;

  if (format === '1:1') {
    width = 1080;
    height = 1080;
    footerHeight = 160;
    fontSizeText = 54 * zoom;
    lineHeightText = 90 * zoom;
    fontSizeFooter = 32;
  } else if (format === '9:16') {
    width = 1080;
    height = 1920;
    footerHeight = 200;
    fontSizeText = 60 * zoom;
    lineHeightText = 100 * zoom;
    fontSizeFooter = 36;
  }

  canvas.width = width;
  canvas.height = height;

  if (imageObj && imageObj.width > 0) {
    try {
      const imageRatio = imageObj.width / imageObj.height;
      const canvasRatio = width / height;
      let renderWidth = width;
      let renderHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        renderHeight = height;
        renderWidth = imageObj.width * (height / imageObj.height);
        offsetX = (width - renderWidth) / 2;
      } else {
        renderWidth = width;
        renderHeight = imageObj.height * (width / imageObj.width);
        offsetY = (height - renderHeight) / 2;
      }

      context.drawImage(imageObj, offsetX, offsetY, renderWidth, renderHeight);
    } catch {
      context.fillStyle = footerColor || '#000';
      context.fillRect(0, 0, width, height);
    }
  } else {
    context.fillStyle = footerColor || '#000';
    context.fillRect(0, 0, width, height);
  }

  context.fillStyle = footerColor;
  context.fillRect(0, height - footerHeight, width, footerHeight);
  context.fillStyle = textColor;
  context.fillRect(0, height - footerHeight, width, 3);

  const logoHeight = 40;
  let logoWidth = 0;
  if (logoObj) {
    logoWidth = logoObj.width * (logoHeight / logoObj.height);
  } else {
    context.save();
    context.font = '900 36px "Programme", "Arial Black", sans-serif';
    logoWidth = context.measureText('G E N I U S').width;
    context.restore();
  }

  const logoX = width - 60 - logoWidth;
  context.font = `normal ${fontSizeFooter}px "Programme", Arial, sans-serif`;
  context.fillStyle = textColor;
  context.textBaseline = 'middle';

  const firstPart = `${artistName.toUpperCase()},`;
  const secondPart = ` "${songTitle.toUpperCase()}"`;
  const fullText = firstPart + secondPart;
  const maxFooterTextWidth = logoX - 100;

  const truncate = (value: string, maxWidth: number): string => {
    if (context.measureText(value).width <= maxWidth) return value;
    let next = value;
    while (next.length > 0 && context.measureText(`${next}...`).width > maxWidth) {
      next = next.slice(0, -1);
    }
    return `${next}...`;
  };

  if (context.measureText(fullText).width <= maxFooterTextWidth) {
    context.fillText(fullText, 60, height - footerHeight / 2);
  } else {
    const spacing = 4;
    const line1 = truncate(firstPart, maxFooterTextWidth);
    const line2 = truncate(secondPart.trim(), maxFooterTextWidth);
    const line1Y = height - footerHeight / 2 - fontSizeFooter / 2 - spacing;
    const line2Y = height - footerHeight / 2 + fontSizeFooter / 2 + spacing;
    context.fillText(line1, 60, line1Y);
    context.fillText(line2, 60, line2Y);
  }

  if (logoObj) {
    context.drawImage(
      logoObj,
      logoX,
      height - footerHeight / 2 - logoHeight / 2,
      logoWidth,
      logoHeight,
    );
  } else {
    context.save();
    context.textAlign = 'left';
    context.font = '900 36px "Programme", "Arial Black", sans-serif';
    context.fillStyle = textColor;
    context.fillText('G E N I U S', logoX, height - footerHeight / 2);
    context.restore();
  }

  const maxTextWidth = width - 120;
  context.font = `300 ${fontSizeText}px "Programme", Arial, sans-serif`;

  const lines: string[] = [];
  text.split(/\r?\n/).forEach((rawLine) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;

    const words = trimmed.split(/\s+/);
    let currentLine = words[0] ?? '';
    for (let i = 1; i < words.length; i += 1) {
      const candidate = `${currentLine} ${words[i]}`;
      if (context.measureText(candidate).width < maxTextWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = words[i] ?? '';
      }
    }
    if (currentLine) lines.push(currentLine);
  });

  const bottomMargin = 35;
  const startY = height - footerHeight - bottomMargin - lines.length * lineHeightText;
  const lyricsBackgroundColor = textColor === 'white' ? 'white' : 'black';
  const lyricsTextColor = textColor === 'white' ? 'black' : 'white';

  context.textBaseline = 'middle';
  lines.forEach((line, index) => {
    const yCenter = startY + index * lineHeightText + lineHeightText / 2;
    const lineWidth = context.measureText(line).width;
    const padding = 12 * (fontSizeText / 48);
    const rectHeight = fontSizeText * 1.35;
    const rectTop = yCenter - rectHeight / 2;

    context.fillStyle = lyricsBackgroundColor;
    context.fillRect(60 - padding, rectTop, lineWidth + padding * 2, rectHeight);
    context.fillStyle = lyricsTextColor;
    context.fillText(line, 60, yCenter);
  });
}
