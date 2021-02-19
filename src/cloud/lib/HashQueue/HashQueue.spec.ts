import { HashQueue } from '.'

describe('HashQueue', () => {
  test('Popped items will return in order pushed', () => {
    const queue = new HashQueue<string, string>()

    queue.push('key1', 'value1')
    queue.push('key2', 'value2')

    expect(queue.pop()).toEqual(['key1', 'value1'])
    expect(queue.pop()).toEqual(['key2', 'value2'])
  })

  test('Re-queued key-values will be popped in initially pushed order', () => {
    const queue = new HashQueue<string, string>()

    queue.push('key1', 'value1')
    queue.push('key2', 'value2')
    queue.push('key1', 'newValue1')

    expect(queue.pop()).toEqual(['key1', 'newValue1'])
    expect(queue.pop()).toEqual(['key2', 'value2'])
  })

  test('Deleting keys remove the item from the queue', () => {
    const queue = new HashQueue<string, string>()

    queue.push('key1', 'value1')
    queue.push('key2', 'value2')
    queue.delete('key1')

    expect(queue.pop()).toEqual(['key2', 'value2'])
    expect(queue.pop()).toEqual(undefined)
  })

  test('Can be looped', () => {
    const queue = new HashQueue<string, string>()

    queue.push('key1', 'value1')
    queue.push('key2', 'value2')

    const values: [string, string][] = []

    for (const value of queue) {
      values.push(value)
    }

    expect(values).toHaveLength(2)
    expect(values[0]).toEqual(['key1', 'value1'])
    expect(values[1]).toEqual(['key2', 'value2'])
  })
})
