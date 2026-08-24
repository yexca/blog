type colorScheme = 'light' | 'dark' | 'auto';

class StackColorScheme {
    private localStorageKey = 'StackColorScheme';
    private currentScheme: colorScheme;
    private systemPreferScheme: colorScheme;

    constructor(toggleEl?: HTMLElement | null) {
        this.bindMatchMedia();
        this.currentScheme = this.getSavedScheme();
        if (window.matchMedia('(prefers-color-scheme: dark)').matches === true)
            this.systemPreferScheme = 'dark'
        else
            this.systemPreferScheme = 'light';

        this.dispatchEvent(document.documentElement.dataset.scheme as colorScheme);

        if (toggleEl)
            this.bindClick(toggleEl);

        this.bindSchemeOptions();
        this.updateSchemeOptions();

        if (document.body.style.transition == '')
            document.body.style.setProperty('transition', 'background-color .3s ease');
    }

    private saveScheme() {
        localStorage.setItem(this.localStorageKey, this.currentScheme);
    }

    private applyScheme(scheme: colorScheme) {
        this.currentScheme = scheme;
        this.setBodyClass();
        this.saveScheme();
        this.updateSchemeOptions();
    }

    private bindClick(toggleEl: HTMLElement) {
        toggleEl.addEventListener('click', (e) => {
            let nextScheme: colorScheme;

            if (this.isDark()) {
                /// Disable dark mode
                nextScheme = 'light';
            }
            else {
                nextScheme = 'dark';
            }

            if (nextScheme == this.systemPreferScheme) {
                /// Set to auto
                nextScheme = 'auto';
            }

            this.applyScheme(nextScheme);
        })
    }

    private bindSchemeOptions() {
        document.querySelectorAll('[data-color-scheme-option]').forEach((option: Element) => {
            const element = option as HTMLElement;
            if (element.dataset.stackColorSchemeReady === 'true') return;

            element.dataset.stackColorSchemeReady = 'true';
            element.addEventListener('click', () => {
                const scheme = element.dataset.colorScheme as colorScheme;
                if (scheme !== 'light' && scheme !== 'dark' && scheme !== 'auto') return;
                this.applyScheme(scheme);
            });
        });
    }

    private updateSchemeOptions() {
        document.querySelectorAll('[data-color-scheme-option]').forEach((option: Element) => {
            const element = option as HTMLElement;
            const selected = element.dataset.colorScheme === this.currentScheme;
            element.setAttribute('aria-checked', selected ? 'true' : 'false');
            element.classList.toggle('is-selected', selected);
        });
    }

    private isDark() {
        return (this.currentScheme == 'dark' || this.currentScheme == 'auto' && this.systemPreferScheme == 'dark');
    }

    private dispatchEvent(colorScheme: colorScheme) {
        const event = new CustomEvent('onColorSchemeChange', {
            detail: colorScheme
        });
        window.dispatchEvent(event);
    }

    private setBodyClass() {
        if (this.isDark()) {
            document.documentElement.dataset.scheme = 'dark';
        }
        else {
            document.documentElement.dataset.scheme = 'light';
        }

        this.dispatchEvent(document.documentElement.dataset.scheme as colorScheme);
    }

    private getSavedScheme(): colorScheme {
        const savedScheme = localStorage.getItem(this.localStorageKey);

        if (savedScheme == 'light' || savedScheme == 'dark' || savedScheme == 'auto') return savedScheme;
        else return 'auto';
    }

    private bindMatchMedia() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                this.systemPreferScheme = 'dark';
            }
            else {
                this.systemPreferScheme = 'light';
            }
            this.setBodyClass();
            this.updateSchemeOptions();
        });
    }
}

export default StackColorScheme;
