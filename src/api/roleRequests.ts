import axios from 'axios'

export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface RoleRequest {
  id: string | number
  username?: string
  firstName?: string
  lastName?: string
  requestedRole: string
  evidence: string
  status: RoleRequestStatus
  resolvedAt?: string
}

export interface RoleRequestStatusMap {
  PENDING: 'PENDING'
  APPROVED: 'APPROVED'
  REJECTED: 'REJECTED'
}

const AUTH_API_URL = (process.env.VUE_AUTH_API_URL || '').replace(/\/$/, '')
const EDITOR_ROLE = 'ROLE_EDITOR'
export const ROLE_REQUEST_STATUS: RoleRequestStatusMap = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
}

function endpoint (path: string): string {
  return `${AUTH_API_URL}${path}`
}

export function getApiErrorMessage (error: unknown, fallbackMessage = 'Request failed.'): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallbackMessage
  }

  const responseData = error?.response?.data

  if (typeof responseData === 'string' && responseData) {
    return responseData
  }

  if (responseData?.message) {
    return responseData.message
  }

  if (responseData?.data?.error) {
    return responseData.data.error
  }

  return error?.message || fallbackMessage
}

export async function createEditorRoleRequest (evidence: string): Promise<RoleRequest> {
  const response = await axios.post<RoleRequest>(endpoint('/user/role-requests'), {
    requestedRole: EDITOR_ROLE,
    evidence
  })

  return response.data
}

export async function listMyRoleRequests (): Promise<RoleRequest[]> {
  const response = await axios.get<RoleRequest[]>(endpoint('/user/role-requests/me'))
  return response.data
}

export async function listPromotionRequests (status?: RoleRequestStatus): Promise<RoleRequest[]> {
  const response = await axios.get<RoleRequest[]>(endpoint('/admin/promotions'), {
    params: status ? { status } : undefined
  })

  return response.data
}

export async function approvePromotionRequest (requestId: string | number, reason: string): Promise<RoleRequest> {
  const response = await axios.post<RoleRequest>(endpoint(`/admin/promotions/${requestId}/approve`), {
    reason
  })

  return response.data
}

export async function rejectPromotionRequest (requestId: string | number, reason: string): Promise<RoleRequest> {
  const response = await axios.post<RoleRequest>(endpoint(`/admin/promotions/${requestId}/reject`), {
    reason
  })

  return response.data
}
