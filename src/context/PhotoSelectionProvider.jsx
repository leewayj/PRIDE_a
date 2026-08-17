import { useCallback, useEffect, useMemo, useState } from 'react'
import PhotoSelectionContext from './PhotoSelectionContext.js'
import { getPhotoIdentity } from '../utils/photoIdentity.js'

const STORAGE_KEY = 'retrace.photo-analysis.v1'

function readStoredAnalysis() {
  try {
    const storedValue = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    if (!Array.isArray(storedValue)) return []

    return storedValue.filter(
      (photo) =>
        typeof photo?.id === 'string' &&
        (photo.takenYear === null || Number.isInteger(photo.takenYear)),
    )
  } catch {
    return []
  }
}

function PhotoSelectionProvider({ children }) {
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [analyzedPhotos, setAnalyzedPhotos] = useState(readStoredAnalysis)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analyzedPhotos))
    } catch {
      // The in-memory result remains usable when browser storage is unavailable.
    }
  }, [analyzedPhotos])

  const queueSelectedPhotos = useCallback((files) => {
    const analyzedIds = new Set(analyzedPhotos.map(({ id }) => id))
    const queuedPhotos = [
      ...new Map(
        files
          .filter((file) => file.type.startsWith('image/'))
          .map((file) => {
            const id = getPhotoIdentity(file)
            return [id, { id, file }]
          }),
      ).values(),
    ].filter(({ id }) => !analyzedIds.has(id))

    setSelectedPhotos(queuedPhotos)
    return queuedPhotos.length
  }, [analyzedPhotos])

  const saveAnalysisResults = useCallback((photos) => {
    setAnalyzedPhotos((currentPhotos) => {
      const knownIds = new Set(currentPhotos.map(({ id }) => id))
      const uniqueMetadata = photos
        .map(({ file, takenAt }) => ({
          id: getPhotoIdentity(file),
          name: file.name,
          takenYear: takenAt?.getFullYear() ?? null,
        }))
        .filter(({ id }) => !knownIds.has(id))

      return [...currentPhotos, ...uniqueMetadata]
    })
  }, [])

  const value = useMemo(
    () => ({
      analyzedPhotos,
      queueSelectedPhotos,
      saveAnalysisResults,
      selectedPhotos,
      selectedPhotoCount: selectedPhotos.length,
    }),
    [analyzedPhotos, queueSelectedPhotos, saveAnalysisResults, selectedPhotos],
  )

  return (
    <PhotoSelectionContext.Provider value={value}>
      {children}
    </PhotoSelectionContext.Provider>
  )
}

export default PhotoSelectionProvider
