import { useCallback, useMemo, useState } from 'react'
import PhotoSelectionContext from './PhotoSelectionContext.js'
import { createPhotoId, validatePhotoFile } from '../services/photoAnalysis.js'

function PhotoSelectionProvider({ children }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [photos, setPhotos] = useState([])

  const queueSelectedPhotos = useCallback((files) => {
    const safeFiles = Array.isArray(files) ? files : []
    const analyzedIds = new Set(photos.map(({ id }) => id))
    const queuedFiles = [
      ...new Map(
        safeFiles
          .filter((file) => validatePhotoFile(file).valid)
          .map((file) => [createPhotoId(file), file]),
      ).values(),
    ].filter((file) => !analyzedIds.has(createPhotoId(file)))

    setSelectedFiles(queuedFiles)
    return queuedFiles.length
  }, [photos])

  const saveAnalysisResults = useCallback((analysisResults) => {
    const safeResults = Array.isArray(analysisResults) ? analysisResults : []
    setPhotos((currentPhotos) => {
      const knownIds = new Set(currentPhotos.map(({ id }) => id))
      const uniquePhotos = safeResults
        .filter(({ id }) => !knownIds.has(id))

      return [...currentPhotos, ...uniquePhotos]
    })
  }, [])

  const clearSelectedPhotos = useCallback(() => {
    setSelectedFiles([])
  }, [])

  const replaceSelectedPhotos = useCallback((files) => {
    setSelectedFiles(Array.isArray(files) ? files : [])
  }, [])

  const removePhoto = useCallback((photoId) => {
    setPhotos((currentPhotos) => currentPhotos.filter(({ id }) => id !== photoId))
    setSelectedFiles((files) => files.filter((file) => createPhotoId(file) !== photoId))
  }, [])

  const value = useMemo(
    () => ({
      photos,
      clearSelectedPhotos,
      queueSelectedPhotos,
      replaceSelectedPhotos,
      removePhoto,
      saveAnalysisResults,
      selectedFiles,
      selectedPhotoCount: selectedFiles.length,
    }),
    [clearSelectedPhotos, photos, queueSelectedPhotos, removePhoto, replaceSelectedPhotos, saveAnalysisResults, selectedFiles],
  )

  return (
    <PhotoSelectionContext.Provider value={value}>
      {children}
    </PhotoSelectionContext.Provider>
  )
}

export default PhotoSelectionProvider
