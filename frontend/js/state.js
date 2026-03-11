export const state = {
    isLoading: false,
    addresses: [],
    activeAddress: null,
    filters: {
        time: 24,
        txLimit: 1000
    }
};

export const getters = {
    getActiveItem() {
        return state.addresses.find(a => a.address === state.activeAddress);
    }
};

export const actions = {
    addOrUpdateAddress(address, status) {
        const existing = state.addresses.find(a => a.address === address);
        if (existing) {
            existing.status = status;
        } else {
            state.addresses.unshift({ address, status });
        }
        
        if (!state.activeAddress || !existing) {
            state.activeAddress = address;
        }
    },
    removeAddress(address) {
        state.addresses = state.addresses.filter(a => a.address !== address);
        if (state.activeAddress === address) {
            state.activeAddress = state.addresses.length > 0 ? state.addresses[0].address : null;
        }
    },
    setActiveAddress(address) {
        state.activeAddress = address;
    },
    setLoading(loading) {
        state.isLoading = loading;
    },
    updateFilter(key, value) {
        state.filters[key] = value;
    }
};
