import { describe, expect, it } from 'vitest'

import {
  getNovelApiError,
  getNovelsApiError,
  isNovelForbiddenError,
  isNovelNotFoundError
} from './novels'

describe('novel API error handling', () => {
  it('provides a permission message for a forbidden novel request', () => {
    const error = { response: { status: 403 } }

    expect(getNovelApiError(error)).toBe('You do not have permission to access this novel.')
    expect(isNovelForbiddenError(error)).toBe(true)
    expect(isNovelNotFoundError(error)).toBe(false)
  })

  it('provides a not-found message for a missing novel', () => {
    const error = { response: { status: 404 } }

    expect(getNovelApiError(error)).toBe('This novel could not be found.')
    expect(isNovelNotFoundError(error)).toBe(true)
  })

  it('uses the supplied fallback when a books request has no useful error message', () => {
    expect(getNovelsApiError({}, 'Could not load books.')).toBe('Could not load books.')
  })
})
