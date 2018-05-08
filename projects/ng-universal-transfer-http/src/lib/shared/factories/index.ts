export function domContentLoadedFactory(doc: Document) {
    return () => new Promise((resolve) => {
        const contentLoaded = () => {
            doc.removeEventListener('DOMContentLoaded', contentLoaded);
            resolve();
        };
        doc.addEventListener('DOMContentLoaded', contentLoaded);
    });
}
