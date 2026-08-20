import { useCallback, useMemo, useState } from 'react'
import PhotoSelectionContext from './PhotoSelectionContext.js'
import { createPhotoId, validatePhotoFile } from '../services/photoAnalysis.js'

function PhotoSelectionProvider({ children }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedPhotoResults, setSelectedPhotoResults] = useState([])

  const queueSelectedPhotos = useCallback((files) => {
    const safeFiles = Array.isArray(files) ? files : []
    const analyzedIds = new Set(selectedPhotoResults.map(({ id }) => id))
    const queuedFiles = [
      ...new Map(
        safeFiles
          .filter((file) => validatePhotoFile(file).valid)
          .map((file) => [createPhotoId(file), file]),
      ).values(),
    ].filter((file) => !analyzedIds.has(createPhotoId(file)))

    setSelectedFiles(queuedFiles)
    return queuedFiles.length
  }, [selectedPhotoResults])

  const saveSelectedPhotoResults = useCallback((analysisResults) => {
    const safeResults = Array.isArray(analysisResults) ? analysisResults : []
    setSelectedPhotoResults((currentPhotos) => {
      const knownIds = new Set(currentPhotos.map(({ id }) => id))
      const uniquePhotos = safeResults
        .filter(({ id }) => !knownIds.has(id))

      return [...currentPhotos, ...uniquePhotos]
    })
  }, [])

  const clearSelectedPhotos = useCallback(() => {
    setSelectedFiles([])
    setSelectedPhotoResults([])
  }, [])

  const replaceSelectedPhotos = useCallback((files) => {
    setSelectedFiles(Array.isArray(files) ? files : [])
  }, [])

  const removePhoto = useCallback((photoId) => {
    setSelectedPhotoResults((currentPhotos) => currentPhotos.filter(({ id }) => id !== photoId))
    setSelectedFiles((files) => files.filter((file) => createPhotoId(file) !== photoId))
  }, [])

  const value = useMemo(
    () => ({
      clearSelectedPhotos,
      queueSelectedPhotos,
      replaceSelectedPhotos,
      removePhoto,
      saveSelectedPhotoResults,
      selectedFiles,
      selectedPhotoResults,
      selectedPhotoCount: selectedFiles.length,
    }),
    [clearSelectedPhotos, queueSelectedPhotos, removePhoto, replaceSelectedPhotos, saveSelectedPhotoResults, selectedFiles, selectedPhotoResults],
  )

  return (
    <PhotoSelectionContext.Provider value={value}>
      {children}
    </PhotoSelectionContext.Provider>
  )
}

export default PhotoSelectionProvider
