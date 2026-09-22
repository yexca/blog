function pageURL(firstURL: string, page: number) {
    return page === 1 ? firstURL : `${firstURL.replace(/\/?$/, '/')}page/${page}/`;
}

export function setupPagination(root: ParentNode = document) {
    root.querySelectorAll('[data-pagination]:not([data-stack-pagination-ready])').forEach((nav: HTMLElement) => {
        const form = nav.querySelector('[data-pagination-jump]') as HTMLFormElement | null;
        const input = form?.querySelector('input[name="page"]') as HTMLInputElement | null;
        if (!form || !input) return;

        nav.dataset.stackPaginationReady = 'true';

        const firstURL = nav.dataset.firstUrl || '/';
        const totalPages = Number(nav.dataset.totalPages || 1);
        const initialValue = input.value;
        let activeTrigger: HTMLElement | null = null;

        const close = (restoreFocus = false) => {
            if (!activeTrigger) return;

            form.hidden = true;
            activeTrigger.hidden = false;
            if (restoreFocus) activeTrigger.focus();
            activeTrigger = null;
            input.value = initialValue;
        };

        /// The input takes the place of whichever trigger opened it, so it appears right where the user clicked.
        const open = (trigger: HTMLElement) => {
            close();
            activeTrigger = trigger;
            trigger.after(form);
            trigger.hidden = true;
            form.hidden = false;
            input.focus();
            input.select();
        };

        nav.querySelectorAll('[data-pagination-jump-trigger]').forEach((trigger: HTMLElement) => {
            trigger.addEventListener('click', () => open(trigger));
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const page = Math.min(Math.max(Number.parseInt(input.value, 10) || 1, 1), totalPages);
            if (String(page) === initialValue) {
                close(true);
                return;
            }

            window.location.assign(pageURL(firstURL, page));
        });

        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            close(true);
        });

        form.addEventListener('focusout', (event) => {
            if (form.contains(event.relatedTarget as Node | null)) return;
            close();
        });
    });
}
