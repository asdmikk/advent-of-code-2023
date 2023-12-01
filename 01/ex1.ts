const rawContent = Deno.readTextFileSync('./input_1.txt')

const lines = rawContent.split('\n')

const rawLineNumbers = lines.map((line) => [
  line.split('').find((char) => !isNaN(+char)),
  line.split('').findLast((char) => !isNaN(+char)),
])

const lineNumbers = rawLineNumbers.map(([a, b]) => +`${a}${b}`)

const sum = lineNumbers.reduce((acc, curr) => acc + curr, 0)

console.log(sum)
