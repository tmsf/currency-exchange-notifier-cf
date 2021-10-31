/**
 * Environment variables need to be declared
 * in order to be picked up by TS compiler
 */
declare global {
  const FIXER_API: string
  const SENDGRID_API_TOKEN: string
  const TO_EMAIL: string
  const SENDGRID_EMAIL: string
}

export async function handleRequest(request: Request): Promise<Response> {
  await notifyByMail()
  return new Response(`email sent - ${new Date()}`)
}

const notifyByMail = async () => {
  const exchangeRates = await fetchExchangeRates()
  const emailPayload: any = createEmail(exchangeRates)
  await sendEmail(emailPayload)
}

const createEmail = (exchangeRatesPayload: any): any => {
  const fromEmail = SENDGRID_EMAIL
  const toEmail = TO_EMAIL
  const recipients = [{ email: toEmail } ]
  const sender = { email: fromEmail, name: 'Currency Notifier' }

  const { date, timestamp, rates } = exchangeRatesPayload
  const time: Date = new Date(timestamp * 1000)

  // multiple conversions based on broker payload
  const UsdEur: number = rates.USD * 1000
  const eurGbp: number = rates.GBP * 1000
  const gbpEur: number = (1 / rates.GBP) * 1000
  const eurUsd: number = (1 / rates.USD) * 1000

  const subject = `Exchange rates - ${date}`
  const htmlBody = `
  <h1>Exchange rates</h1> \
  <h4>${time}</h4>\
  <h5>USD</h5>\
  <div>1000 USD = ${eurUsd.toFixed(2)} EUR </div>\
  <div>1000 EUR = ${UsdEur.toFixed(2)} USD </div>\
  <hr>
  <h5>GBP</h5>\
  <div>1000 GBP = ${gbpEur.toFixed(2)} EUR </div>\
  <div>1000 EUR = ${eurGbp.toFixed(2)} GBP </div>\
  `

  return {
    personalizations: [{ to: recipients, subject: subject}],
    from: sender,
    content: [{ type: 'text/html', value: htmlBody }]
  }
}

const fetchExchangeRates = async () => {
  const url: string = `http://data.fixer.io/api/latest?access_key=${FIXER_API}&symbols=USD,GBP`
  const response = await fetch(url)
  return response.json()
}

const sendEmail = (email: any) => {
  const url = 'https://api.sendgrid.com/v3/mail/send'  
  return fetch(url, {
    method: "POST", headers: {
    Authorization: `Bearer ${SENDGRID_API_TOKEN}`,
    'Content-Type': 'application/json',
    },
    body: JSON.stringify(email)
  })
}