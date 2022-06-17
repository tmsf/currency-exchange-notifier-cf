/**
 * Environment variables need to be declared
 * in order to be picked up by TS compiler
 */
declare global {
  const FIXER_API: string
  const SENDGRID_API_TOKEN: string
  const TO_EMAIL: string
  const SENDGRID_EMAIL: string
  const TELEGRAM_TOKEN: string
  const TELEGRAM_USER_ID: string
}

async function handleRequest(): Promise<Response> {
  await notifyByMail()
  return new Response(`email sent - ${new Date()}`)
}

async function handleSchedule(scheduledDate: any): Promise<void> {
  await notifyByMail()
  console.log("scheduledDate", scheduledDate)
  console.log(`email sent - ${new Date()}`)
}

const notifyByMail = async () => {
  const exchangeRates = await fetchExchangeRates()
  const [emailPayload, telegramPayload]: any = createEmail(exchangeRates)
  const res = await sendToTelegram(telegramPayload)
  await sendEmail(emailPayload)
}

const createEmail = (exchangeRatesPayload: any): any => {
  const fromEmail = SENDGRID_EMAIL
  const toEmail = TO_EMAIL
  const recipients = [{ email: toEmail }]
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
  const smsBody = `
  Exchange rates: \n\
  \n\
  USD\n\
  1000 USD = ${eurUsd.toFixed(2)} EUR \n\
  1000 EUR = ${UsdEur.toFixed(2)} USD \n\
  \n
  GBP \n\
  1000 GBP = ${gbpEur.toFixed(2)} EUR \n\
  1000 EUR = ${eurGbp.toFixed(2)} GBP \n\
  `

  return [{
    personalizations: [{ to: recipients, subject: subject }],
    from: sender,
    content: [{ type: 'text/html', value: htmlBody }],
  }, smsBody]
}

const fetchExchangeRates = async () => {
  const url = `http://data.fixer.io/api/latest?access_key=${FIXER_API}&symbols=USD,GBP`
  const response = await fetch(url)
  return response.json()
}

const sendToTelegram = async (message: string) => {
  const data ={
    "chat_id":`${TELEGRAM_USER_ID}`,
    "text": message,
    "disable_notification": true
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
const sendEmail = (email: any) => {
  const url = 'https://api.sendgrid.com/v3/mail/send'
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  })
}

export { handleSchedule, handleRequest }
