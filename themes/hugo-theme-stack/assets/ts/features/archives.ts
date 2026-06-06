export function setupArchives() {
    const archiveContent = document.querySelector('.archive-year-content:not([data-stack-archives-ready])') as HTMLElement | null;
    if (!archiveContent) return;

    archiveContent.dataset.stackArchivesReady = 'true';

    const defaultYear = archiveContent.dataset.defaultYear;
    const stage = document.querySelector('[data-archive-stage]') as HTMLElement | null;
    const rail = document.querySelector('[data-archive-rail]') as HTMLElement | null;
    const track = document.querySelector('[data-archive-track]') as HTMLElement | null;
    const panels = Array.from(document.querySelectorAll('[data-archive-panel]')) as HTMLElement[];
    const links = Array.from(document.querySelectorAll('[data-archive-year]')) as HTMLElement[];
    const stepButtons = Array.from(document.querySelectorAll('[data-archive-step]')) as HTMLButtonElement[];
    const years = panels.map((panel) => panel.dataset.archivePanel).filter(Boolean) as string[];
    let activeYear: string | null = null;
    let animationTimer: number | undefined;

    const isCurrentArchive = () => document.contains(archiveContent);

    function getTargetYear() {
        const hashYear = decodeURIComponent(window.location.hash.replace('#', ''));
        return years.includes(hashYear) ? hashYear : defaultYear;
    }

    function getExpandX() {
        if (!stage || !rail) return 100;
        const stageRect = stage.getBoundingClientRect();
        const railRect = rail.getBoundingClientRect();
        const railOffset = railRect.left - stageRect.left;
        const railTarget = Math.min(Math.max(railRect.width * 0.2, 120), 180);
        return Math.round(railOffset + railTarget);
    }

    function getStaticCenter(element: HTMLElement, ancestor: HTMLElement) {
        let center = element.offsetWidth / 2;
        let node: HTMLElement | null = element;

        while (node && node !== ancestor) {
            center += node.offsetLeft;
            node = node.offsetParent as HTMLElement | null;
        }

        if (node === ancestor) return center;

        const elementRect = element.getBoundingClientRect();
        const ancestorRect = ancestor.getBoundingClientRect();
        const transform = Number.parseFloat(track?.dataset.archiveOffset || '0');
        return elementRect.left - ancestorRect.left - transform + elementRect.width / 2;
    }

    function moveTrack(year?: string) {
        if (!stage || !rail || !track || !year) return;
        const expandX = getExpandX();
        stage.style.setProperty('--archive-line-left', `${expandX}px`);
        archiveContent.style.setProperty('--archive-line-left', `${expandX}px`);

        const link = links.find((item) => item.dataset.archiveYear === year);
        if (!link) return;

        const dot = link.querySelector('.archive-year-dot') as HTMLElement | null;
        const currentCenter = getStaticCenter(dot || link, stage);
        const nextTransform = expandX - currentCenter;

        track.style.transform = `translate3d(${nextTransform}px, 0, 0)`;
        track.dataset.archiveOffset = String(nextTransform);
    }

    function updateControls(year?: string) {
        if (!year) return;
        const index = years.indexOf(year);
        stepButtons.forEach((button) => {
            const direction = button.dataset.archiveStep;
            const targetIndex = direction === 'newer' ? index - 1 : index + 1;
            button.disabled = targetIndex < 0 || targetIndex >= years.length;
        });
    }

    function setActiveLink(year?: string) {
        if (!year) return;
        links.forEach((link) => {
            const isActive = link.dataset.archiveYear === year;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function openPanel(panel: HTMLElement, animate: boolean) {
        panel.hidden = false;
        panel.classList.add('is-active');

        if (!animate) {
            panel.style.maxHeight = '';
            panel.style.opacity = '';
            return;
        }

        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
        requestAnimationFrame(() => {
            panel.style.maxHeight = `${panel.scrollHeight}px`;
            panel.style.opacity = '1';
        });

        animationTimer = window.setTimeout(() => {
            panel.style.maxHeight = '';
        }, 460);
    }

    function closePanel(panel: HTMLElement, done: () => void) {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        panel.style.opacity = '1';
        panel.classList.remove('is-active');

        requestAnimationFrame(() => {
            panel.style.maxHeight = '0px';
            panel.style.opacity = '0';
        });

        animationTimer = window.setTimeout(() => {
            panel.hidden = true;
            done();
        }, 280);
    }

    function showYear(year: string | undefined, animate: boolean) {
        if (!isCurrentArchive()) return;
        if (!year || !years.includes(year)) year = defaultYear;
        if (!year) return;

        if (activeYear === year) {
            moveTrack(year);
            setActiveLink(year);
            return;
        }

        window.clearTimeout(animationTimer);
        const previousPanel = panels.find((panel) => panel.dataset.archivePanel === activeYear);
        const nextPanel = panels.find((panel) => panel.dataset.archivePanel === year);
        if (!nextPanel) return;

        activeYear = year;
        setActiveLink(year);
        updateControls(year);

        const reveal = () => {
            moveTrack(year);
            window.setTimeout(() => openPanel(nextPanel, animate), animate ? 260 : 0);
        };

        if (previousPanel && animate) {
            closePanel(previousPanel, reveal);
        } else {
            panels.forEach((panel) => {
                panel.hidden = panel !== nextPanel;
                panel.classList.toggle('is-active', panel === nextPanel);
                panel.style.maxHeight = '';
                panel.style.opacity = '';
            });
            reveal();
        }
    }

    function navigateToYear(year?: string) {
        if (!year) return;
        if (window.location.hash !== `#${year}`) {
            history.pushState(null, '', `#${year}`);
        }
        showYear(year, true);
    }

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navigateToYear(link.dataset.archiveYear);
        });
    });

    stepButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = years.indexOf(activeYear || getTargetYear() || '');
            const targetIndex = button.dataset.archiveStep === 'newer' ? index - 1 : index + 1;
            const targetYear = years[targetIndex];
            if (targetYear) navigateToYear(targetYear);
        });
    });

    showYear(getTargetYear(), false);
    window.addEventListener('hashchange', () => showYear(getTargetYear(), true));
    window.addEventListener('resize', () => moveTrack(activeYear || getTargetYear()));
}
