import { state, actions } from '../state.js';
import { renderMainArea } from './mainArea.js';

export function renderSidebar() {
    const addressList = document.getElementById('addressList');
    if (!addressList) return;
    addressList.innerHTML = '';
    
    state.addresses.forEach(item => {
        const el = document.createElement('div');
        el.className = `address-item ${state.activeAddress === item.address ? 'active' : ''}`;
        
        const shortAddr = `${item.address.slice(0, 4)}...${item.address.slice(-4)}`;
        
        el.innerHTML = `
            <div class="address-item-content">
                <span class="status-indicator ${item.status}"></span>
                <span class="address-text">${shortAddr}</span>
            </div>
            <button class="delete-btn" title="Remove address">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        
        el.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                actions.removeAddress(item.address);
            } else {
                actions.setActiveAddress(item.address);
            }
            renderSidebar();
            renderMainArea();
        });

        addressList.appendChild(el);
    });

    // Toggle sidebar visibility and layout based on address count
    const sidebar = document.getElementById('appSidebar');
    const appLayout = document.querySelector('.app-layout');
    const resizer = document.getElementById('appResizer');
    if (state.addresses.length > 0) {
        sidebar?.classList.remove('hidden');
        resizer?.classList.remove('hidden');
        appLayout?.classList.add('has-sidebar');
    } else {
        sidebar?.classList.add('hidden');
        resizer?.classList.add('hidden');
        appLayout?.classList.remove('has-sidebar');
    }
}
