const mobileQuery = '(max-width: 767.98px)';

function closePopover(details: HTMLDetailsElement) {
    details.open = false;
}

function closeHeaderSearch(form: HTMLFormElement) {
    form.classList.remove('is-open');
    const input = form.querySelector('input') as HTMLInputElement | null;
    if (input) {
        input.setAttribute('aria-hidden', 'true');
        input.tabIndex = -1;
    }
}

function setupDocumentHandlers() {
    const documentElement = document.documentElement;
    if (documentElement.dataset.stackHeaderDocumentReady === 'true') return;

    documentElement.dataset.stackHeaderDocumentReady = 'true';

    document.addEventListener('click', (event) => {
        const target = event.target as Node;

        document.querySelectorAll('details[data-header-popover][open]').forEach((details) => {
            if (!details.contains(target)) closePopover(details as HTMLDetailsElement);
        });

        document.querySelectorAll('form[data-header-search].is-open').forEach((form) => {
            if (!form.contains(target)) closeHeaderSearch(form as HTMLFormElement);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        document.querySelectorAll('details[data-header-popover][open]').forEach((details) => {
            closePopover(details as HTMLDetailsElement);
        });

        document.querySelectorAll('form[data-header-search].is-open').forEach((form) => {
            closeHeaderSearch(form as HTMLFormElement);
        });
    });
}

function setupSearchForm(form: HTMLFormElement) {
    if (form.dataset.stackHeaderSearchReady === 'true') return;
    form.dataset.stackHeaderSearchReady = 'true';

    const input = form.querySelector('input') as HTMLInputElement | null;
    const button = form.querySelector('button') as HTMLButtonElement | null;
    if (!input || !button) return;

    input.setAttribute('aria-hidden', 'true');
    input.tabIndex = -1;

    button.addEventListener('click', (event) => {
        if (window.matchMedia(mobileQuery).matches) {
            event.preventDefault();
            const action = form.getAttribute('action');
            if (action) window.location.assign(new URL(action, window.location.href).href);
            return;
        }

        if (!form.classList.contains('is-open')) {
            event.preventDefault();
            form.classList.add('is-open');
            input.removeAttribute('aria-hidden');
            input.removeAttribute('tabindex');
            window.setTimeout(() => input.focus(), 0);
        }
    });

    form.addEventListener('submit', (event) => {
        if (!input.value.trim()) {
            event.preventDefault();
            closeHeaderSearch(form);
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeHeaderSearch(form);
            button.focus();
        }
    });
}

function setupPopover(details: HTMLDetailsElement) {
    if (details.dataset.stackHeaderPopoverReady === 'true') return;
    details.dataset.stackHeaderPopoverReady = 'true';

    details.querySelectorAll('[data-color-scheme-option]').forEach((option) => {
        option.addEventListener('click', () => {
            window.setTimeout(() => closePopover(details), 0);
        });
    });
}

export function setupHeader(root: ParentNode = document) {
    setupDocumentHandlers();

    root.querySelectorAll('[data-site-header]').forEach((header) => {
        const siteHeader = header as HTMLElement;
        if (siteHeader.dataset.stackHeaderReady !== 'true') {
            siteHeader.dataset.stackHeaderReady = 'true';
        }

        const searchForm = siteHeader.querySelector('form[data-header-search]') as HTMLFormElement | null;
        if (searchForm) setupSearchForm(searchForm);

        siteHeader.querySelectorAll('details[data-header-popover]').forEach((details) => {
            setupPopover(details as HTMLDetailsElement);
        });
    });
}
