import {q} from "./utils.js";

export async function loadHTML(html) {
    return await fetch(html).then(value => value.text());
}


export async function loadPages() {
    const loadScreen = q('.loading');
    const names = [
        'dashboard',
        'bluetooth',
        'board',
        'painting'
    ];
    for (const name of names) {
        const page = await loadHTML(`pages/${name}.html`);
        q(`.container section.${name}`).innerHTML = page;
    }
    loadScreen.remove();
}
