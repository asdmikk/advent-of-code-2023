const rawContent = Deno.readTextFileSync('./input_1.txt')

// console.log(rawContent)

function last<T>(array: T[]) {
  return array[array.length - 1]
}

function isAllZero(array: number[]) {
  return array.every((n) => n === 0)
}

function getDiffs(array: number[]) {
  const diffs = []
  for (let i = 1; i < array.length; i++) {
    diffs.push(array[i] - array[i - 1])
  }
  return diffs
}

const result = rawContent
  .split('\n')
  .map((line) => line.split(' ').map(Number))
  .map((history) => {
    const diffs = [history]

    while (!isAllZero(last(diffs))) {
      diffs.push(getDiffs(last(diffs)))
    }

    return diffs
  })
  .map((diffs) => {
    const reverseDiffs = diffs.reverse()
    reverseDiffs[0].push(0)

    reverseDiffs.forEach((diff, index) => {
      if (index === reverseDiffs.length - 1) return
      reverseDiffs[index + 1].push(last(diff) + last(reverseDiffs[index + 1]))
    })

    return reverseDiffs.reverse()
  })
  .map((newHistory) => last(newHistory[0]))
  .reduce((acc, curr) => acc + curr, 0)

console.log(result)
