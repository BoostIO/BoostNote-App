export const vercelUploadLimit = 5000000

export function checkUploadSize(size: number) {
  if (size > vercelUploadLimit) {
    throw new Error('File size can not exceed 5mb')
  }
}
