export function setupAboutVersions() {
    document.querySelectorAll('[data-about-versions]:not([data-stack-about-ready])').forEach((container: HTMLElement) => {
        const panels = Array.from(container.querySelectorAll('[data-about-version-panel]')) as HTMLElement[];
        const timeline = container.querySelector('.about-version-timeline') as HTMLElement | null;
        if (!timeline || !panels.length) return;

        const tabs = panels.map((panel, index) => {
            const id = panel.dataset.aboutVersionPanel || `version-${index + 1}`;
            const label = panel.dataset.aboutVersionLabel || id;
            const button = document.createElement('button');
            const marker = document.createElement('span');
            const text = document.createElement('span');

            button.type = 'button';
            button.classList.add('about-version-tab');
            button.dataset.aboutVersionTab = id;
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', panel.id);
            button.id = `about-version-tab-${id}`;

            marker.classList.add('about-version-marker');
            marker.setAttribute('aria-hidden', 'true');
            text.classList.add('about-version-label');
            text.textContent = label;

            button.append(marker, text);
            timeline.append(button);

            panel.setAttribute('aria-labelledby', button.id);

            return button;
        });

        const activateVersion = (targetID: string, updateHash = true) => {
            tabs.forEach((tab) => {
                const isActive = tab.dataset.aboutVersionTab === targetID;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.aboutVersionPanel === targetID;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });

            if (updateHash) {
                history.replaceState(null, '', `${window.location.pathname}${window.location.search}#about-${targetID}`);
            }
        };

        const hashID = window.location.hash.startsWith('#about-')
            ? window.location.hash.replace('#about-', '')
            : tabs[0].dataset.aboutVersionTab;
        const initialID = hashID === 'latest' ? '2026' : hashID;

        const resolvedInitialID = initialID && tabs.some((tab) => tab.dataset.aboutVersionTab === initialID)
            ? initialID
            : tabs[0].dataset.aboutVersionTab;

        if (resolvedInitialID) activateVersion(resolvedInitialID, false);
        container.dataset.stackAboutReady = 'true';

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                if (!tab.dataset.aboutVersionTab) return;
                activateVersion(tab.dataset.aboutVersionTab);
            });
        });
    });
}
