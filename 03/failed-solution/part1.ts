// const rawContent = Deno.readTextFileSync('input_1_test.txt')
const rawContent = Deno.readTextFileSync('input_1.txt')

function printMatrix(matrix: string[][]) {
  matrix.forEach((line) => {
    const paddedLine = line.map((char) => ` ${char} `)
    console.log(paddedLine.join(''))
  })
}

function isPart(char: string) {
  return char !== '.' && isNaN(+char)
}

function getPartPositions(matrix: string[][]) {
  const partPositions: number[][] = []

  matrix.forEach((line, y) => {
    line.forEach((char, x) => {
      if (isPart(char)) {
        partPositions.push([x, y])
      }
    })
  })

  return partPositions
}

function findAdjacentNumberPositions(matrix: string[][], x: number, y: number) {
  const adjacentNumberPositions: number[][] = []

  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i === y && j === x) {
        continue
      }

      const char = matrix[i]?.[j]

      if (char && !isNaN(+char)) {
        adjacentNumberPositions.push([j, i])
        break
      }
    }
  }

  return adjacentNumberPositions
}

function findFullNumberForPosition(matrix: string[][], x: number, y: number) {
  const positionsOnSameRow: number[][] = [[x, y]]

  // Left of position
  for (let i = x - 1; i >= 0; i--) {
    const char = matrix[y][i]

    if (isNaN(+char)) {
      break
    }

    positionsOnSameRow.push([i, y])
  }

  // Right of position
  for (let i = x + 1; i < matrix[y].length; i++) {
    const char = matrix[y][i]

    if (isNaN(+char)) {
      break
    }

    positionsOnSameRow.push([i, y])
  }

  const number = positionsOnSameRow
    .toSorted((pos1, pos2) => pos1[0] - pos2[0])
    .map(([x, y]) => matrix[y][x])
    .join('')

  return +number
}

const engineMatrix = rawContent.split('\n').map((line) => line.split(''))

// printMatrix(engineMatrix)

const partPositions = getPartPositions(engineMatrix)

type Part = {
  symbol: string
  position: [x: number, y: number]
  partNumbers: number[]
}

const parts: Part[] = partPositions.map(([x, y]) => {
  const part: Part = {
    symbol: engineMatrix[y][x],
    position: [x, y],
    partNumbers: [],
  }

  const adjacentNumberPositions = findAdjacentNumberPositions(
    engineMatrix,
    x,
    y
  )

  adjacentNumberPositions.forEach(([adjacentNumberX, adjacentNumberY]) => {
    const fullNumber = findFullNumberForPosition(
      engineMatrix,
      adjacentNumberX,
      adjacentNumberY
    )
    part.partNumbers.push(fullNumber)
  })

  return part
})

console.log(parts)

const partNumberSum = parts.reduce((sum, part) => {
  return sum + part.partNumbers.reduce((sum, num) => sum + num, 0)
}, 0)

console.log(partNumberSum)
