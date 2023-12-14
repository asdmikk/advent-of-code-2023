// const rawContent = Deno.readTextFileSync('input_1_test.txt')
const rawContent = Deno.readTextFileSync('input_1.txt')

// console.log(rawContent)
// console.log('------------------')

const DAMAGED = '#'
const OPERATIONAL = '.'
const UNKNOWN = '?'

type Spring = typeof DAMAGED | typeof OPERATIONAL | typeof UNKNOWN

// cache covered branches - key: function arguments smushed
const cache: { [key: string]: number } = {}

function recursiveVariationsCount(springs: Spring[], groups: number[]): number {
  const cacheKey = [...springs, ...groups].join(',')
  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey]
  }

  if (springs.length === 0) {
    return groups.length === 0 ? 1 : 0
  }

  if (groups.length === 0) {
    return springs.includes(DAMAGED) ? 0 : 1
  }

  let result = 0

  switch (springs[0]) {
    case OPERATIONAL:
      result += recursiveVariationsCount(springs.slice(1), groups)
      break
    // deno-lint-ignore no-fallthrough
    case UNKNOWN:
      result += recursiveVariationsCount(springs.slice(1), groups)
    case DAMAGED: {
      const nextGroup = groups[0]

      if (nextGroup <= springs.length) {
        const nextSprings = springs.slice(0, nextGroup)

        if (!nextSprings.includes(OPERATIONAL)) {
          if (springs[nextGroup] !== DAMAGED || nextGroup === springs.length) {
            const restGroups = groups.slice(1)

            if (nextGroup === springs.length) {
              result += recursiveVariationsCount([], restGroups)
            } else {
              result += recursiveVariationsCount(
                springs.slice(nextGroup + 1),
                restGroups
              )
            }
          }
        }
      }
    }
  }

  cache[cacheKey] = result
  return result
}

const totalArrangements = rawContent
  .split('\n')
  .map((line) => {
    const [rawSprings, rawGroups] = line.split(' ')
    const expandBy = 5
    return {
      springs: Array.from({ length: expandBy }, () => rawSprings)
        .join(UNKNOWN)
        .split('') as Spring[],
      groups: Array.from({ length: expandBy }, () => rawGroups)
        .join(',')
        .split(',')
        .map(Number),
    }
  })
  .map(({ springs, groups }) => recursiveVariationsCount(springs, groups))
  .reduce((acc, curr) => acc + curr, 0)

console.log(totalArrangements)
