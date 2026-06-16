export class Utils {
    // Default logo path; can be overridden at runtime by setting localStorage.setItem('BOUTIQUE_LOGO', '<path>')
    static readonly DEFAULT_LOGO_PATH = 'assets/images/logo.png';

    static isMobile() {
        return window && window.matchMedia('(max-width: 767px)').matches;
    }
    static ngbDateToDate(ngbDate: { month, day, year }) {
        if (!ngbDate) {
            return null;
        }
        return new Date(`${ngbDate.month}/${ngbDate.day}/${ngbDate.year}`);
    }
    static dateToNgbDate(date: Date) {
        if (!date) {
            return null;
        }
        date = new Date(date);
        return { month: date.getMonth() + 1, day: date.getDate(), year: date.getFullYear() };
    }
    static scrollToTop(selector: string) {
        try {
            if (typeof document === 'undefined') return;
            const element = <HTMLElement>document.querySelector(selector);
            if (element && 'scrollTop' in element) {
                element.scrollTop = 0;
            }
        } catch (e) {
            console.warn('Utils.scrollToTop failed for', selector, e);
        }
    }

    /**
     * Retourne le chemin du logo à utiliser (peut être surchargé via localStorage 'BOUTIQUE_LOGO')
     */
    static getLogoPath(): string {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('BOUTIQUE_LOGO');
                if (stored) return stored;
            }
        } catch (e) {
            // ignore
        }
        return Utils.DEFAULT_LOGO_PATH;
    }

    /**
     * Retourne une balise <img> HTML string pour inclusion dans des templates PDF/HTML.
     * width peut être un nombre (px) ou chaîne CSS (ex: '80px').
     */
    static getLogoImgTag(width: number | string = 80, alt: string = 'Logo', classes: string = 'shop-logo'): string {
        const path = Utils.getLogoPath();
        if (!path) return '';
        const widthStr = typeof width === 'number' ? `${width}px` : width;
        return `<img src="${path}" class="${classes}" alt="${alt}" style="width:${widthStr}; height:auto; object-fit:contain; border-radius:4px;">`;
    }

    static genId() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
