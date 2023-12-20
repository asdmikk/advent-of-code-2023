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

type WorkQueue = {
  [key: WorkflowName]: Part[]
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

function processPart(part: Part, workflow: Workflow): Result | WorkflowName {
  const { rules } = workflow
  for (const rule of rules) {
    if ('category' in rule) {
      const { category, operator, value, destination, result } = rule
      const partValue = part[category]

      if (operator === '<' && partValue < value) {
        return (destination as WorkflowName) ?? (result as Result)
      }

      if (operator === '>' && partValue > value) {
        return (destination as WorkflowName) ?? (result as Result)
      }
      continue
    }

    if ('destination' in rule) {
      return rule.destination as WorkflowName
    }

    if ('result' in rule) {
      return rule.result as Result
    }
  }

  throw new Error('No rule matched')
}

const workflows = rawWorkflows.split('\n').map((rawWorkflow) => {
  const [name, rawRules] = rawWorkflow.replace('}', '').split('{')
  const rules = rawRules.split(',')
  return { name, rules: rules.map(parseRule) }
}) as Workflow[]

const parts = rawParts.split('\n').map((rawPart) =>
  Object.fromEntries(
    rawPart
      .substring(1, rawPart.length - 1)
      .split(',')
      .map((rating) => {
        const [name, value] = rating.split('=')
        return [name, +value]
      })
  )
) as Part[]

function getWorkQueue(): WorkQueue {
  return Object.fromEntries(workflows.map((workflow) => [workflow.name, []]))
}

const initialWorkflow = 'in'

const partResults: Result[] = []

parts.forEach((part, index) => {
  const workQueue = getWorkQueue()

  workQueue[initialWorkflow].push(part)

  while (!partResults[index]) {
    const [workflowName, workflowParts] = Object.entries(workQueue).find(
      ([, workflowParts]) => workflowParts.length > 0
    )!

    const workflow = workflows.find(({ name }) => name === workflowName)!
    const part = workflowParts.pop()!

    const result = processPart(part, workflow)

    if (RESULTS.includes(result as Result)) {
      partResults[index] = result as Result
      continue
    }

    workQueue[result as WorkflowName].push(part)
  }
})

const acceptedParts = parts.filter((_, index) => partResults[index] === 'A')

const result = acceptedParts.reduce(
  (acc, { x, m, a, s }) => acc + x + m + a + s,
  0
)

console.log(result)
