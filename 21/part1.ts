// const rawInput = Deno.readTextFileSync('./input_1_test.txt')
const rawInput = Deno.readTextFileSync('./input_1.txt')

// console.log(rawInput)

const ITEMS = {
  GARDEN: '.',
  ROCK: '#',
  VISITED: 'O',
  START: 'S',
} as const

type Item = (typeof ITEMS)[keyof typeof ITEMS]

type Garden = Item[][]

type Position = {
  x: number
  y: number
}

type PositionKey = `${number}_${number}`

function getKey(position: Position): PositionKey {
  return `${position.x}_${position.y}`
}

function printMap(map: Garden) {
  map.forEach((line) => console.log(line.map((c) => c.padEnd(2, ' ')).join('')))
}

const map = rawInput.split('\n').map((line) => line.split('')) as Garden

printMap(map)

function getNextSteps(map: Garden, currentPosition: Position): Position[] {
  const { x, y } = currentPosition
  const surrounding: Position[] = []

  surrounding.push({ x, y: y - 1 })
  surrounding.push({ x: x + 1, y })
  surrounding.push({ x, y: y + 1 })
  surrounding.push({ x: x - 1, y })

  const availablePositions = surrounding
    .filter(
      (position) =>
        position.x >= 0 &&
        position.y >= 0 &&
        position.y < map.length &&
        position.x < map[position.y].length
    )
    .filter((position) => {
      const item = map[position.y][position.x]
      return item !== ITEMS.ROCK
    })

  return availablePositions
}

function getStartingPosition(map: Garden): Position {
  const y = map.findIndex((line) => line.includes(ITEMS.START))
  const x = map[y].findIndex((item) => item === ITEMS.START)

  return { x, y }
}

const start = getStartingPosition(map)

function go(map: Garden, start: Position, totalSteps: number): number {
  let visited: Set<PositionKey>
  let queue: Position[] = [start]

  let steps = 0

  while (steps < totalSteps) {
    visited = new Set()

    const next = [...queue]
    queue = []

    next.forEach((position) => {
      const nextSteps = getNextSteps(map, position)
      nextSteps.forEach((step) => {
        const key = getKey(step)
        if (!visited.has(key)) {
          visited.add(key)
          queue.push(step)
        }
      })
    })

    steps += 1
  }

  return visited!.size
}

const result = go(map, start, 64)

console.log(result)
