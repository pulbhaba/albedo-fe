import axios from 'axios'

const NOVELS_API_URL = (process.env.VUE_NOVELS_API_URL || '').replace(/\/$/, '')

function endpoint (path) {
  return `${NOVELS_API_URL}${path}`
}

export async function listLibrary () {
  const response = await axios.get(endpoint('/library'))
  return response.data
}

export async function removeFavorite (novelId) {
  await axios.delete(endpoint(`/library/${encodeURIComponent(novelId)}/favorite`))
}

export function getLibraryApiError (error, fallbackMessage = 'Could not load your library.') {
  if (error?.response?.status === 403) {
    return 'You do not have permission to view your library.'
  }

  return error?.response?.data?.message || error?.message || fallbackMessage
}

export function getLibraryRemovalError (error, fallbackMessage = 'Could not remove this novel from your library.') {
  return error?.response?.data?.message || error?.message || fallbackMessage
}
