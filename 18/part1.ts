// const rawContent = Deno.readTextFileSync('./input_1.txt')
const rawContent = Deno.readTextFileSync('./input_1_test.txt')

type Direction = 'U' | 'R' | 'D' | 'L'

type Position = {
  x: number
  y: number
}

type Line = {
  start: Position
  end: Position
  direction: Direction
}

type Instruction = {
  direction: Direction
  length: number
  color: string
}

const instructions = rawContent.split('\n').map((line) => {
  const [direction, length, color] = line.split(' ')
  return {
    direction,
    length: +length,
    color: color.substring(1, color.length - 2),
  }
}) as Instruction[]

// console.log(instructions)

function getLineEnd(start: Position, instructions: Instruction): Position {
  const { direction, length } = instructions
  switch (direction) {
    case 'U':
      return { x: start.x, y: start.y - length }
    case 'R':
      return { x: start.x + length, y: start.y }
    case 'D':
      return { x: start.x, y: start.y + length }
    case 'L':
      return { x: start.x - length, y: start.y }
  }
}

function getLines(instructions: Instruction[], start: Position) {
  const lines: Line[] = []

  let current = start
  instructions.forEach((instruction) => {
    const lineEnd = getLineEnd(current, instruction)
    lines.push({
      start: current,
      end: lineEnd,
      direction: instruction.direction,
    })
    current = lineEnd
  })

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

    if (rayY === start2.y && ['D', 'U'].includes(direction)) {
      // start of polygon line is on top of ray
      const prevPrevLine = getCircular(polygonLines, index - 2)
      if (direction === 'D' && prevPrevLine.direction === 'U') {
        return
      }
      if (direction === 'U' && prevPrevLine.direction === 'D') {
        return
      }
    }

    if (rayY === end2.y && ['D', 'U'].includes(direction)) {
      // end of polygon line is on top of ray
      const nextNextLine = getCircular(polygonLines, index + 2)
      if (direction === 'D' && nextNextLine.direction === 'U') {
        return
      }
      if (direction === 'U' && nextNextLine.direction === 'D') {
        return
      }
    }

    if (start1.y === start2.y && start1.y === end2.y && start1.x < start2.x) {
      if (horizontalLineContainsLine(ray, polygonLine)) {
        const prevLine =
          polygonLines[index - 1] ?? polygonLines[polygonLines.length - 1]
        const nextLine = polygonLines[index + 1] ?? polygonLines[0]

        const isUTurn =
          (prevLine.direction === 'U' && nextLine.direction === 'D') ||
          (prevLine.direction === 'D' && nextLine.direction === 'U')

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

function getAllPoints(polygon: Line[]) {
  const allPoints: Position[] = []

  polygon.forEach((line) => {
    const { start, end, direction } = line

    if (direction === 'U') {
      for (let y = start.y; y >= end.y; y--) {
        allPoints.push({ x: start.x, y })
      }
    }

    if (direction === 'D') {
      for (let y = start.y; y <= end.y; y++) {
        allPoints.push({ x: start.x, y })
      }
    }

    if (direction === 'L') {
      for (let x = start.x; x >= end.x; x--) {
        allPoints.push({ x, y: start.y })
      }
    }

    if (direction === 'R') {
      for (let x = start.x; x <= end.x; x++) {
        allPoints.push({ x, y: start.y })
      }
    }
  })

  return [...new Set(allPoints.map((p) => `${p.x}_${p.y}`))].map((p) => {
    const [x, y] = p.split('_')
    return { x: +x, y: +y }
  })
}

function getInsidePoints(polygon: Line[], polygonPoints: Position[]) {
  const polygonXs = [
    ...polygon.map((p) => p.start.x),
    ...polygon.map((p) => p.end.x),
  ]
  const polygonYs = [
    ...polygon.map((p) => p.start.y),
    ...polygon.map((p) => p.end.y),
  ]

  const minX = Math.min(...polygonXs)
  const maxX = Math.max(...polygonXs)
  const minY = Math.min(...polygonYs)
  const maxY = Math.max(...polygonYs)

  const insidePoints: Position[] = []

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (polygonPoints.some((p) => p.x === x && p.y === y)) {
        continue
      }

      const ray: Line = {
        start: { x, y },
        end: { x: maxX, y },
        direction: 'R',
      }

      const intersections = countIntersections(ray, polygon)

      if (intersections % 2 !== 0) {
        insidePoints.push({ x, y })
      }
    }
  }

  return insidePoints
}

function printMap(map: unknown[][]) {
  map.forEach((line) =>
    console.log(line.map((c) => String(c).padEnd(2, ' ')).join(''))
  )
}

// Some functions yoinked from Day 10

const start: Position = { x: 0, y: 0 }
const polygon = getLines(instructions, start)
// console.log(polygon)

const allPoints = getAllPoints(polygon)
// console.log(allPoints)

// const map: string[][] = []

// const polygonXs = [
//   ...polygon.map((p) => p.start.x),
//   ...polygon.map((p) => p.end.x),
// ]
// const polygonYs = [
//   ...polygon.map((p) => p.start.y),
//   ...polygon.map((p) => p.end.y),
// ]

// const minX = Math.min(...polygonXs)
// const maxX = Math.max(...polygonXs)
// const minY = Math.min(...polygonYs)
// const maxY = Math.max(...polygonYs)

// for (let y = minY; y <= maxY; y++) {
//   map.push([])
//   for (let x = minX; x <= maxX; x++) {
//     if (allPoints.some((p) => p.x === x && p.y === y)) {
//       map[y - minY].push('#')
//       continue
//     }
//     map[y - minY].push('.')
//   }
// }

// printMap(map)

const insidePoints = getInsidePoints(polygon, allPoints)
console.log(insidePoints.length, allPoints.length)
console.log(insidePoints.length + allPoints.length)
