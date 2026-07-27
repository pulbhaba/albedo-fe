import axios from 'axios';

const API_URL = (process.env.VUE_APP_API_URL || '').replace(/\/$/, '');
const EDITOR_ROLE = 'ROLE_EDITOR';
export const ROLE_REQUEST_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

function endpoint(path) {
    return `${API_URL}${path}`;
}

export function getApiErrorMessage(error, fallbackMessage = 'Request failed.') {
    const responseData = error?.response?.data;

    if (typeof responseData === 'string' && responseData) {
        return responseData;
    }

    if (responseData?.message) {
        return responseData.message;
    }

    if (responseData?.data?.error) {
        return responseData.data.error;
    }

    return error?.message || fallbackMessage;
}

export async function createEditorRoleRequest(evidence) {
    const response = await axios.post(endpoint('/user/role-requests'), {
        requestedRole: EDITOR_ROLE,
        evidence,
    });

    return response.data;
}

export async function listMyRoleRequests() {
    const response = await axios.get(endpoint('/user/role-requests/me'));
    return response.data;
}

export async function listPromotionRequests(status) {
    const response = await axios.get(endpoint('/admin/promotions'), {
        params: status ? { status } : undefined,
    });

    return response.data;
}

export async function approvePromotionRequest(requestId, reason) {
    const response = await axios.post(endpoint(`/admin/promotions/${requestId}/approve`), {
        reason,
    });

    return response.data;
}

export async function rejectPromotionRequest(requestId, reason) {
    const response = await axios.post(endpoint(`/admin/promotions/${requestId}/reject`), {
        reason,
    });

    return response.data;
}
