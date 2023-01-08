class MatIcon extends HTMLElement {
    constructor() {
        super();
        // this.style = {
        //     fontFamily: 'Material Icons',
        //     fontWeight: 'normal',
        //     fontStyle: 'normal',
        //     fontSize: '24px',
        //     lineHeight: 1,
        //     letterSpacing: 'normal',
        //     textTransform: 'none',
        //     display: 'inline-block',
        //     whiteSpace: 'nowrap',
        //     wordWrap: 'normal',
        //     direction: 'ltr',
        //     webkitFontFeatureSettings: 'liga',
        //     webkitFontSmoothing: 'antialiased',
        // };
    }
}

window.customElements.define('mat-icon', MatIcon);
