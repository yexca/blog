/*!
*   Hugo Theme Stack
*
*   @author: Jimmy Cai
*   @website: https://jimmycai.com
*   @link: https://github.com/CaiJimmy/hugo-theme-stack
*/
import StackGallery from "ts/gallery";
import { getColor } from 'ts/color';
import menu from 'ts/menu';
import createElement from 'ts/createElement';
import StackColorScheme from 'ts/colorScheme';
import { setupScrollspy } from 'ts/scrollspy';
import { setupSmoothAnchors } from "ts/smoothAnchors";
import { setupStickySidebar } from "ts/stickySidebar";
import { setupPageTransitions } from "ts/pageTransitions";

function setupGithubInfoCards() {
    const cards = document.querySelectorAll('.github-info-card:not([data-stack-github-ready])');

    cards.forEach((card: HTMLElement) => {
        card.dataset.stackGithubReady = 'true';

        const author = card.dataset.author || '';
        const project = card.dataset.project || '';
        const description = card.querySelector('.github-info-card-description') as HTMLElement | null;
        const homepageRow = card.querySelector('.github-info-card-homepage') as HTMLElement | null;
        const stars = card.querySelector('.github-info-card-stars') as HTMLElement | null;
        const forks = card.querySelector('.github-info-card-forks') as HTMLElement | null;
        const isMini = card.classList.contains('github-info-card-mini');
        const text = {
            loading: card.dataset.textLoading || 'Loading...',
            missingRepo: card.dataset.textMissingRepo || 'Missing repository name',
            noDescription: card.dataset.textNoDescription || 'No description',
            notFound: card.dataset.textNotFound || 'Repository not found',
            failed: card.dataset.textFailed || 'Failed to get repository information',
        };

        if (!author || !project || !description) {
            if (description) description.textContent = text.missingRepo;
            return;
        }

        description.textContent = text.loading;
        if (stars) stars.textContent = '-';
        if (forks) forks.textContent = '-';

        fetch(`https://api.github.com/repos/${encodeURIComponent(author)}/${encodeURIComponent(project)}`, {
            headers: { Accept: 'application/vnd.github+json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.status === 404 ? 'not-found' : 'request-failed');
                }
                return response.json();
            })
            .then((repo) => {
                description.textContent = repo.description || text.noDescription;

                if (repo.homepage && !isMini) {
                    const homepage = document.createElement('a');
                    homepage.href = repo.homepage;
                    homepage.target = '_blank';
                    homepage.rel = 'noopener noreferrer';
                    homepage.classList.add('link');
                    homepage.textContent = repo.homepage;
                    homepageRow?.querySelector('a')?.remove();
                    homepageRow?.append(homepage);
                    homepageRow?.removeAttribute('hidden');
                }
                else if (homepageRow) {
                    homepageRow.setAttribute('hidden', '');
                    homepageRow.querySelector('a')?.remove();
                }

                if (stars) stars.textContent = String(repo.stargazers_count ?? '-');
                if (forks) forks.textContent = String(repo.forks_count ?? '-');
            })
            .catch((error) => {
                description.textContent = error.message === 'not-found'
                    ? text.notFound
                    : text.failed;
            });
    });
}

