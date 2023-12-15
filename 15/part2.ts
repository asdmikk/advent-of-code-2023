// const rawContent = Deno.readTextFileSync('./input_1_test.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

const PUT = '='
const DELETE = '-'

type Lens = {
  label: string
  focalLength: number
}

type Box = Lens[]

function calculateHash(input: string) {
  const chars = [...input]
  let hash = 0

  chars.forEach((char) => {
    const code = char.charCodeAt(0)
    hash += code
    hash *= 17
    hash %= 256
  })

  return hash
}

function performInstruction(instruction: string, boxes: Box[]) {
  const operation = instruction.includes(PUT) ? PUT : DELETE

  const [label, focalLength] = instruction.split(operation)

  const boxIndex = calculateHash(label)

  if (operation === PUT) {
    const existing = boxes[boxIndex].findIndex((lens) => lens.label === label)
    if (existing === -1) {
      boxes[boxIndex].push({
        label,
        focalLength: +focalLength,
      })
    } else {
      boxes[boxIndex][existing].focalLength = +focalLength
    }
  } else if (operation === DELETE) {
    const existing = boxes[boxIndex].findIndex((lens) => lens.label === label)
    if (existing !== -1) {
      boxes[boxIndex].splice(existing, 1)
    }
  }
}

const boxes: Box[] = Array.from({ length: 265 }, () => [])

const instructions = rawContent.split(',')

instructions.forEach((instruction) => {
  performInstruction(instruction, boxes)
})

const result = boxes
  .map((box, boxIndex) => {
    let sum = 0
    box.forEach((lens, lensIndex) => {
      sum += (boxIndex + 1) * (lensIndex + 1) * lens.focalLength
    })
    return sum
  })
  .reduce((acc, x) => acc + x, 0)

console.log(result)
