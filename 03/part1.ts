const rawContent = Deno.readTextFileSync('input_1.txt')
// const rawContent = Deno.readTextFileSync('input_1_test.txt')

function printMatrix(matrix: string[][]) {
  matrix.forEach((line) => {
    const paddedLine = line.map((char) => ` ${char} `)
    console.log(paddedLine.join(''))
  })
}

function isPart(char: string) {
  return char !== '.' && isNaN(+char)
}

function isNumber(char: string) {
  return !isNaN(+char)
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

function adjacentPartPositions(matrix: string[][], x: number, y: number) {
  const adjacentItems = [
    [x, y - 1],
    [x, y + 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y - 1],
    [x + 1, y - 1],
    [x - 1, y + 1],
    [x + 1, y + 1],
  ]
    .filter(([x, y]) => matrix[y]?.[x] !== undefined)
    .map(([x, y]) => [x, y])

  return adjacentItems.filter(([x, y]) => isPart(matrix[y][x]))
}

const engineMatrix = rawContent.split('\n').map((line) => line.split(''))

// printMatrix(engineMatrix)

type Part = {
  symbol: string
  position: number[]
  partNumbers: Set<number>
}

const parts: Map<`${number}_${number}`, Part> = new Map()

for (let y = 0; y < engineMatrix.length; y++) {
  for (let x = 0; x < engineMatrix[y].length; x++) {
    const char = engineMatrix[y][x]

    if (isNumber(char)) {
      const adjacentParts = adjacentPartPositions(engineMatrix, x, y)

      adjacentParts.forEach((partPos) => {
        const partKey: `${number}_${number}` = `${partPos[0]}_${partPos[1]}`

        const partNumber = findFullNumberForPosition(engineMatrix, x, y)

        if (parts.has(partKey)) {
          const part = parts.get(partKey)!
          part.partNumbers.add(partNumber)
        } else {
          parts.set(partKey, {
            symbol: engineMatrix[partPos[1]][partPos[0]],
            position: partPos,
            partNumbers: new Set([partNumber]),
          })
        }
      })
    }
  }
}

const partNumberSum = [...parts.values()].reduce((sum, part) => {
  return sum + [...part.partNumbers].reduce((sum, num) => sum + num, 0)
}, 0)

console.log(partNumberSum)
