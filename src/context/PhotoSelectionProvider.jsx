import { useMemo, useState } from 'react'
import PhotoSelectionContext from './PhotoSelectionContext.js'

function PhotoSelectionProvider({ children }) {
  const [selectedPhotos, setSelectedPhotos] = useState([])

  const value = useMemo(
    () => ({
      selectedPhotos,
      selectedPhotoCount: selectedPhotos.length,
      setSelectedPhotos,
    }),
    [selectedPhotos],
  )

  return (
    <PhotoSelectionContext.Provider value={value}>
      {children}
    </PhotoSelectionContext.Provider>
  )
}

export default PhotoSelectionProvider
