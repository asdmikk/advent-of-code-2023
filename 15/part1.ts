const rawContent = Deno.readTextFileSync('./input_1.txt')

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

const result = rawContent
  .split(',')
  .map(calculateHash)
  .reduce((a, b) => a + b, 0)

console.log(result)
