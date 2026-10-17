import axios, { AxiosError } from 'axios'

export interface NovelAuthor {
  displayName?: string
}

export interface Novel {
  id: string | number
  title: string
  status: string
  isbn?: string | null
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

export interface CreateNovelInput {
  title: string
  isbn?: string
}

export interface UpdateNovelInput {
  title?: string
  isbn?: string | null
}

export interface ChapterContent {
  body: string
  chapterId?: string
  version?: number
}

const NOVELS_API_URL = (process.env.VUE_NOVELS_API_URL || '').replace(/\/$/, '')

function endpoint (path: string): string {
  return `${NOVELS_API_URL}${path}`
}

export async function getNovel (novelId: string | number): Promise<Novel> {
  const response = await axios.get<Novel>(endpoint(`/novels/${encodeURIComponent(novelId)}`))
  return response.data
}

export async function createNovel (input: CreateNovelInput): Promise<Novel> {
  const response = await axios.post<Novel>(endpoint('/novels'), input)
  return response.data
}

export async function updateNovel (novelId: string | number, input: UpdateNovelInput): Promise<Novel> {
  const response = await axios.patch<Novel>(endpoint(`/novels/${encodeURIComponent(novelId)}`), input)
  return response.data
}

export async function getChapterContent (novelId: string | number, chapterId: string): Promise<ChapterContent> {
  const response = await axios.get<ChapterContent>(
    endpoint(`/novels/${encodeURIComponent(novelId)}/chapters/${encodeURIComponent(chapterId)}`)
  )
  return response.data
}

export async function saveChapterContent (
  novelId: string | number,
  chapterId: string,
  body: string
): Promise<ChapterContent> {
  const response = await axios.put<ChapterContent>(
    endpoint(`/novels/${encodeURIComponent(novelId)}/chapters/${encodeURIComponent(chapterId)}`),
    { body }
  )
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
    return 'You do not have permission to access this novel.'
  }

  if (status === 404) {
    return 'This novel could not be found.'
  }

  return getApiErrorMessage(error) || fallbackMessage
}

export function isNovelForbiddenError (error: unknown): boolean {
  return (error as AxiosError | undefined)?.response?.status === 403
}

export function isNovelNotFoundError (error: unknown): boolean {
  return (error as AxiosError | undefined)?.response?.status === 404
}

export function getNovelsApiError (error: unknown, fallbackMessage = 'Could not load the books.'): string {
  const status = (error as AxiosError | undefined)?.response?.status

  if (status === 403) {
    return 'You do not have permission to view these books.'
  }

  return getApiErrorMessage(error) || fallbackMessage
}
