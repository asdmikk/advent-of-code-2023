const rawContent = Deno.readTextFileSync('./input_2.txt')

const lines = rawContent.split('\n')

const spelledDigits = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
]

function findNumbers(line: string): [number, number] {
  const firstDigitIndex = line.split('').findIndex((char) => !isNaN(+char))
  const lastDigitIndex = line.split('').findLastIndex((char) => !isNaN(+char))

  let firstSpelledDigitIndex
  let firstSpelledDigit

  let lastSpelledDigitIndex
  let lastSpelledDigit

  for (let i = 0; i < spelledDigits.length; i++) {
    const firstIndex = line.indexOf(spelledDigits[i])
    const lastIndex = line.lastIndexOf(spelledDigits[i])

    if (firstSpelledDigitIndex === undefined && firstIndex !== -1) {
      firstSpelledDigitIndex = firstIndex
      firstSpelledDigit = spelledDigits[i]
    } else if (
      firstIndex !== -1 &&
      firstSpelledDigitIndex !== undefined &&
      firstIndex < firstSpelledDigitIndex
    ) {
      firstSpelledDigitIndex = firstIndex
      firstSpelledDigit = spelledDigits[i]
    }

    if (lastSpelledDigitIndex === undefined && lastIndex !== -1) {
      lastSpelledDigitIndex = lastIndex
      lastSpelledDigit = spelledDigits[i]
    } else if (
      lastIndex !== -1 &&
      lastSpelledDigitIndex !== undefined &&
      lastIndex > lastSpelledDigitIndex
    ) {
      lastSpelledDigitIndex = lastIndex
      lastSpelledDigit = spelledDigits[i]
    }
  }

  const firstDigit =
    firstDigitIndex === -1 ||
    (firstSpelledDigitIndex !== undefined &&
      firstSpelledDigitIndex < firstDigitIndex)
      ? spelledDigits.indexOf(firstSpelledDigit!)
      : +line[firstDigitIndex]

  const lastDigit =
    lastDigitIndex === -1 ||
    (lastSpelledDigitIndex !== undefined &&
      lastSpelledDigitIndex > lastDigitIndex)
      ? spelledDigits.indexOf(lastSpelledDigit!)
      : +line[lastDigitIndex]

  return [firstDigit, lastDigit]
}

const rawLineNumbers = lines.map(findNumbers)

const lineNumbers = rawLineNumbers.map(([a, b]) => +`${a}${b}`)

const sum = lineNumbers.reduce((acc, curr) => acc + curr, 0)

console.log(sum)
