import axios from 'axios'

const NOVEL_SERVICE_API_URL = (process.env.VUE_APP_NOVEL_SERVICE_API_URL || '').replace(/\/$/, '')

function endpoint (path) {
  return `${NOVEL_SERVICE_API_URL}${path}`
}

export async function getNovel (novelId) {
  const response = await axios.get(endpoint(`/novels/${encodeURIComponent(novelId)}`))
  return response.data
}

export function getNovelApiError (error, fallbackMessage = 'Could not load this novel.') {
  if (error?.response?.status === 403) {
    return 'You do not have permission to read this novel.'
  }

  if (error?.response?.status === 404) {
    return 'This novel could not be found.'
  }

  return error?.response?.data?.message || error?.message || fallbackMessage
}
