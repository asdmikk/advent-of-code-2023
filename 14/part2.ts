// const rawContent = Deno.readTextFileSync('./input_1_test.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

const SQUARE = '#'
const ROUND = 'O'
const OPEN = '.'

type Space = typeof SQUARE | typeof ROUND | typeof OPEN

let map = rawContent.split('\n').map((line) => line.split('')) as Space[][]

function printMap(map: Space[][]) {
  map.forEach((line) => console.log(line.map((c) => c.padEnd(2, ' ')).join('')))
}

// printMap(map)
// console.log('-------------')

function getMapKey(map: Space[][]): string {
  return map.map((line) => line.join('')).join('')
}

function moveLooseRocks(map: Space[][]) {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      const space = map[row][col]
      if (space === OPEN) {
        let nextRow = row + 1
        if (nextRow >= map.length) {
          continue
        }

        while (nextRow < map.length - 1 && map[nextRow][col] === OPEN) {
          nextRow++
        }

        const nextRock = map[nextRow][col]
        if (nextRock === ROUND) {
          map[nextRow][col] = OPEN
          map[row][col] = ROUND
        }
      }
    }
  }
}

function rotate45(map: Space[][]) {
  return map[0].map((_, index) => map.map((row) => row[index]).reverse())
}

function sumLoad(map: Space[][]): number {
  let sum = 0

  map.forEach((line, index) => {
    const looseRocks = line.filter((space) => space === ROUND).length
    sum += looseRocks * (map.length - index)
  })

  return sum
}

function fullRotation() {
  moveLooseRocks(map)

  map = rotate45(map)
  moveLooseRocks(map)

  map = rotate45(map)
  moveLooseRocks(map)

  map = rotate45(map)
  moveLooseRocks(map)

  map = rotate45(map)
}

type CycleMap = { cycle: number; sum: number }
const mapHistory: { [key: string]: CycleMap } = {}

let firstCycleMap: CycleMap
let cycleCount = 0

while (true) {
  fullRotation()
  const mapKey = getMapKey(map)
  if (mapHistory[mapKey]) {
    firstCycleMap = mapHistory[mapKey]
    break
  } else {
    cycleCount++
    mapHistory[mapKey] = { cycle: cycleCount, sum: sumLoad(map) }
  }
}

const totalRotations = 1_000_000_000

const cycleLength = cycleCount - firstCycleMap.cycle + 1
const cyclingMaps = totalRotations - firstCycleMap.cycle
const lastMapIndex = (cyclingMaps % cycleLength) + firstCycleMap.cycle

const lastMap = Object.values(mapHistory).find(
  (item) => item.cycle === lastMapIndex
)

console.log(lastMap!.sum)
