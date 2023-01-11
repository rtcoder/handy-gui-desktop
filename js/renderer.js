import {hideAll, promiseTimeout, q, qAll, show} from './utils.js';
import {loadPages} from "./html-loader.js";
import {connectBoard} from "./bluetooth.js";

await loadPages();


q('.sync').addEventListener('click', connectBoard);

function onMenuItemClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target.tagName.toLowerCase() === 'li' ? event.target : event.target.closest('li');

    const id = target.dataset.id;

    hideAll('.container section');
    show(`.container section.${id}`);

    qAll('nav li').forEach(el => el.classList.remove('active'));
    q(`nav li[data-id="${id}"]`).classList.add('active');
}

qAll('nav li').forEach(el => el.addEventListener('click', onMenuItemClick));
window.electronAPI.bluetoothPairingRequest((event, details) => {
    const response = {};

    switch (details.pairingKind) {
        case 'confirm': {
            response.confirmed = confirm(`Do you want to connect to device ${details.deviceId}?`);
            break;
        }
        case 'confirmPin': {
            response.confirmed = confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`);
            break;
        }
        case 'providePin': {
            const pin = prompt(`Please provide a pin for ${details.deviceId}.`);
            if (pin) {
                response.pin = pin;
                response.confirmed = true;
            } else {
                response.confirmed = false;
            }
        }
    }

    window.electronAPI.bluetoothPairingResponse(response);
});
