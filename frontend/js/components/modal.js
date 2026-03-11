import { state, actions } from '../state.js';
import { isAddressLike, validateSolanaAddress, submitAnalyzeRequest } from '../api.js';
import { renderSidebar } from './sidebar.js';
import { renderMainArea } from './mainArea.js';
import { showStatus } from '../utils.js';

export function initModal() {
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addAddressModal = document.getElementById('addAddressModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('indexerForm');
    const submitBtn = document.getElementById('submitBtn');
    const input = document.getElementById('addressInput');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const statusMessage = document.getElementById('statusMessage');

    if (!addAddressModal) return;

    const openModal = () => {
        addAddressModal.classList.remove('hidden');
        input.focus();
    };

    const closeModal = () => {
        addAddressModal.classList.add('hidden');
        statusMessage.classList.add('hidden');
        input.value = '';
        validateInput();
    };

    const validateInput = () => {
        const val = input.value.trim();
        if (val.length > 0) {
            clearInputBtn?.classList.remove('hidden');
        } else {
            clearInputBtn?.classList.add('hidden');
        }
        
        // Disable submit until it looks at least loosely like an address
        if (isAddressLike(val) && val.length > 30) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    };

    if (clearInputBtn) {
        clearInputBtn.addEventListener('click', () => {
            input.value = '';
            input.focus();
            validateInput();
        });
    }

    input.addEventListener('input', validateInput);

    addAddressBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    addAddressModal.addEventListener('click', (e) => {
        if (e.target === addAddressModal) closeModal();
    });

    const setupPills = (containerId, filterKey) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const pills = container.querySelectorAll('.pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                actions.updateFilter(filterKey, parseInt(pill.dataset.value, 10));
            });
        });
    };

    setupPills('timeFilters', 'time');
    setupPills('txFilters', 'txLimit');

    const setLoadingUI = (loading) => {
        actions.setLoading(loading);
        const btnText = submitBtn.querySelector('span');
        if (loading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Processing...';
            submitBtn.classList.add('loading');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Analyze';
            submitBtn.classList.remove('loading');
        }
    };

    const handleAnalyze = async (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (state.isLoading) return;

        const address = input.value.trim();

        if (!address) {
            showStatus('Please enter a valid address', 'error');
            return;
        }

        if (!isAddressLike(address)) {
            showStatus('Invalid input data: value is not an address', 'error');
            return;
        }

        const validation = validateSolanaAddress(address);
        if (!validation.isValid) {
            showStatus(validation.message, 'error');
            return;
        }

        setLoadingUI(true);

        try {
            actions.addOrUpdateAddress(address, 'indexing');
            renderSidebar();
            renderMainArea();
            
            showStatus(`Successfully started indexing for: ${address.slice(0, 4)}...${address.slice(-4)}`, 'success');
            setTimeout(() => closeModal(), 1000);

            const result = await submitAnalyzeRequest(address, state.filters);
            console.log('Server response:', result);
        } catch (error) {
            console.error('Error:', error);
            actions.addOrUpdateAddress(address, 'error');
            renderSidebar();
            renderMainArea();
            showStatus(error.message || 'An error occurred. Please try again.', 'error');
        } finally {
            setLoadingUI(false);
        }
    };

    form.addEventListener('submit', handleAnalyze);
    submitBtn.addEventListener('click', handleAnalyze);
}
