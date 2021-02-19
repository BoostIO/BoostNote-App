export interface AnimationHandle {
  duration: number
  cancel: () => void
}

export function smoothScroll(
  element: HTMLDivElement,
  pos: number,
  callback?: () => void
): AnimationHandle {
  let animationStart: number | null = null
  const startScroll = element.scrollTop
  const target = Math.max(0, pos)
  let currentFrameHandle = -1

  const duration = clamp(Math.abs(startScroll - target) / 50, 10, 100)

  const animate = (currentFrameTime: number) => {
    if (animationStart == null) {
      animationStart = currentFrameTime - 16.6
    }

    const deltaTime = currentFrameTime - animationStart
    const next = lerp(startScroll, target, clamp(deltaTime / duration))
    element.scrollTop = next

    if (target !== next) {
      currentFrameHandle = requestAnimationFrame(animate)
    } else if (callback != null) {
      currentFrameHandle = requestAnimationFrame(callback)
    }
  }

  currentFrameHandle = requestAnimationFrame(animate)

  return {
    duration,
    cancel: () => {
      cancelAnimationFrame(currentFrameHandle)
    },
  }
}

function lerp(x: number, y: number, a: number) {
  return x * (1 - a) + y * a
}

function clamp(x: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, x))
}
