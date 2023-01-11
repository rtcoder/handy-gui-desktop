import {promiseTimeout, q} from "./utils.js";

const SERVICE_ID = '13012f00-f8c3-4f4a-a8f4-15cd926da146';
const CHARACTERISTIC_ID = '13012f01-f8c3-4f4a-a8f4-15cd926da146';

export function setBtStatusClass(status) {
    q('.bluetooth').classList.remove(
        'disconnected', 'canceled', 'connected', 'failed', 'connecting');
    q('.bluetooth').classList.add(status);
}

export function btCharacteristicValueChanged(event) {
    const val = event.target.value.getUint8(0);
    console.log({val});
}

export function onDisconnectBoard() {

    app.bluetooth.connectedDevice.device = null;
    app.bluetooth.connectedDevice.service = null;
    app.bluetooth.connectedDevice.characteristic = null;

    app.bluetooth.connectionStatus = CONNECTION_STATUSES.DISCONNECTED;

    setBtStatusClass('disconnected');
}

export async function connectBoard() {
    setBtStatusClass('connecting');

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

            device.addEventListener('gattserverdisconnected', onDisconnectBoard);

            setBtStatusClass('connected');

            const service = await connectedDevice.getPrimaryService(SERVICE_ID);
            const characteristic = await service.getCharacteristic(CHARACTERISTIC_ID);

            app.bluetooth.connectedDevice.service = service;
            app.bluetooth.connectedDevice.characteristic = characteristic;

            characteristic.addEventListener('characteristicvaluechanged', btCharacteristicValueChanged);
        }
    } catch (e) {
        console.log({e});
        if (typeof device !== 'undefined') {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.FAILED;
            setBtStatusClass('failed');
        } else {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.CANCELLED;
            setBtStatusClass('cancelled');
        }
    }
    console.log(app);
}
