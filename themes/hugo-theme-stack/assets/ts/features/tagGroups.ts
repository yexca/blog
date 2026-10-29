/// Index rows for the tags overview page: A–Z for Latin letters, pinyin initials for
/// Chinese, and gojūon rows then A–Z for Japanese. Readings come from the browser's
/// collation data instead of a hand-kept character table:
/// - `zh-u-co-pinyin` sorts Han characters by pinyin, so the first character of each
///   initial ("阿" for A, "八" for B, ...) marks where that letter starts.
/// - CLDR `ja` sorts JIS level-1 kanji in JIS X 0208 order, which follows their
///   representative reading, so "亜", "下", "叉", ... mark where each kana row starts.
///   Level-2 kanji (from "弌") are ordered by radical and stay in "#".
/// Each table is checked against its collator once; if a browser sorts differently,
/// Han characters fall back to "#" rather than to a wrong row.

const zhBoundaries = '阿八嚓哒妸发旮哈讥咔垃妈拏噢妑七呥仨他屲夕丫帀';
const zhLetters = 'ABCDEFGHJKLMNOPQRSTWXYZ';

const jaBoundaries = ['亜', '下', '叉', '他', '奈', '把', '麻', '冶', '羅', '倭'];
const jaRows = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
const jaLevel2Start = '弌';

const kanaRows: Array<[string, string]> = [
    ['あ', 'あいうえおぁぃぅぇぉゔ'],
    ['か', 'かきくけこがぎぐげごゕゖ'],
    ['さ', 'さしすせそざじずぜぞ'],
    ['た', 'たちつてとだぢづでどっ'],
    ['な', 'なにぬねの'],
    ['は', 'はひふへほばびぶべぼぱぴぷぺぽ'],
    ['ま', 'まみむめも'],
    ['や', 'やゆよゃゅょ'],
    ['ら', 'らりるれろ'],
    ['わ', 'わゐゑをんゎ'],
];

const hanPattern = /\p{Script=Han}/u;

type HanLookup = (character: string) => string;

function createCollator(locale: string): Intl.Collator | null {
    try {
        return new Intl.Collator(locale);
    }
    catch {
        return null;
    }
}

/// Last boundary the character sorts at or after, or "#" before the first one.
function lookupBoundary(collator: Intl.Collator, boundaries: string[], labels: string[], character: string): string {
    let label = '#';
    for (let index = 0; index < boundaries.length; index++) {
        if (collator.compare(character, boundaries[index]) < 0) break;
        label = labels[index];
    }
    return label;
}

function isSorted(collator: Intl.Collator, items: string[]): boolean {
    return items.every((item, index) => index === 0 || collator.compare(items[index - 1], item) < 0);
}

let chineseLookup: HanLookup | null = null;
let japaneseLookup: HanLookup | null = null;

function getChineseLookup(): HanLookup {
    if (chineseLookup) return chineseLookup;

    const collator = createCollator('zh-u-co-pinyin');
    const boundaries = Array.from(zhBoundaries);
    const letters = Array.from(zhLetters);
    chineseLookup = collator && isSorted(collator, boundaries)
        ? (character) => lookupBoundary(collator, boundaries, letters, character)
        : () => '#';
    return chineseLookup;
}

function getJapaneseLookup(): HanLookup {
    if (japaneseLookup) return japaneseLookup;

    const collator = createCollator('ja');
    japaneseLookup = collator && isSorted(collator, [...jaBoundaries, jaLevel2Start])
        ? (character) => collator.compare(character, jaLevel2Start) >= 0
            ? '#'
            : lookupBoundary(collator, jaBoundaries, jaRows, character)
        : () => '#';
    return japaneseLookup;
}

function getLatinGroup(character: string): string | null {
    const latin = character.normalize('NFKD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();
    return /^[A-Z]$/.test(latin) ? latin : null;
}

function getKanaRow(character: string): string | null {
    const normalized = character.normalize('NFKC');
    const code = normalized.charCodeAt(0);
    /// Katakana sits 0x60 above the matching hiragana.
    const hiragana = code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : normalized;
    const row = kanaRows.find(([, kana]) => kana.includes(hiragana));
    return row ? row[0] : null;
}

/// `title` may be a tag's `reading` front matter value instead of its title.
export function getTagGroup(title: string, language: string): string {
    const first = Array.from(title.trim())[0] || '';
    if (!first) return '#';

    const latin = getLatinGroup(first);
    if (latin) return latin;

    if (language.startsWith('ja')) {
        const row = getKanaRow(first);
        if (row) return row;
        if (hanPattern.test(first)) return getJapaneseLookup()(first);
    }
    else if (language.startsWith('zh') && hanPattern.test(first)) {
        return getChineseLookup()(first);
    }

    return '#';
}
