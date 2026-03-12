export function isValidNumber(str: string): boolean {
  if (!str || str.trim() === '') return false;
  return /^\d+$/.test(str.trim());
}

export function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro';

  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = [
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];
  const tens = [
    '',
    '',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
    'soixante',
    'quatre-vingt',
    'quatre-vingt',
  ];

  function convertUpTo99(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];

    const ten = Math.floor(n / 10);
    const one = n % 10;

    if (ten === 7) {
      if (one === 0) return 'soixante-dix';
      if (one === 1) return 'soixante et onze';
      return `soixante-${teens[one]}`;
    }

    if (ten === 9) {
      if (one === 0) return 'quatre-vingt-dix';
      return `quatre-vingt-${teens[one]}`;
    }

    if (one === 0) {
      if (ten === 8) return 'quatre-vingts';
      return tens[ten];
    }

    if (one === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
      return `${tens[ten]} et un`;
    }

    if (ten === 8) return `quatre-vingt-${ones[one]}`;
    return `${tens[ten]}-${ones[one]}`;
  }

  function convertUpTo999(n: number): string {
    if (n < 100) return convertUpTo99(n);

    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    let result = hundred === 1 ? 'cent' : `${ones[hundred]} cent`;

    if (rest === 0 && hundred > 1) {
      result += 's';
    } else if (rest > 0) {
      result += ` ${convertUpTo99(rest)}`;
    }

    return result;
  }

  if (num < 0 || num > 999999999999) return num.toString();
  if (num < 1000) return convertUpTo999(num);

  if (num >= 1000000000) {
    const billions = Math.floor(num / 1000000000);
    const rest = num % 1000000000;
    let result = billions === 1 ? 'un milliard' : `${convertUpTo999(billions)} milliards`;
    if (rest > 0) result += ` ${numberToFrenchWords(rest)}`;
    return result;
  }

  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    const rest = num % 1000000;
    let result = millions === 1 ? 'un million' : `${convertUpTo999(millions)} millions`;
    if (rest > 0) result += ` ${numberToFrenchWords(rest)}`;
    return result;
  }

  const thousand = Math.floor(num / 1000);
  const rest = num % 1000;
  let result = thousand === 1 ? 'mille' : `${convertUpTo999(thousand)} mille`;
  if (rest > 0) result += ` ${convertUpTo999(rest)}`;
  return result;
}

export function numberToEnglishWords(num: number): string {
  if (num === 0) return 'zero';

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  function convertUpTo99(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];

    const ten = Math.floor(n / 10);
    const one = n % 10;

    if (one === 0) return tens[ten];
    return `${tens[ten]}-${ones[one]}`;
  }

  function convertUpTo999(n: number): string {
    if (n < 100) return convertUpTo99(n);

    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    let result = `${ones[hundred]} hundred`;
    if (rest > 0) result += ` ${convertUpTo99(rest)}`;
    return result;
  }

  if (num < 0 || num > 999999999999) return num.toString();
  if (num < 1000) return convertUpTo999(num);

  if (num >= 1000000000) {
    const billions = Math.floor(num / 1000000000);
    const rest = num % 1000000000;
    let result = `${convertUpTo999(billions)} billion`;
    if (rest > 0) result += ` ${numberToEnglishWords(rest)}`;
    return result;
  }

  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    const rest = num % 1000000;
    let result = `${convertUpTo999(millions)} million`;
    if (rest > 0) result += ` ${numberToEnglishWords(rest)}`;
    return result;
  }

  const thousand = Math.floor(num / 1000);
  const rest = num % 1000;
  let result = `${convertUpTo999(thousand)} thousand`;
  if (rest > 0) result += ` ${convertUpTo999(rest)}`;
  return result;
}

export function numberToPolishWords(num: number): string {
  if (num === 0) return 'zero';

  const ones = [
    '',
    'jeden',
    'dwa',
    'trzy',
    'cztery',
    'pięć',
    'sześć',
    'siedem',
    'osiem',
    'dziewięć',
  ];
  const teens = [
    'dziesięć',
    'jedenaście',
    'dwanaście',
    'trzynaście',
    'czternaście',
    'piętnaście',
    'szesnaście',
    'siedemnaście',
    'osiemnaście',
    'dziewiętnaście',
  ];
  const tens = [
    '',
    '',
    'dwadzieścia',
    'trzydzieści',
    'czterdzieści',
    'pięćdziesiąt',
    'sześćdziesiąt',
    'siedemdziesiąt',
    'osiemdziesiąt',
    'dziewięćdziesiąt',
  ];
  const hundreds = [
    '',
    'sto',
    'dwieście',
    'trzysta',
    'czterysta',
    'pięćset',
    'sześćset',
    'siedemset',
    'osiemset',
    'dziewięćset',
  ];

  function convertUpTo99(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];

    const ten = Math.floor(n / 10);
    const one = n % 10;

    if (one === 0) return tens[ten];
    return `${tens[ten]} ${ones[one]}`;
  }

  function convertUpTo999(n: number): string {
    if (n < 100) return convertUpTo99(n);

    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    let result = hundreds[hundred];
    if (rest > 0) result += ` ${convertUpTo99(rest)}`;
    return result;
  }

  function getThousandForm(n: number): string {
    if (n === 1) return 'tysiąc';
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'tysięcy';
    if (lastDigit >= 2 && lastDigit <= 4) return 'tysiące';
    return 'tysięcy';
  }

  function getMillionForm(n: number): string {
    if (n === 1) return 'milion';
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'milionów';
    if (lastDigit >= 2 && lastDigit <= 4) return 'miliony';
    return 'milionów';
  }

  function getBillionForm(n: number): string {
    if (n === 1) return 'miliard';
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'miliardów';
    if (lastDigit >= 2 && lastDigit <= 4) return 'miliardy';
    return 'miliardów';
  }

  if (num < 0 || num > 999999999999) return num.toString();
  if (num < 1000) return convertUpTo999(num);

  if (num >= 1000000000) {
    const billions = Math.floor(num / 1000000000);
    const rest = num % 1000000000;
    let result = (billions === 1 ? '' : `${convertUpTo999(billions)} `) + getBillionForm(billions);
    if (rest > 0) result += ` ${numberToPolishWords(rest)}`;
    return result.trim();
  }

  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    const rest = num % 1000000;
    let result = (millions === 1 ? '' : `${convertUpTo999(millions)} `) + getMillionForm(millions);
    if (rest > 0) result += ` ${numberToPolishWords(rest)}`;
    return result.trim();
  }

  const thousand = Math.floor(num / 1000);
  const rest = num % 1000;
  let result = (thousand === 1 ? '' : `${convertUpTo999(thousand)} `) + getThousandForm(thousand);
  if (rest > 0) result += ` ${convertUpTo999(rest)}`;
  return result.trim();
}
