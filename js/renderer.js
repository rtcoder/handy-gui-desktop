const SERVICE_ID = '13012f00-f8c3-4f4a-a8f4-15cd926da146';
const CHARACTERISTIC_ID = '13012f01-f8c3-4f4a-a8f4-15cd926da146';

function q(selector) {
    return document.querySelector(selector);
}

function hide(selector) {
    q(selector).setAttribute('hidden', 'true');
}

function show(selector) {
    q(selector).removeAttribute('hidden');
}

async function loadHTML(html) {
    return await fetch(html).then(value => value.text());
}

const promiseTimeout = function (ms, promise) {

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
};

async function loadPages() {
    const loadScreen = q('.loading');
    const names = [
        'bluetooth'
    ];
    for (const name of names) {
        const page = await loadHTML(`pages/${name}.html`);
        console.log(page);
        q(`.container .${name}`).innerHTML = page;
        setTimeout(() => {
        }, 3000);
    }
    loadScreen.remove();
}

await loadPages();

async function connectBoard() {
    q('.bluetooth').classList.remove(
        'disconnected', 'canceled', 'connected', 'failed');
    q('.bluetooth').classList.add('connecting');
    app.bluetooth.connectionStatus = CONNECTION_STATUSES.PENDING;
    let device;
    try {
        app.bluetooth.connectedDevice.device = null;
        app.bluetooth.connectedDevice.service = null;
        app.bluetooth.connectedDevice.characteristic = null;

        const getDevice = new Promise((resolve, reject) => {
            const res = navigator.bluetooth.requestDevice({
                filters: [{name: 'Arduino'}],
                optionalServices: [SERVICE_ID]
            });
            resolve(res);
        });
        // stop looking for device after 30s
        device = await promiseTimeout(10000, getDevice);

        const connectedDevice = await device.gatt.connect();

        if (device && connectedDevice) {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.CONNECTED;
            app.bluetooth.connectedDevice.device = connectedDevice;

            q('.bluetooth').classList.add('connected');
            q('.bluetooth').classList.remove('connecting');

            const service = await connectedDevice.getPrimaryService(SERVICE_ID);
            const characteristic = await service.getCharacteristic(CHARACTERISTIC_ID);
        } else {
            console.log('no');
        }
    } catch (e) {
        console.log({e});
        q('.bluetooth').classList.remove('connecting');
        if (typeof device !== 'undefined') {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.FAILED;
            q('.bluetooth').classList.add('failed');
        } else {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.CANCELLED;
            q('.bluetooth').classList.add('cancelled');
        }
    }
    console.log(app);
}

q('.sync').addEventListener('click', connectBoard);

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
