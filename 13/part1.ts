// const rawContent = Deno.readTextFileSync('input_1_test.txt')
const rawContent = Deno.readTextFileSync('input_1.txt')

// console.log(rawContent)
// console.log('------------------')

type MapSymbol = '#' | '.'
type Map = MapSymbol[][]

const maps = rawContent
  .split('\n\n')
  .map((line) => line.split('\n').map((line) => line.split('') as MapSymbol[]))

function findReflectionIndex(map: Map): number {
  const rowsAsStrings = map.map((row) => row.join(''))

  let mirrorStartIndex = -1

  // front to back
  for (let i = 1; i < rowsAsStrings.length; i++) {
    const string1 = rowsAsStrings.slice(0, i).join('')
    const string2 = rowsAsStrings
      .slice(i, 2 * i)
      .reverse()
      .join('')

    if (string1 === string2) {
      mirrorStartIndex = i - 1
      break
    }
  }

  if (mirrorStartIndex !== -1) {
    return mirrorStartIndex
  }

  // back to front
  for (let i = 1; i < rowsAsStrings.length; i++) {
    const string1 = rowsAsStrings
      .slice(rowsAsStrings.length - i, rowsAsStrings.length)
      .reverse()
      .join('')
    const string2 = rowsAsStrings
      .slice(rowsAsStrings.length - 2 * i, rowsAsStrings.length - i)
      .join('')

    if (string1 === string2) {
      mirrorStartIndex = rowsAsStrings.length - i - 1
      break
    }
  }

  return mirrorStartIndex
}

function flipAxes(map: Map): Map {
  return map[0].map((_, index) => map.map((row) => row[index]).reverse())
}

const sum = maps
  .map((map) => {
    const reflectionIndex = findReflectionIndex(map)

    if (reflectionIndex === -1) {
      return {
        reflectionNumber: findReflectionIndex(flipAxes(map)) + 1,
        multiplier: 1,
      }
    }
    return {
      reflectionNumber: reflectionIndex + 1,
      multiplier: 100,
    }
  })
  .reduce(
    (acc, { reflectionNumber, multiplier }) =>
      acc + reflectionNumber * multiplier,
    0
  )

console.log(sum)
