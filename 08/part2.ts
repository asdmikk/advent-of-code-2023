// const rawContent = Deno.readTextFileSync('./input_2_test.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

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

function getNextNode(currentNode: string, instruction: string) {
  const [left, right] = map[currentNode]

  if (instruction === 'L') {
    return left
  } else {
    return right
  }
}

function stepsToZ(startNode: string) {
  let steps = 0
  let currentNode = startNode
  let currentInstructionIndex = 0

  while (!currentNode.endsWith('Z')) {
    currentNode = getNextNode(
      currentNode,
      instructions[currentInstructionIndex]
    )

    currentInstructionIndex =
      currentInstructionIndex === instructions.length - 1
        ? 0
        : currentInstructionIndex + 1

    steps += 1
  }

  return steps
}

function lcm(numbers: number[]) {
  function gcd(a: number, b: number): number {
    return !b ? a : gcd(b, a % b)
  }

  function _lcm(a: number, b: number) {
    return (a * b) / gcd(a, b)
  }

  return numbers.reduce((multiple, n) => _lcm(multiple, n))
}

const steps = Object.keys(map)
  .filter((key) => key.endsWith('A'))
  .map((node) => stepsToZ(node))

console.log(lcm(steps))
