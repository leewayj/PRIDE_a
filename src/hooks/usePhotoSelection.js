import { useContext } from 'react'
import PhotoSelectionContext from '../context/PhotoSelectionContext.js'

function usePhotoSelection() {
  const context = useContext(PhotoSelectionContext)

  if (!context) {
    throw new Error('usePhotoSelection must be used within PhotoSelectionProvider')
  }

  return context
}

export default usePhotoSelection
