export function promiseTimeout(ms, promise) {

    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in ' + ms + 'ms.');
        }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ]);
}

export function q(selector) {
    return document.querySelector(selector);
}

export function qAll(selector) {
    return document.querySelectorAll(selector);
}

export function hide(selector) {
    q(selector).setAttribute('hidden', 'true');
}

export function hideAll(selector) {
    qAll(selector).forEach(el => el.setAttribute('hidden', 'true'));
}

export function show(selector) {
    q(selector).removeAttribute('hidden');
}
