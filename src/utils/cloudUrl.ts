export function toStreamableUrl(url: string): string {
  if (!url) return url

  // Google Drive: /file/d/FILE_ID/view  →  /file/d/FILE_ID/preview
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (gdriveMatch) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`
  }

  // Google Drive open link: ?id=FILE_ID
  const gdriveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (gdriveOpen) {
    return `https://drive.google.com/file/d/${gdriveOpen[1]}/preview`
  }

  // Dropbox: ?dl=0  →  ?raw=1
  if (url.includes('dropbox.com')) {
    return url.replace(/[?&]dl=\d/, '').replace(/[?&]raw=\d/, '') + (url.includes('?') ? '&raw=1' : '?raw=1')
  }

  return url
}

export function isGoogleDrive(url: string): boolean {
  return url.includes('drive.google.com')
}

export function isDropbox(url: string): boolean {
  return url.includes('dropbox.com')
}

export function detectCloudSource(url: string): 'gdrive' | 'dropbox' | 'direct' {
  if (isGoogleDrive(url)) return 'gdrive'
  if (isDropbox(url)) return 'dropbox'
  return 'direct'
}
