function secondToDate(second: number) {
    const time = [0, 0, 0, 0, 0];
    if (!second) return time;

    if (second >= 365 * 24 * 3600) {
        time[0] = Math.floor(second / (365 * 24 * 3600));
        second %= 365 * 24 * 3600;
    }
    if (second >= 24 * 3600) {
        time[1] = Math.floor(second / (24 * 3600));
        second %= 24 * 3600;
    }
    if (second >= 3600) {
        time[2] = Math.floor(second / 3600);
        second %= 3600;
    }
    if (second >= 60) {
        time[3] = Math.floor(second / 60);
        second %= 60;
    }
    if (second > 0) time[4] = second;

    return time;
}

export function setupFooterRuntime(root: ParentNode = document) {
    const runtime = root.querySelector('#htmer_time:not([data-stack-runtime-ready])') as HTMLElement | null;
    if (!runtime) return;

    runtime.dataset.stackRuntimeReady = 'true';
    const template = runtime.dataset.runtimeTemplate || '';
    const createTime = Number(runtime.dataset.runtimeStart || 0);
    if (!template || !createTime) return;

    const setTime = () => {
        if (!document.contains(runtime)) return;

        const timestamp = Math.round((Date.now() + 8 * 60 * 60 * 1000) / 1000);
        const currentTime = secondToDate(timestamp - createTime);
        runtime.innerHTML = template
            .replace('__YEARS__', String(currentTime[0]))
            .replace('__DAYS__', String(currentTime[1]))
            .replace('__HOURS__', String(currentTime[2]))
            .replace('__MINUTES__', String(currentTime[3]))
            .replace('__SECONDS__', String(currentTime[4]));
    };

    setTime();
    const timer = window.setInterval(() => {
        if (!document.contains(runtime)) {
            window.clearInterval(timer);
            return;
        }
        setTime();
    }, 1000);
}
