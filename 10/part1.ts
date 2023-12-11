// const rawContent = Deno.readTextFileSync('./input_1_test_1.txt')
// const rawContent = Deno.readTextFileSync('./input_1_test_2.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')
// console.log(rawContent)

type Direction = 'N' | 'E' | 'S' | 'W'

const start = 'S'
const ground = '.'

const directionMap = {
  [start]: ['N', 'E', 'S', 'W'],
  '|': ['N', 'S'],
  '-': ['W', 'E'],
  L: ['N', 'E'],
  J: ['N', 'W'],
  '7': ['W', 'S'],
  F: ['S', 'E'],
  [ground]: [],
} as const

type MapSymbol = keyof typeof directionMap

const map = rawContent
  .split('\n')
  .map((line) => line.split('')) as MapSymbol[][]

function getNextFromStart(x: number, y: number) {
  const n = map[y - 1][x]
  const e = map[y][x + 1]
  const s = map[y + 1][x]
  const w = map[y][x - 1]

  if (directionMap[n].includes('S')) return { x, y: y - 1 }
  if (directionMap[e].includes('W')) return { x: x + 1, y }
  if (directionMap[s].includes('N')) return { x, y: y + 1 }
  if (directionMap[w].includes('E')) return { x: x - 1, y }
}

function nextPositionForDirection(x: number, y: number, direction: Direction) {
  switch (direction) {
    case 'N':
      return { x, y: y - 1 }
    case 'E':
      return { x: x + 1, y }
    case 'S':
      return { x, y: y + 1 }
    case 'W':
      return { x: x - 1, y }
  }
}

function getNextPipePosition(
  current: { x: number; y: number },
  previous: { x: number; y: number } | null = null
) {
  const currentSymbol = map[current.y][current.x]

  if (currentSymbol === start) {
    return getNextFromStart(current.x, current.y)
  }

  const directions = availableDirections(current.x, current.y)

  const validNextDirection = directions.find((direction) => {
    if (previous) {
      const nextPosition = nextPositionForDirection(
        current.x,
        current.y,
        direction
      )
      return nextPosition.x !== previous.x || nextPosition.y !== previous.y
    }

    return true
  })

  const { x, y } = current

  switch (validNextDirection) {
    case 'N':
      return { x, y: y - 1 }
    case 'E':
      return { x: x + 1, y }
    case 'S':
      return { x, y: y + 1 }
    case 'W':
      return { x: x - 1, y }
  }
}

function getStartPosition() {
  const startY = map.findIndex((line) => line.includes(start))
  const startX = [...map][0]
    .map((_, colIndex) => map.map((row) => row[colIndex]))
    .findIndex((line) => line.includes(start))

  return { x: startX, y: startY }
}

const startPosition = getStartPosition()

function availableDirections(x: number, y: number) {
  const current = map[y][x]
  return directionMap[current]
}

function countStepsToStart(startX: number, startY: number) {
  let steps = 0

  let previous: { x: number; y: number } | null = null

  const current = {
    x: startX,
    y: startY,
  }

  do {
    const nextPosition = getNextPipePosition(current, previous)
    if (!nextPosition) {
      console.log('Should not happen: No next position found')
      break
    }

    previous = { ...current }

    current.x = nextPosition.x
    current.y = nextPosition.y

    steps += 1
  } while (!(current.x === startX && current.y === startY))

  return steps
}

const roundTrip = countStepsToStart(startPosition.x, startPosition.y)

const farthestPoint = roundTrip / 2

console.log(farthestPoint)
