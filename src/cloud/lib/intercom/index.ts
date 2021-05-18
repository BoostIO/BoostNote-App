export function load(appId: string) {
  ;(function () {
    const w = window as any
    const ic = w.Intercom
    w.intercomSettings = {
      ...(w.intercomSettings || {}),
      hide_default_launcher: true,
      custom_launcher_selector: '.helper-message',
    }
    if (typeof ic === 'function') {
      ic('reattach_activator')
      ic('update', w.intercomSettings)
    } else {
      const d = document
      const i: any = function () {
        // eslint-disable-next-line prefer-rest-params
        i.c(arguments)
      }
      i.q = []
      i.c = function (args: any) {
        i.q.push(args)
      }
      w.Intercom = i
      const l = function () {
        const s = d.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src = `https://widget.intercom.io/widget/${appId}`
        const x = d.getElementsByTagName('script')[0]
        x.parentNode!.insertBefore(s, x)
      }
      if (w.attachEvent) {
        w.attachEvent('onload', l)
      } else {
        w.addEventListener('load', l, false)
      }
    }
  })()
}

export function boot(appId: string, options = {}) {
  const w = window as any
  w &&
    w.Intercom &&
    w.Intercom('boot', {
      app_id: appId,
      ...options,
      hide_default_launcher: true,
      custom_launcher_selector: '.helper-message',
    })
}

export function update() {
  const w = window as any
  w && w.Intercom && w.Intercom('update')
}

export function shutdown() {
  const w = window as any
  w && w.Intercom && w.Intercom('shutdown')
}
