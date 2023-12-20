// const rawContent = Deno.readTextFileSync('./input_1_test.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

const [rawWorkflows, rawParts] = rawContent.split('\n\n')

// console.log(rawWorkflows)
// console.log('------------------')
// console.log(rawParts)
// console.log('------------------')

type WorkflowName = string

type Part = {
  x: number
  m: number
  a: number
  s: number
}

type Category = keyof Part

const RESULTS = ['A', 'R'] as const

type Result = (typeof RESULTS)[number]

type Operator = '<' | '>'

type ComparisonRule = {
  category: Category
  operator: Operator
  value: number
  destination?: WorkflowName
  result?: Result
}

type MoveRule = { destination: WorkflowName }

type EndRule = { result: Result }

type Rule = ComparisonRule | MoveRule | EndRule

type Workflow = {
  name: WorkflowName
  rules: Rule[]
}

function parseRule(rawRule: string): ComparisonRule | MoveRule | EndRule {
  const indexOfLessThan = rawRule.indexOf('<')
  const indexOfGreaterThan = rawRule.indexOf('>')

  const indexOfOperator =
    indexOfLessThan !== -1 ? indexOfLessThan : indexOfGreaterThan

  if (indexOfOperator !== -1) {
    const operator = rawRule.charAt(indexOfOperator) as Operator
    const category = rawRule.substring(0, indexOfOperator) as Category
    const [value, destinationOrResult] = rawRule
      .substring(indexOfOperator + 1)
      .split(':')

    const rule = {
      category,
      operator,
      value: +value,
    }

    if (RESULTS.includes(destinationOrResult as Result)) {
      return {
        ...rule,
        result: destinationOrResult as Result,
      }
    }

    return {
      ...rule,
      destination: destinationOrResult as WorkflowName,
    }
  }

  return RESULTS.includes(rawRule as Result)
    ? { result: rawRule as Result }
    : { destination: rawRule as WorkflowName }
}

const workflows = rawWorkflows.split('\n').map((rawWorkflow) => {
  const [name, rawRules] = rawWorkflow.replace('}', '').split('{')
  const rules = rawRules.split(',')
  return { name, rules: rules.map(parseRule) }
}) as Workflow[]

type Range = [min: number, max: number]

type PartRange = {
  x: Range
  m: Range
  a: Range
  s: Range
}

function getAcceptedRanges(
  partRange: PartRange,
  currentWorkflow: Workflow,
  workflows: Workflow[]
): PartRange[] {
  const acceptedRanges: PartRange[] = []
  let newPartRange = { ...partRange }

  for (const rule of currentWorkflow.rules) {
    const isComparisonRule = !!(rule as ComparisonRule).operator
    const isMoveRule = !isComparisonRule && !!(rule as MoveRule).destination

    if (!isComparisonRule) {
      if ((rule as EndRule).result === 'A') {
        acceptedRanges.push(newPartRange)
        break
      } else if ((rule as EndRule).result === 'R') {
        break
      } else if (isMoveRule) {
        const newRanges = getAcceptedRanges(
          newPartRange,
          workflows.find(
            ({ name }) => name === (rule as MoveRule).destination
          )!,
          workflows
        )
        acceptedRanges.push(...newRanges)
        continue
      }
    } else {
      const { operator, value, category, result, destination } =
        rule as ComparisonRule

      const positivePartRange = { ...newPartRange }
      const negativePartRange = { ...newPartRange }

      if (result === 'A') {
        if (operator === '<') {
          positivePartRange[category] = [newPartRange[category][0], value - 1]
          negativePartRange[category] = [value, newPartRange[category][1]]
        }
        if (operator === '>') {
          positivePartRange[category] = [value + 1, newPartRange[category][1]]
          negativePartRange[category] = [newPartRange[category][0], value]
        }

        acceptedRanges.push(positivePartRange)
        newPartRange = negativePartRange
        continue
      }
      if (result === 'R') {
        if (operator === '<') {
          positivePartRange[category] = [value, newPartRange[category][1]]
          negativePartRange[category] = [newPartRange[category][0], value - 1]
        }
        if (operator === '>') {
          positivePartRange[category] = [newPartRange[category][0], value]
          negativePartRange[category] = [value + 1, newPartRange[category][1]]
        }
        newPartRange = positivePartRange
        continue
      }
      if (destination) {
        if (operator === '<') {
          positivePartRange[category] = [newPartRange[category][0], value - 1]
          negativePartRange[category] = [value, newPartRange[category][1]]
        }
        if (operator === '>') {
          positivePartRange[category] = [value + 1, newPartRange[category][1]]
          negativePartRange[category] = [newPartRange[category][0], value]
        }
        const newRanges = getAcceptedRanges(
          positivePartRange,
          workflows.find(({ name }) => name === destination)!,
          workflows
        )
        acceptedRanges.push(...newRanges)
        newPartRange = negativePartRange
        continue
      }
    }
  }

  return acceptedRanges
}

const initialWorkflow = 'in'

const maxRange = 4000

const acceptedRanges = getAcceptedRanges(
  { x: [1, maxRange], m: [1, maxRange], a: [1, maxRange], s: [1, maxRange] },
  workflows.find(({ name }) => name === initialWorkflow)!,
  workflows
)

function getRange(range: Range): number {
  return range[1] - range[0] + 1
}

const result = acceptedRanges.reduce(
  (sum, range) =>
    sum +
    getRange(range.x) *
      getRange(range.m) *
      getRange(range.a) *
      getRange(range.s),
  0
)

console.log(result)
