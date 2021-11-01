import { handleRequest, handleSchedule } from './handler'

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest())
})

addEventListener('scheduled', event => {
  event.waitUntil(
    handleSchedule(event.scheduledTime)
  )
})