export function getPhotoIdentity(file) {
  return `${file.name}\u0000${file.size}\u0000${file.lastModified}`
}
