interface RGBColor {
  r: number
  g: number
  b: number
}

export function convertHexStringToRgbString(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 255,
        g: 255,
        b: 255,
      }
}

const brightnessDefaultThreshold = 110

export function getColorBrightness(color: RGBColor | string) {
  if (color == '') {
    return 0
  }
  if (typeof color === 'string') {
    color = convertHexStringToRgbString(color)
  }
  const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
  return brightness
}

export function isColorBright(
  color: RGBColor | string,
  threshold: number = brightnessDefaultThreshold
) {
  return getColorBrightness(color) > threshold
}
