import toastBase from 'react-hot-toast';

// Custom wrapper
export const toast = {
    success: (msg, opts = {}) =>
        toastBase.success(msg, { duration: 2000, ...opts }),

    error: (msg, opts = {}) =>
        toastBase.error(msg, { duration: 2500, ...opts }),

    loading: (msg, opts = {}) =>
        toastBase.loading(msg, { duration: opts.duration ?? 10000, ...opts }),

    log: (msg, opts = {}) =>
        toastBase(msg, { duration: opts.duration ?? 1500, icon: '💬', ...opts }),

    dismiss: (id) => toastBase.dismiss(id),

    // 🧠 Smart API response handler
    apiResponse: (res, opts = {}) => {
        try {
            const code = res?.status;
            if (code >= 200 && code < 300) toast.success(opts.successMsg || 'Success!');
            else if (code >= 400 && code < 500)
                toast.error(opts.errorMsg || `Client Error (${code})`);
            else if (code >= 500)
                toast.error(opts.errorMsg || `Server Error (${code})`);
            else toast.log('Unexpected response received');
        } catch (err) {
            toast.error('Invalid API response');
        }
    },
};
