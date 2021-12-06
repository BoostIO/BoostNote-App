import { LexoRank } from 'lexorank'
import { defaultTo, last, splitWhen, zip } from 'ramda'
import { sortByAttributeAsc } from '../../design/lib/utils/array'

interface Orderable {
  order: string
}

export function getOrdering<T extends Orderable>(
  comp: (a: T, b: T) => boolean,
  list: T[],
  after?: T
): string {
  if (list.length === 0) {
    return LexoRank.middle().toString()
  }
  const sorted = sortByAttributeAsc('order', list)

  if (after == null) {
    return LexoRank.min().between(LexoRank.parse(sorted[0].order)).toString()
  }

  const [betweenA, betweenB] = defaultTo(
    [],
    last(splitWhen((item: T) => comp(item, after), sorted))
  )

  if (betweenA == null) {
    return LexoRank.max()
      .between(LexoRank.parse(sorted[sorted.length - 1].order))
      .toString()
  }

  if (betweenB == null) {
    return LexoRank.max().between(LexoRank.parse(betweenA.order)).toString()
  }

  return LexoRank.parse(betweenA.order)
    .between(LexoRank.parse(betweenB.order))
    .toString()
}

export function rebalance<T extends Orderable>(list: T[]): T[] {
  const sorted = sortByAttributeAsc('order', list)
  const spread = evenSpread(sorted.length)

  return zip(sorted, spread).map(([item, order]) => ({
    ...item,
    order: order.toString(),
  }))
}

function evenSpread(
  length: number,
  start: LexoRank = LexoRank.min(),
  end: LexoRank = LexoRank.max()
): LexoRank[] {
  const order = start.between(end)
  if (length === 3) {
    return [start.between(order), order, order.between(end)]
  }

  const mid = Math.floor(length / 2)

  return evenSpread(mid, start, order)
    .concat([order])
    .concat(evenSpread(length - mid, order, end))
    .flat()
}
