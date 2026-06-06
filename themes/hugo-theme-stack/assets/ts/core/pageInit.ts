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
import { setupTaxonomyPages } from "ts/features/taxonomyPages";

export function initPage() {
    menu();
    setupStickySidebar();

    const articleContent = document.querySelector('.article-content') as HTMLElement;
    if (articleContent) {
        new StackGallery(articleContent);
        setupSmoothAnchors();
        setupScrollspy();
    }

    setupGithubInfoCards();
    setupAboutVersions();
    setupAbout2026();
    setupTaxonomyPages();
    setupArchives();
    setupArticleTiles();
    setupCodeBlocks();

    new StackColorScheme(document.getElementById('dark-mode-toggle'));
}
