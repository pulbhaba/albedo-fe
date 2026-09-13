import axios, { AxiosError } from 'axios'

export interface NovelAuthor {
  displayName?: string
}

export interface Novel {
  id: string | number
  title: string
  status: string
  author?: string | NovelAuthor
  summary?: string
  body?: string
  coverImageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface NovelsPage {
  items: Novel[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
}

export type ListNovelsParams = Record<string, string | number | boolean | undefined>

const NOVELS_API_URL = (process.env.VUE_NOVELS_API_URL || '').replace(/\/$/, '')

function endpoint (path: string): string {
  return `${NOVELS_API_URL}${path}`
}

export async function getNovel (novelId: string | number): Promise<Novel> {
  const response = await axios.get<Novel>(endpoint(`/novels/${encodeURIComponent(novelId)}`))
  return response.data
}

export async function listNovels (params: ListNovelsParams = {}): Promise<NovelsPage> {
  const response = await axios.get<NovelsPage>(endpoint('/novels'), { params })
  return response.data
}

function getApiErrorMessage (error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : undefined
  }

  const responseMessage = error.response?.data
  return typeof responseMessage === 'object' && responseMessage !== null && 'message' in responseMessage
    ? String(responseMessage.message)
    : error.message
}

export function getNovelApiError (error: unknown, fallbackMessage = 'Could not load this novel.'): string {
  const status = (error as AxiosError | undefined)?.response?.status

  if (status === 403) {
    return 'You do not have permission to read this novel.'
  }

  if (status === 404) {
    return 'This novel could not be found.'
  }

  return getApiErrorMessage(error) || fallbackMessage
}

export function getNovelsApiError (error: unknown, fallbackMessage = 'Could not load the books.'): string {
  const status = (error as AxiosError | undefined)?.response?.status

  if (status === 403) {
    return 'You do not have permission to view these books.'
  }

  return getApiErrorMessage(error) || fallbackMessage
}
