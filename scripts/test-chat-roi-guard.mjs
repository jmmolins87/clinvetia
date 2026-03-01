const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3000"
const endpoint = `${baseUrl}/api/chat/assistant`

async function runCase(name, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${name}: HTTP ${res.status} ${body}`)
  }

  const json = await res.json()
  if (!json?.openRoiCalculator) {
    throw new Error(`${name}: expected openRoiCalculator=true, got ${JSON.stringify(json)}`)
  }
  if (json?.openCalendar) {
    throw new Error(`${name}: expected openCalendar=false while ROI is missing`)
  }
  return json
}

async function main() {
  const cases = [
    {
      name: "no_session_token",
      payload: {
        message: "quiero reservar una cita",
        state: { intent: "none", step: "idle" },
      },
    },
    {
      name: "invalid_session_token",
      payload: {
        message: "quiero reservar una cita",
        state: { intent: "book", step: "await_slot" },
        sessionToken: "invalid-token",
      },
    },
  ]

  for (const testCase of cases) {
    const result = await runCase(testCase.name, testCase.payload)
    console.log(`PASS ${testCase.name}: ${result.reply}`)
  }
}

main().catch((error) => {
  console.error(`FAIL test: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
