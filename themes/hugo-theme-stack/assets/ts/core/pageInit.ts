import StackGallery from "ts/gallery";
import menu from 'ts/menu';
import StackColorScheme from 'ts/colorScheme';
import { setupScrollspy } from 'ts/scrollspy';
import { setupSmoothAnchors } from "ts/smoothAnchors";
import { setupStickySidebar } from "ts/stickySidebar";
import { setupAbout2026 } from "ts/features/about2026";
import { setupAboutVersions } from "ts/features/aboutVersions";
import { setupArchives } from "ts/features/archives";
import { setupArticleTiles } from "ts/features/articleTiles";
import { setupCodeBlocks } from "ts/features/codeBlocks";
import { setupGithubInfoCards } from "ts/features/githubInfoCards";
import { setupMermaid } from "ts/features/mermaid";
import { setupTaxonomyPages } from "ts/features/taxonomyPages";
import { setupTwikooComments } from "ts/features/twikooComments";
import { setupFooterRuntime } from "ts/features/footerRuntime";
import { setupHeader } from "ts/features/header";

type Feature = {
    selector: string;
    setup: (root?: ParentNode) => void;
};

const features: Feature[] = [
    { selector: '[data-site-header]', setup: setupHeader },
    { selector: '.github-info-card', setup: setupGithubInfoCards },
    { selector: '[data-about-versions]', setup: setupAboutVersions },
    { selector: '[data-about-2026]', setup: setupAbout2026 },
    { selector: '[data-taxonomy-categories], [data-taxonomy-tags], .taxonomy-post-card', setup: setupTaxonomyPages },
    { selector: '[data-archive-stage]', setup: setupArchives },
    { selector: '.article-list--tile', setup: setupArticleTiles },
    { selector: '.article-content div.highlight', setup: setupCodeBlocks },
    { selector: '.article-content .mermaid', setup: setupMermaid },
    { selector: '[data-twikoo]', setup: setupTwikooComments },
    { selector: '#htmer_time', setup: setupFooterRuntime },
];

export function initPage(root: ParentNode = document) {
    menu();
    setupStickySidebar();

    const articleContent = root.querySelector('.article-content') as HTMLElement;
    if (articleContent) {
        new StackGallery(articleContent);
        setupSmoothAnchors();
        setupScrollspy();
    }

    features.forEach((feature) => {
        if (root.querySelector(feature.selector)) feature.setup(root);
    });

    new StackColorScheme(document.getElementById('dark-mode-toggle'));
}
