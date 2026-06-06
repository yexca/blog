import { getColor } from 'ts/color';

export function setupArticleTiles(root: ParentNode = document) {
    const articleTile = root.querySelector('.article-list--tile');
    if (!articleTile) return;

    let observer = new IntersectionObserver(async (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            const articles = entry.target.querySelectorAll('article.has-image');
            articles.forEach(async articles => {
                const image = articles.querySelector('img'),
                    imageURL = image?.src,
                    key = image?.getAttribute('data-key'),
                    hash = image?.getAttribute('data-hash'),
                    articleDetails: HTMLDivElement = articles.querySelector('.article-details');

                if (!imageURL || !articleDetails) return;

                const colors = await getColor(key, hash, imageURL);
                if (!colors?.DarkMuted || !colors?.Vibrant) return;

                articleDetails.style.background = `
                linear-gradient(0deg,
                    rgba(${colors.DarkMuted.rgb[0]}, ${colors.DarkMuted.rgb[1]}, ${colors.DarkMuted.rgb[2]}, 0.5) 0%,
                    rgba(${colors.Vibrant.rgb[0]}, ${colors.Vibrant.rgb[1]}, ${colors.Vibrant.rgb[2]}, 0.75) 100%)`;
            })
        })
    });

    observer.observe(articleTile)
}
