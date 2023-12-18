const rawContent = Deno.readTextFileSync('./input_1.txt')
// const rawContent = Deno.readTextFileSync('./input_1_test.txt')

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
  // color: string
}

const instructions = rawContent.split('\n').map((line) => {
  const [, , color] = line.split(' ')
  const lengthHexa = color.substring(2, color.length - 2)
  const length = parseInt(lengthHexa, 16)
  const directionIndicator = color[color.length - 2]

  const direction = {
    '0': 'R',
    '1': 'D',
    '2': 'L',
    '3': 'U',
  }[directionIndicator]

  return {
    direction,
    length: length,
  }
}) as Instruction[]

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

function getCornerPoints(polygon: Line[]): Position[] {
  const corners: Position[] = [polygon[0].start]

  polygon.forEach((line) => {
    corners.push(line.end)
  })

  return corners
}

function areaOfLines(polygon: Line[]) {
  let area = 0

  polygon.forEach((line) => {
    area +=
      Math.abs(line.start.x - line.end.x) + Math.abs(line.start.y - line.end.y)
  })

  return area
}

function getArea(polygon: Line[]) {
  const corners = getCornerPoints(polygon)

  const linesArea = areaOfLines(polygon)

  let innerArea = 0

  corners.forEach((corner, index) => {
    const nextCorner = corners[(index + 1) % corners.length]
    innerArea += (corner.y + nextCorner.y) * (corner.x - nextCorner.x)
  })

  // return (linesArea + innerArea) / 2
  return (linesArea + innerArea) / 2 + 1
}

// Some logic yoinked from Day 10

// https://en.wikipedia.org/wiki/Shoelace_formula#Trapezoid_formula_2

const start: Position = { x: 0, y: 0 }
const polygon = getLines(instructions, start)
// console.log(polygon)

const area = getArea(polygon)
console.log(area)
