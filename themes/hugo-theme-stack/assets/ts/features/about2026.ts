export function setupAbout2026() {
    document.querySelectorAll('[data-about-2026]:not([data-stack-about-2026-ready])').forEach((container: HTMLElement) => {
        container.setAttribute('data-stack-about-2026-ready', 'true');

        const universeBlocks = Array.from(container.querySelectorAll('.about-universe')) as HTMLElement[];
        let pointerX = Number.NaN;
        let pointerY = Number.NaN;

        window.addEventListener('pointermove', (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
        }, { passive: true });

        universeBlocks.forEach((universe) => {
            const orbitItems = Array.from(universe.querySelectorAll('.about-orbit-item')) as HTMLElement[];
            if (!orbitItems.length) return;

            const states = orbitItems.map((item, index) => {
                const planet = item.querySelector('.about-planet') as HTMLElement | null;
                const isOuter = item.classList.contains('about-orbit-item-vrc') || item.classList.contains('about-orbit-item-music');
                const isLow = item.classList.contains('about-orbit-item-vrc-github');
                const isBlog = item.classList.contains('about-orbit-item-blog');
                const isGithub = item.classList.contains('about-orbit-item-github');
                const isVrc = item.classList.contains('about-orbit-item-vrc');
                const isMusic = item.classList.contains('about-orbit-item-music');
                const duration = Number.parseFloat(item.style.getPropertyValue('--orbit-duration')) || 38;
                const delay = Number.parseFloat(item.style.getPropertyValue('--orbit-delay')) || 0;
                const rest = isBlog
                    ? { x: -0.74, y: -0.58 }
                    : isGithub
                        ? { x: 0.74, y: -0.58 }
                        : isVrc
                            ? { x: -0.82, y: 0.52 }
                            : isMusic
                                ? { x: 0.82, y: 0.52 }
                                : { x: 0, y: 0.82 };

                return {
                    item,
                    planet,
                    angle: ((index / orbitItems.length) * Math.PI * 2) - delay,
                    duration,
                    x: 0,
                    y: 0,
                    rest,
                    xFactor: isOuter ? 0.88 : isLow ? 0.54 : 0.72,
                    yFactor: isOuter ? 0.82 : isLow ? 0.88 : 0.58,
                };
            });

            let isHovering = false;
            let lastTime = performance.now();

            const renderOrbit = (time: number) => {
                const rect = universe.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const padding = 26;
                const delta = Math.min(64, time - lastTime);
                lastTime = time;
                const isStacked = window.matchMedia('(max-width: 620px)').matches;
                const pointerInside = pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom;
                const shouldRest = isHovering || pointerInside || universe.matches(':hover');
                universe.classList.toggle('is-orbit-resting', shouldRest);

                states.forEach((state) => {
                    if (!state.planet) return;

                    if (isStacked) {
                        state.x = 0;
                        state.y = 0;
                        state.item.style.transform = 'none';
                        return;
                    }

                    const planetRect = state.planet.getBoundingClientRect();
                    const maxX = Math.max(0, centerX - planetRect.width / 2 - padding);
                    const maxY = Math.max(0, centerY - planetRect.height / 2 - padding);
                    const radiusX = maxX * state.xFactor;
                    const radiusY = maxY * state.yFactor;

                    if (!isHovering) {
                        state.angle += (delta / 1000) * (Math.PI * 2 / state.duration);
                    }

                    const targetX = shouldRest ? state.rest.x * maxX : Math.cos(state.angle) * radiusX;
                    const targetY = shouldRest ? state.rest.y * maxY : Math.sin(state.angle) * radiusY;
                    const ease = shouldRest ? 0.16 : 0.1;
                    state.x += (targetX - state.x) * ease;
                    state.y += (targetY - state.y) * ease;
                    const x = Math.max(-maxX, Math.min(maxX, state.x));
                    const y = Math.max(-maxY, Math.min(maxY, state.y));
                    state.x = x;
                    state.y = y;

                    state.item.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
                });

                window.requestAnimationFrame(renderOrbit);
            };

            universe.addEventListener('pointerenter', () => {
                isHovering = true;
                universe.classList.add('is-orbit-resting');
            });

            universe.addEventListener('pointerleave', () => {
                isHovering = false;
                universe.classList.remove('is-orbit-resting');
            });

            states.forEach((state) => {
                state.planet?.addEventListener('pointerenter', () => {
                    isHovering = true;
                    universe.classList.add('is-orbit-resting');
                });
            });

            window.requestAnimationFrame(renderOrbit);
        });

        const sliderBlocks = Array.from(container.querySelectorAll('[data-about-card-slider]')) as HTMLElement[];
        sliderBlocks.forEach((slider) => {
            const cards = Array.from(slider.querySelectorAll('[data-about-slider-card]')) as HTMLElement[];
            const stage = slider.querySelector('[data-about-slider-stage]') as HTMLElement | null;
            const previous = slider.querySelector('[data-about-slider-prev]') as HTMLButtonElement | null;
            const next = slider.querySelector('[data-about-slider-next]') as HTMLButtonElement | null;
            const dotContainer = slider.querySelector('.about-slider-dots') as HTMLElement | null;
            if (!cards.length) return;

            let activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains('is-active')));

            const dots = cards.map((_, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.classList.add('about-slider-dot');
                button.setAttribute('aria-label', `Show card ${index + 1}`);
                button.addEventListener('click', () => setActive(index));
                dotContainer?.append(button);
                return button;
            });

            const shortestOffset = (index: number) => {
                const count = cards.length;
                let offset = index - activeIndex;
                if (offset > count / 2) offset -= count;
                if (offset < -count / 2) offset += count;
                return offset;
            };

            function setActive(index: number) {
                const count = cards.length;
                activeIndex = (index + count) % count;

                cards.forEach((card, cardIndex) => {
                    const offset = shortestOffset(cardIndex);
                    const isActive = offset === 0;
                    const isPrevious = offset === -1;
                    const isNext = offset === 1;

                    card.classList.toggle('is-active', isActive);
                    card.classList.toggle('is-prev', isPrevious);
                    card.classList.toggle('is-next', isNext);
                    card.classList.toggle('is-side', isPrevious || isNext);
                    card.classList.toggle('is-hidden', !isActive && !isPrevious && !isNext);
                    card.style.setProperty('--slot', String(Math.max(-1, Math.min(1, offset))));
                    card.setAttribute('aria-hidden', isActive || isPrevious || isNext ? 'false' : 'true');
                });

                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle('is-active', dotIndex === activeIndex);
                    dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
                });

                slider.dataset.sliderBg = cards[activeIndex]?.dataset.aboutSliderBg || '';
                slider.style.setProperty('--about-slider-bg-offset', `${activeIndex * -4}%`);
            }

            previous?.addEventListener('click', () => setActive(activeIndex - 1));
            next?.addEventListener('click', () => setActive(activeIndex + 1));

            cards.forEach((card, index) => {
                card.addEventListener('click', (event) => {
                    if (index === activeIndex) return;
                    event.preventDefault();
                    setActive(index);
                });
            });

            stage?.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') setActive(activeIndex - 1);
                if (event.key === 'ArrowRight') setActive(activeIndex + 1);
            });

            stage?.setAttribute('tabindex', '0');

            setActive(activeIndex);
        });

        const historyBlocks = Array.from(container.querySelectorAll('[data-about-git-history]')) as HTMLElement[];
        historyBlocks.forEach((history) => {
            const commits = Array.from(history.querySelectorAll('.about-commit')) as HTMLButtonElement[];
            const date = history.querySelector('[data-about-commit-date]') as HTMLElement | null;
            const title = history.querySelector('[data-about-commit-title]') as HTMLElement | null;
            const body = history.querySelector('[data-about-commit-body]') as HTMLElement | null;
            const card = history.querySelector('.about-commit-card') as HTMLElement | null;

            const selectCommit = (commit: HTMLButtonElement) => {
                commits.forEach((item) => item.classList.remove('is-active'));
                commit.classList.add('is-active');
                if (date) date.textContent = commit.dataset.date || '';
                if (title) title.textContent = commit.dataset.title || '';
                if (body) body.textContent = commit.dataset.body || '';

                const x = Number.parseFloat(commit.style.getPropertyValue('--x'));
                if (card && Number.isFinite(x)) {
                    card.classList.toggle('is-bottom-right', x < 50);
                    card.classList.toggle('is-top-left', x >= 50);
                }
            };

            commits.forEach((commit) => {
                commit.addEventListener('click', () => selectCommit(commit));
            });

            const activeCommit = commits.find((commit) => commit.classList.contains('is-active')) || commits[0];
            if (activeCommit) selectCommit(activeCommit);
        });

        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!canHover) return;

        container.querySelectorAll('[data-about-tilt]').forEach((card: HTMLElement) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
                card.style.setProperty('--about-tilt', `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`);
            });

            card.addEventListener('pointerleave', () => {
                card.style.removeProperty('--about-tilt');
            });
        });
    });
}
