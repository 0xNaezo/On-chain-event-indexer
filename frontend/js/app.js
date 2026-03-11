import { renderSidebar } from './components/sidebar.js';
import { renderMainArea } from './components/mainArea.js';
import { initModal } from './components/modal.js';
import { initResizer } from './components/appResizer.js';

document.addEventListener('DOMContentLoaded', () => {
    initModal();
    initResizer();
    renderSidebar();
    renderMainArea();
});
