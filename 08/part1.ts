const rawContent = Deno.readTextFileSync('./input_1_test.txt')

const [instructions, rawMap] = rawContent.split('\n\n')

const map: {
  [key: string]: [string, string]
} = {}

rawMap.split('\n').forEach((line) => {
  const [nodeKey, rawChildren] = line.split(' = ')
  const [left, right] = rawChildren
    .split(', ')
    .map((child) => child.replace('(', '').replace(')', ''))

  map[nodeKey] = [left, right]
})

let steps = 0

let currentIndex = 0
let currentInstruction = instructions[currentIndex]
let currentNode = 'AAA'

while (currentNode !== 'ZZZ') {
  const [left, right] = map[currentNode]

  if (currentInstruction === 'L') {
    currentNode = left
  }
  if (currentInstruction === 'R') {
    currentNode = right
  }

  const newIndex =
    currentIndex === instructions.length - 1 ? 0 : currentIndex + 1

  currentIndex = newIndex

  currentInstruction = instructions[newIndex]

  steps += 1
}

console.log(steps)