function setupAboutVersions() {
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

function setupAbout2026() {
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

function setupTaxonomyPages() {
    document.querySelectorAll('.taxonomy-post-card:not([data-stack-card-ready])').forEach((card: HTMLElement) => {
        card.dataset.stackCardReady = 'true';
        card.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('a')) return;
            const link = card.querySelector('.taxonomy-post-card-link') as HTMLAnchorElement | null;
            if (link?.href) window.location.href = link.href;
        });
    });

    const categoryPage = document.querySelector('[data-taxonomy-categories]:not([data-stack-taxonomy-ready])') as HTMLElement | null;

    if (categoryPage) {
        categoryPage.dataset.stackTaxonomyReady = 'true';

        const buttons = Array.from(categoryPage.querySelectorAll('[data-category-button]')) as HTMLButtonElement[];
        const panels = Array.from(categoryPage.querySelectorAll('[data-category-panel]')) as HTMLElement[];
        const categoryGrid = categoryPage.querySelector('[data-category-grid]') as HTMLElement | null;
        const expandButton = categoryPage.querySelector('[data-category-expand]') as HTMLButtonElement | null;
        const expandTitle = expandButton?.querySelector('.category-switch-title');

        const activatePanel = (targetID: string) => {
            buttons.forEach((button) => {
                const isActive = button.dataset.categoryButton === targetID;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.categoryPanel === targetID;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
        };

        const setupCategoryCollapse = () => {
            if (!categoryGrid || !expandButton) return;

            const shouldCollapse = buttons.length >= 9;
            expandButton.setAttribute('aria-expanded', 'false');
            expandButton.hidden = !shouldCollapse;
            categoryGrid.classList.toggle('is-collapsed', shouldCollapse);
            if (expandTitle) {
                expandTitle.textContent = expandButton.dataset.expandText || expandTitle.textContent;
            }
        };

        const setupCategoryPagination = (panel: HTMLElement) => {
            const pageSize = Number(panel.dataset.categoryPageSize || 12);
            const posts = Array.from(panel.querySelectorAll('[data-category-post]')) as HTMLElement[];
            const pagination = panel.querySelector('[data-category-pagination]') as HTMLElement | null;
            if (!pagination || !pageSize || posts.length <= pageSize) {
                if (pagination) pagination.hidden = true;
                posts.forEach((post) => post.classList.remove('is-hidden'));
                return;
            }

            let currentPage = 1;
            const totalPages = Math.ceil(posts.length / pageSize);

            const renderPage = () => {
                posts.forEach((post, index) => {
                    const page = Math.floor(index / pageSize) + 1;
                    post.classList.toggle('is-hidden', page !== currentPage);
                });

                pagination.innerHTML = '';
                for (let page = 1; page <= totalPages; page++) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.classList.add('taxonomy-page-button');
                    button.classList.toggle('is-active', page === currentPage);
                    button.setAttribute('aria-label', `Page ${page}`);
                    button.textContent = String(page);
                    button.addEventListener('click', () => {
                        currentPage = page;
                        renderPage();
                        panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
                    });
                    pagination.append(button);
                }

                pagination.hidden = false;
            };

            renderPage();
        };

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                if (!button.dataset.categoryButton) return;
                activatePanel(button.dataset.categoryButton);
            });
        });

        expandButton?.addEventListener('click', () => {
            if (!categoryGrid || !expandButton) return;
            const isExpanded = expandButton.getAttribute('aria-expanded') === 'true';
            categoryGrid.classList.toggle('is-collapsed', isExpanded);
            expandButton.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            if (expandTitle) {
                expandTitle.textContent = isExpanded
                    ? (expandButton.dataset.expandText || expandTitle.textContent)
                    : (expandButton.dataset.collapseText || expandTitle.textContent);
            }
        });

        panels.forEach(setupCategoryPagination);
        setupCategoryCollapse();
    }

    const tagPage = document.querySelector('[data-taxonomy-tags]:not([data-stack-taxonomy-ready])') as HTMLElement | null;

    if (tagPage) {
        tagPage.dataset.stackTaxonomyReady = 'true';

        const search = tagPage.querySelector('[data-tag-search]') as HTMLInputElement | null;
        const emptyState = tagPage.querySelector('[data-tag-empty]') as HTMLElement | null;
        const language = document.documentElement.lang.toLowerCase();

        const pinyinInitials: Record<string, string> = {
            a: '阿啊呵腌嗄吖锕',
            b: '八巴把爸吧拔罢霸白百班办半包宝保报北被本比笔必边变表别宾冰病并博播卜不布步部',
            c: '才材采菜参残藏操草测层茶差产长常场厂唱超朝车彻沉陈成城程吃持充抽出初除楚处传创春纯词次从粗促村存错',
            d: '大达打带代待单但旦当党到道得德的灯等低地第点电调定东动都斗读独度短段对队多',
            e: '而儿耳二恶饿恩',
            f: '发法反范方访放非飞分份纷奋风封峰丰佛否夫服复负富附府符福父',
            g: '该改概干感刚高告哥歌格革个各给根更工公功攻供共构购古股故固关观管光广规鬼贵国果过',
            h: '还海汉好号合和河黑很红后候乎忽湖护花化话华画怀欢环换黄回会汇活或火获',
            j: '机基积极及级集几己技记计际加家价架间简见建件键将讲交教脚角接节结解界借今金进近经精景静究九久就局居句据具觉决绝军均',
            k: '开看康考靠科可课刻空口苦库快块况扩',
            l: '来栏蓝劳老乐了类冷里理力立例连联练量两料列林临领另流龙楼路录陆论落旅律率绿',
            m: '妈麻马码买卖满慢毛么没美每门梦米面妙民明名命模某目',
            n: '那纳乃奶南难脑内能你年念鸟您宁牛农努女',
            o: '哦欧偶',
            p: '怕派盘判旁跑培配朋批皮片篇偏品平破普',
            q: '七其期起气器前钱强桥切且亲青情请清求区取去全权却群',
            r: '然让热人任认日荣容入如软若',
            s: '三散色森沙山善上少设社身深什生声省师失十时实识使始式示事市是试收手首受书数术树双水说思死四送速算随所锁',
            t: '他她它台太谈探堂套特体天条跳铁听通同头图土团推退托',
            w: '挖外完万网往望微为未位文问我无五物务误',
            x: '西希析息习系细下先现线相想向像小校笑些写谢心新信星形性修需虚许续学雪寻训',
            y: '压亚严研言眼验央样要也页业夜一以已义意因音引银英应影永用优由游有又右于与语元原员远愿月越云运',
            z: '杂再在咱暂早造责怎增扎摘展站张章找照这真阵正政之知直职只指至制中种重周主住注专转装状追准资子字自总走组足最作做'
        };

        const getChineseGroup = (title: string) => {
            const first = title.trim().charAt(0);
            const latin = first.normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
            if (/^[A-Z]$/.test(latin)) return latin;
            for (const [initial, chars] of Object.entries(pinyinInitials)) {
                if (chars.includes(first)) return initial.toUpperCase();
            }
            return '#';
        };

        const getJapaneseGroup = (title: string) => {
            const first = title.trim().charAt(0);
            const normalized = first.normalize('NFKC');
            const code = normalized.charCodeAt(0);
            const kana = code >= 0x30a1 && code <= 0x30f6
                ? String.fromCharCode(code - 0x60)
                : normalized;
            if ('あいうえおぁぃぅぇぉ'.includes(kana)) return 'あ';
            if ('かきくけこがぎぐげご'.includes(kana)) return 'か';
            if ('さしすせそざじずぜぞ'.includes(kana)) return 'さ';
            if ('たちつてとだぢづでど'.includes(kana)) return 'た';
            if ('なにぬねの'.includes(kana)) return 'な';
            if ('はひふへほばびぶべぼぱぴぷぺぽ'.includes(kana)) return 'は';
            if ('まみむめも'.includes(kana)) return 'ま';
            if ('やゆよゃゅょ'.includes(kana)) return 'や';
            if ('らりるれろ'.includes(kana)) return 'ら';
            if ('わをん'.includes(kana)) return 'わ';
            const latin = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            if (/^[A-Z]$/.test(latin)) return latin;
            return '#';
        };

        const getTagGroup = (title: string) => {
            if (language.startsWith('ja')) return getJapaneseGroup(title);
            if (language.startsWith('zh')) return getChineseGroup(title);

            const first = title.trim().charAt(0).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            return /^[A-Z]$/.test(first) ? first : '#';
        };

        const placeTagItems = () => {
            const source = tagPage.querySelector('[data-tag-source]') as HTMLElement | null;
            const indexItems = Array.from(tagPage.querySelectorAll('[data-tag-source] .tag-index-link, .tag-index-list .tag-index-link')) as HTMLElement[];
            indexItems.forEach((item) => {
                const title = item.dataset.tagTitle || item.textContent || '';
                const targetGroup = getTagGroup(title);
                const group = tagPage.querySelector(`[data-tag-group-key="${targetGroup}"] .tag-index-list`);
                if (!group) {
                    item.remove();
                    return;
                }
                group.append(item);
            });
            source?.remove();
        };

        const filterTags = () => {
            const query = (search?.value || '').trim().toLowerCase();
            let visibleCount = 0;

            const items = Array.from(tagPage.querySelectorAll('[data-tag-item]')) as HTMLElement[];
            items.forEach((item) => {
                const name = item.dataset.tagName || item.textContent?.toLowerCase() || '';
                const isVisible = !query || name.includes(query);
                item.classList.toggle('is-hidden', !isVisible);
                if (isVisible) visibleCount++;
            });

            const groups = Array.from(tagPage.querySelectorAll('[data-tag-group]')) as HTMLElement[];
            groups.forEach((group) => {
                const hasVisibleTag = Boolean(group.querySelector('[data-tag-item]:not(.is-hidden)'));
                group.classList.toggle('is-empty', !hasVisibleTag);
            });

            if (emptyState) emptyState.hidden = visibleCount > 0;
        };

        placeTagItems();
        search?.addEventListener('input', filterTags);
        filterTags();
    }
}

