export function initResizer() {
    const resizer = document.getElementById('appResizer');
    const appLayout = document.querySelector('.app-layout');
    
    if (!resizer || !appLayout) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        appLayout.classList.add('is-resizing');
        document.body.style.cursor = 'col-resize';
        // Prevent text selection during drag
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        // Calculate new width
        let newWidth = e.clientX; // Because sidebar is hugging the left edge, width is essentially clientX
        
        // Boundaries
        if (newWidth < 220) newWidth = 220; // Min width
        if (newWidth > 600) newWidth = 600; // Max width
        
        // Store it as a CSS variable on the root or app layout
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            appLayout.classList.remove('is-resizing');
            document.body.style.cursor = '';
        }
    });
}
