// const rawContent = Deno.readTextFileSync('./input_2_test_4tiles.txt')
// const rawContent = Deno.readTextFileSync('./input_2_test_8tiles.txt')
// const rawContent = Deno.readTextFileSync('./input_2_test_10tiles.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')
// console.log(rawContent)

type Direction = 'N' | 'E' | 'S' | 'W'

type Point = {
  x: number
  y: number
}

type Line = {
  start: Point
  end: Point
  direction: Direction
}

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

// map.forEach((line) => console.log(line.map((c) => c.padEnd(2, ' ')).join('')))

function getNextFromStart(x: number, y: number) {
  const n = map[y - 1]?.[x] || '.'
  const e = map[y]?.[x + 1] || '.'
  const s = map[y + 1]?.[x] || '.'
  const w = map[y]?.[x - 1] || '.'

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

function getNextPipePosition(current: Point, previous: Point | null = null) {
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
  const startX = map[startY].findIndex((c) => c === start)

  return { x: startX, y: startY }
}

const startPosition = getStartPosition()

function availableDirections(x: number, y: number) {
  const current = map[y][x]
  return directionMap[current]
}

function getPolygon(startX: number, startY: number) {
  const polygon: Point[] = [
    {
      x: startX,
      y: startY,
    },
  ]

  let previous: Point | null = null

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

    polygon.push({ ...current })
  } while (!(current.x === startX && current.y === startY))

  // remove last point cuz i don't care anymore
  polygon.pop()
  return polygon
}

function getDirection(start: Point, end: Point): Direction {
  if (start.x === end.x) {
    if (start.y > end.y) return 'N'
    return 'S'
  }

  if (start.x > end.x) return 'W'
  return 'E'
}

function isPerpendicularDirection(
  direction1: Direction,
  direction2: Direction
) {
  return (
    (direction1 === 'N' || direction1 === 'S') &&
    (direction2 === 'E' || direction2 === 'W')
  )
}

function getLines(polygon: Point[]) {
  const lines: Line[] = []
  let i = 0

  while (i < polygon.length) {
    const start = polygon[i % polygon.length]

    const line = {
      start: { ...start },
      end: { ...start },
      direction: getDirection(start, polygon[(i + 1) % polygon.length]),
    }

    while (true) {
      const point = polygon[i % polygon.length]
      const nextPoint = polygon[(i + 1) % polygon.length]

      const directionWithNext = getDirection(point, nextPoint)

      if (line.direction !== directionWithNext) {
        line.end = { ...point }
        break
      }

      i += 1
    }

    lines.push(line)
  }

  return lines
}

function horizontalLineContainsLine(horizontalLine: Line, line: Line): boolean {
  const { start: start1, end: end1 } = horizontalLine
  const { start: start2, end: end2 } = line

  if (start1.y === start2.y) {
    if (start2.x >= start1.x && end2.x <= end1.x) {
      return true
    }
  }

  return false
}

function getCircular<T>(array: T[], index: number) {
  return array[((index % array.length) + array.length) % array.length]
}

function countIntersections(ray: Line, polygonLines: Line[]) {
  let count = 0

  polygonLines.forEach((polygonLine, index) => {
    const rayY = ray.start.y

    const { start: start1, end: end1 } = ray
    const { start: start2, end: end2, direction } = polygonLine

    if (rayY === start2.y && ['S', 'N'].includes(direction)) {
      // start of polygon line is on top of ray
      const prevPrevLine = getCircular(polygonLines, index - 2)
      if (direction === 'S' && prevPrevLine.direction === 'N') {
        return
      }
      if (direction === 'N' && prevPrevLine.direction === 'S') {
        return
      }
    }

    if (rayY === end2.y && ['S', 'N'].includes(direction)) {
      // end of polygon line is on top of ray
      const nextNextLine = getCircular(polygonLines, index + 2)
      if (direction === 'S' && nextNextLine.direction === 'N') {
        return
      }
      if (direction === 'N' && nextNextLine.direction === 'S') {
        return
      }
    }

    if (start1.y === start2.y && start1.y === end2.y && start1.x < start2.x) {
      if (horizontalLineContainsLine(ray, polygonLine)) {
        const prevLine =
          polygonLines[index - 1] ?? polygonLines[polygonLines.length - 1]
        const nextLine = polygonLines[index + 1] ?? polygonLines[0]

        const isUTurn =
          (prevLine.direction === 'N' && nextLine.direction === 'S') ||
          (prevLine.direction === 'S' && nextLine.direction === 'N')

        if (!isUTurn) {
          count += 1
        }
      }
      return
    }

    if (start1.y > start2.y && end1.y < end2.y && start1.x < start2.x) {
      count += 1
      return
    }

    if (start1.y < start2.y && end1.y > end2.y && start1.x < start2.x) {
      count += 1
      return
    }
  })

  return count
}

function countInsidePoints(polygon: Point[], lines: Line[]) {
  let count = 0

  const minX = Math.min(...polygon.map((p) => p.x))
  const maxX = Math.max(...polygon.map((p) => p.x))
  const minY = Math.min(...polygon.map((p) => p.y))
  const maxY = Math.max(...polygon.map((p) => p.y))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (polygon.some((p) => p.x === x && p.y === y)) {
        continue
      }

      const ray: Line = {
        start: { x, y },
        end: { x: maxX, y },
        direction: 'E',
      }

      const intersections = countIntersections(ray, lines)

      if (intersections % 2 !== 0) {
        count += 1
      }
    }
  }

  return count
}

const polygon = getPolygon(startPosition.x, startPosition.y)
const lines = getLines(polygon)
const insidePoints = countInsidePoints(polygon, lines)

console.log(insidePoints)
