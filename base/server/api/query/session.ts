import { defineEventHandler } from 'h3'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  // Create a new session ID
  const sessionId = uuidv4()
  
  return {
    data: sessionId
  }
})
