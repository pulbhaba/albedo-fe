import axios, { AxiosError } from 'axios'

import type { Novel } from './novels'

export interface LibraryItem {
  novel: Novel
}

export interface LibraryPage {
  items: LibraryItem[]
}

const NOVELS_API_URL = (process.env.VUE_NOVELS_API_URL || '').replace(/\/$/, '')

function endpoint (path: string): string {
  return `${NOVELS_API_URL}${path}`
}

export async function listLibrary (): Promise<LibraryPage> {
  const response = await axios.get<LibraryPage>(endpoint('/library'))
  return response.data
}

export async function removeFavorite (novelId: string | number): Promise<void> {
  await axios.delete(endpoint(`/library/${encodeURIComponent(novelId)}/favorite`))
}

export function getLibraryApiError (error: unknown, fallbackMessage = 'Could not load your library.'): string {
  if ((error as AxiosError | undefined)?.response?.status === 403) {
    return 'You do not have permission to view your library.'
  }

  return getErrorMessage(error, fallbackMessage)
}

export function getLibraryRemovalError (error: unknown, fallbackMessage = 'Could not remove this novel from your library.'): string {
  return getErrorMessage(error, fallbackMessage)
}

function getErrorMessage (error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallbackMessage
  }

  const responseData = error.response?.data
  return typeof responseData === 'object' && responseData !== null && 'message' in responseData
    ? String(responseData.message)
    : error.message || fallbackMessage
}
