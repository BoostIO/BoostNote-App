declare const ga: any

export function sendGAEvent(eventName: string) {
  if (ga == null) {
    return
  }
  ga('send', 'event', eventName, 'clicked')
}

export function queueNavigateToGA(url: string) {
  if (ga == null) {
    return
  }
  ga(() => {
    window.location.href = url
  })
}

export function sendLegacyDownloadGAEvent() {
  sendGAEvent('download-old')
}

export function sendLegacyRepositoryGAEvent() {
  sendGAEvent('repository-old')
}
