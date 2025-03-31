
export interface TableSession {
    tableId: string
    startTime: number
    expiresAt: number
  }
  
  const SESSION_KEY = "table_session"
  const SESSION_DURATION = 2 * 60 * 60 * 1000 
  
  export function createTableSession(tableId: string): TableSession {
    const now = Date.now()
    const session: TableSession = {
      tableId,
      startTime: now,
      expiresAt: now + SESSION_DURATION,
    }
  
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (error) {
      console.warn("Failed to save session to storage:", error)
    }
  
    return session
  }
  
  export function getTableSession(): TableSession | null {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY)
      if (!sessionData) return null
  
      const session: TableSession = JSON.parse(sessionData)
  
     
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY)
        return null
      }
  
      return session
    } catch (error) {
      console.warn("Failed to read session from storage:", error)
      return null
    }
  }
  
  export function clearTableSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.warn("Failed to clear session:", error)
    }
  }
  
  export function isSessionValid(): boolean {
    const session = getTableSession()
    return session !== null && Date.now() < session.expiresAt
  }
  
  