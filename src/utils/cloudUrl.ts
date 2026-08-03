export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function toStreamableUrl(url: string): string {
  if (!url) return url

  const ytId = extractYouTubeId(url)
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
  }

  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (gdriveMatch) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`
  }

  const gdriveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (gdriveOpen) {
    return `https://drive.google.com/file/d/${gdriveOpen[1]}/preview`
  }

  if (url.includes('dropbox.com')) {
    return url.replace(/[?&]dl=\d/, '').replace(/[?&]raw=\d/, '') + (url.includes('?') ? '&raw=1' : '?raw=1')
  }

  return url
}

export function toDownloadUrl(url: string): string {
  if (!url) return url

  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (gdriveMatch) {
    return `https://drive.google.com/uc?export=download&id=${gdriveMatch[1]}`
  }

  const gdriveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (gdriveOpen) {
    return `https://drive.google.com/uc?export=download&id=${gdriveOpen[1]}`
  }

  if (url.includes('dropbox.com')) {
    return url
      .replace(/[?&]dl=\d/, '')
      .replace(/[?&]raw=\d/, '')
      + (url.includes('?') ? '&dl=1' : '?dl=1')
  }

  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', '/upload/fl_attachment/')
  }

  return url
}

export function isGoogleDrive(url: string): boolean {
  return url.includes('drive.google.com')
}

export function isDropbox(url: string): boolean {
  return url.includes('dropbox.com')
}

export function isYouTube(url: string): boolean {
  return !!extractYouTubeId(url)
}

export function detectCloudSource(url: string): 'gdrive' | 'youtube' | 'dropbox' | 'direct' {
  if (isYouTube(url)) return 'youtube'
  if (isGoogleDrive(url)) return 'gdrive'
  if (isDropbox(url)) return 'dropbox'
  return 'direct'
}
