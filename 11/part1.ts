const rawContent = Deno.readTextFileSync('input_1_test.txt')
// const rawContent = Deno.readTextFileSync('input_1.txt')

type MapSymbol = '.' | '#'
type Point = {
  x: number
  y: number
}

const map = rawContent
  .split('\n')
  .map((line) => line.split('')) as MapSymbol[][]

function getEmptySpace(map: string[][]) {
  const emptyRows: number[] = []
  const emptyColumns: number[] = []

  map.forEach((row, index) => {
    const hasGalaxies = row.some((symbol) => symbol === '#')
    if (!hasGalaxies) {
      emptyRows.push(index)
    }
  })

  const reverseMap = map[0].map((_, index) =>
    map.map((row) => row[index]).reverse()
  )

  reverseMap.forEach((row, index) => {
    const hasGalaxies = row.some((symbol) => symbol === '#')
    if (!hasGalaxies) {
      emptyColumns.push(index)
    }
  })

  return {
    rows: emptyRows,
    columns: emptyColumns,
  }
}

function expandEmptySpace(map: string[][]) {
  const { rows, columns } = getEmptySpace(map)

  const newMap = [...map].map((row) => [...row])

  rows.forEach((rowIndex, index) => {
    newMap.splice(rowIndex + index, 0, new Array(map[0].length).fill('.'))
  })

  columns.forEach((columnIndex, index) => {
    newMap.forEach((row) => {
      row.splice(columnIndex + index, 0, '.')
    })
  })

  return newMap
}

function getGalaxies(map: string[][]) {
  const galaxies: Point[] = []

  map.forEach((row, rowIndex) => {
    row.forEach((symbol, columnIndex) => {
      if (symbol === '#') {
        galaxies.push({ x: columnIndex, y: rowIndex })
      }
    })
  })

  return galaxies
}

function distance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function getDistancesTotal(galaxies: Point[]) {
  let total = 0

  galaxies.forEach((galaxy, index) => {
    for (let i = index + 1; i < galaxies.length; i++) {
      total += distance(galaxy, galaxies[i])
    }
  })

  return total
}

const expandedMap = expandEmptySpace(map)

expandedMap.forEach((line) =>
  console.log(line.map((c) => c.padEnd(2, ' ')).join(''))
)

const galaxies = getGalaxies(expandedMap)

const distancesTotal = getDistancesTotal(galaxies)

console.log(distancesTotal)
