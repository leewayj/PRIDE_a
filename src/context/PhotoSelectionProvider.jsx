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

  const addAnalyzedPhotos = useCallback((photos) => {
    const normalizedPhotos = [
      ...new Map(
        photos.map(({ file, takenAt }) => {
          const id = getPhotoIdentity(file)
          return [
            id,
            {
              id,
              file,
              takenAt,
              takenYear: takenAt?.getFullYear() ?? null,
            },
          ]
        }),
      ).values(),
    ]

    setSelectedPhotos((currentPhotos) => {
      const knownIds = new Set(currentPhotos.map(({ id }) => id))
      const uniquePhotos = normalizedPhotos.filter(({ id }) => !knownIds.has(id))
      return [...currentPhotos, ...uniquePhotos]
    })

    setAnalyzedPhotos((currentPhotos) => {
      const knownIds = new Set(currentPhotos.map(({ id }) => id))
      const uniqueMetadata = normalizedPhotos
        .filter(({ id }) => !knownIds.has(id))
        .map(({ id, takenYear }) => ({ id, takenYear }))

      return [...currentPhotos, ...uniqueMetadata]
    })
  }, [])

  const value = useMemo(
    () => ({
      analyzedPhotos,
      addAnalyzedPhotos,
      selectedPhotos,
      selectedPhotoCount: selectedPhotos.length,
    }),
    [addAnalyzedPhotos, analyzedPhotos, selectedPhotos],
  )

  return (
    <PhotoSelectionContext.Provider value={value}>
      {children}
    </PhotoSelectionContext.Provider>
  )
}

export default PhotoSelectionProvider