let Stack = {
    globalInit: () => {
        setupPageTransitions();
    },
    init: () => {
        /**
         * Bind menu event
         */
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

        /**
         * Add linear gradient background to tile style article
         */
        const articleTile = document.querySelector('.article-list--tile');
        if (articleTile) {
            let observer = new IntersectionObserver(async (entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);

                    const articles = entry.target.querySelectorAll('article.has-image');
                    articles.forEach(async articles => {
                        const image = articles.querySelector('img'),
                            imageURL = image.src,
                            key = image.getAttribute('data-key'),
                            hash = image.getAttribute('data-hash'),
                            articleDetails: HTMLDivElement = articles.querySelector('.article-details');

                        const colors = await getColor(key, hash, imageURL);

                        articleDetails.style.background = `
                        linear-gradient(0deg, 
                            rgba(${colors.DarkMuted.rgb[0]}, ${colors.DarkMuted.rgb[1]}, ${colors.DarkMuted.rgb[2]}, 0.5) 0%, 
                            rgba(${colors.Vibrant.rgb[0]}, ${colors.Vibrant.rgb[1]}, ${colors.Vibrant.rgb[2]}, 0.75) 100%)`;
                    })
                })
            });

            observer.observe(articleTile)
        }


        /**
         * Add controls to code blocks
        */
        const highlights = document.querySelectorAll('.article-content div.highlight:not([data-stack-code-ready])');
        const copyText = `Copy`,
            copiedText = `Copied!`;
        const writeClipboardText = async (text: string) => {
            const clipboard = window.navigator?.clipboard;

            if (clipboard && window.isSecureContext) {
                try {
                    await clipboard.writeText(text);
                    return;
                }
                catch (_) {
                    /// Fall through to textarea-based copy for browsers that block clipboard permissions.
                }
            }

            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);
            textarea.select();

            const copied = document.execCommand('copy');
            textarea.remove();

            if (!copied) throw new Error('Unable to copy code block');
        };

        highlights.forEach((highlight: HTMLElement) => {
            highlight.dataset.stackCodeReady = 'true';
            const codeBlock = highlight.querySelector('code[data-lang]');
            if (!codeBlock) return;
            let focusPlaceholder: HTMLElement | null = null;
            let focusPortal: HTMLElement | null = null;
            let originalParent: ParentNode | null = null;
            let originalNextSibling: ChildNode | null = null;

            const header = document.createElement('div');
            header.classList.add('codeBlockHeader');

            const controls = document.createElement('div');
            controls.classList.add('codeBlockWindowControls');

            const wrapButton = document.createElement('button');
            wrapButton.type = 'button';
            wrapButton.classList.add('codeBlockControl', 'codeBlockControl--wrap');
            wrapButton.setAttribute('aria-label', 'Enable line wrap');
            wrapButton.title = 'Wrap lines';

            const collapseButton = document.createElement('button');
            collapseButton.type = 'button';
            collapseButton.classList.add('codeBlockControl', 'codeBlockControl--collapse');
            collapseButton.setAttribute('aria-label', 'Collapse code block');
            collapseButton.title = 'Collapse';

            const focusButton = document.createElement('button');
            focusButton.type = 'button';
            focusButton.classList.add('codeBlockControl', 'codeBlockControl--focus');
            focusButton.setAttribute('aria-label', 'Open code block in a floating window');
            focusButton.title = 'Window';

            controls.append(wrapButton, collapseButton, focusButton);

            const language = document.createElement('span');
            language.classList.add('codeBlockLanguage');
            language.textContent = codeBlock.getAttribute('data-lang')?.toUpperCase() || 'CODE';

            const copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.innerHTML = copyText;
            copyButton.classList.add('copyCodeButton');

            header.append(controls, language, copyButton);
            highlight.prepend(header);

            const closeFocusedBlock = () => {
                highlight.classList.remove('is-focused');
                highlight.style.left = '';
                highlight.style.top = '';
                highlight.style.width = '';
                highlight.style.height = '';
                if (originalParent) {
                    originalParent.insertBefore(highlight, originalNextSibling);
                }
                focusPlaceholder?.remove();
                focusPortal?.remove();
                focusPlaceholder = null;
                focusPortal = null;
                originalParent = null;
                originalNextSibling = null;
                focusButton.setAttribute('aria-label', 'Open code block in a floating window');
                focusButton.title = 'Window';
            };

            focusButton.addEventListener('click', () => {
                const isFocused = !highlight.classList.contains('is-focused');

                if (isFocused) {
                    originalParent = highlight.parentNode;
                    originalNextSibling = highlight.nextSibling;
                    focusPlaceholder = document.createElement('div');
                    focusPlaceholder.classList.add('codeBlockPlaceholder');
                    focusPlaceholder.style.height = `${highlight.offsetHeight}px`;
                    originalParent.insertBefore(focusPlaceholder, highlight);
                    focusPortal = document.createElement('div');
                    focusPortal.classList.add('article-content', 'codeBlockPortal');
                    focusPortal.addEventListener('click', (event) => {
                        if (event.target === focusPortal) closeFocusedBlock();
                    });
                    document.body.appendChild(focusPortal);
                    focusPortal.appendChild(highlight);
                    highlight.classList.add('is-focused');
                }
                else {
                    closeFocusedBlock();
                }

                focusButton.setAttribute(
                    'aria-label',
                    isFocused ? 'Close floating code window' : 'Open code block in a floating window'
                );
                focusButton.title = isFocused ? 'Close window' : 'Window';
            });

            header.addEventListener('pointerdown', (event) => {
                if (!highlight.classList.contains('is-focused')) return;
                if ((event.target as HTMLElement).closest('button')) return;

                const rect = highlight.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const offsetY = event.clientY - rect.top;

                highlight.style.width = `${rect.width}px`;
                highlight.style.height = `${rect.height}px`;
                highlight.style.left = `${rect.left}px`;
                highlight.style.top = `${rect.top}px`;
                highlight.style.transform = 'none';
                header.setPointerCapture(event.pointerId);
                highlight.classList.add('is-dragging');

                const moveWindow = (moveEvent: PointerEvent) => {
                    const nextLeft = Math.min(Math.max(moveEvent.clientX - offsetX, 8), window.innerWidth - 80);
                    const nextTop = Math.min(Math.max(moveEvent.clientY - offsetY, 8), window.innerHeight - 50);
                    highlight.style.left = `${nextLeft}px`;
                    highlight.style.top = `${nextTop}px`;
                };

                const stopMoving = () => {
                    highlight.classList.remove('is-dragging');
                    header.releasePointerCapture(event.pointerId);
                    window.removeEventListener('pointermove', moveWindow);
                    window.removeEventListener('pointerup', stopMoving);
                };

                window.addEventListener('pointermove', moveWindow);
                window.addEventListener('pointerup', stopMoving);
            });

            collapseButton.addEventListener('click', () => {
                const isCollapsed = highlight.classList.toggle('is-collapsed');
                collapseButton.setAttribute('aria-label', isCollapsed ? 'Expand code block' : 'Collapse code block');
                collapseButton.title = isCollapsed ? 'Expand' : 'Collapse';
            });

            wrapButton.addEventListener('click', () => {
                const isWrapped = highlight.classList.toggle('is-wrapped');
                wrapButton.setAttribute('aria-label', isWrapped ? 'Disable line wrap' : 'Enable line wrap');
                wrapButton.title = isWrapped ? 'No wrap' : 'Wrap lines';
            });

            document.addEventListener('keydown', (event) => {
                if (event.key !== 'Escape') return;
                closeFocusedBlock();
            });

            copyButton.addEventListener('click', async (event) => {
                event.stopPropagation();

                try {
                    await writeClipboardText(codeBlock.textContent || '');
                    copyButton.textContent = copiedText;
                }
                catch (err) {
                    copyButton.textContent = 'Failed';
                    console.log('Something went wrong', err);
                }

                setTimeout(() => {
                    copyButton.textContent = copyText;
                }, 1000);
            });
        });

        new StackColorScheme(document.getElementById('dark-mode-toggle'));
    }
}

window.addEventListener('load', () => {
    setTimeout(function () {
        Stack.globalInit();
        Stack.init();
    }, 0);
})

declare global {
    interface Window {
        createElement: any;
        Stack: any
    }
}

window.Stack = Stack;
window.createElement = createElement;
