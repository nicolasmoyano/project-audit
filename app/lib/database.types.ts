export type Database = {
    public: {
      Tables: {
        audits: {
          Row: {
            id: number
            url: string
            email: string
            analysis: string
            created_at: string
          }
          Insert: {
            id?: number
            url: string
            email: string
            analysis: string
            created_at?: string
          }
          Update: {
            id?: number
            url?: string
            email?: string
            analysis?: string
            created_at?: string
          }
        }
      }
    }
  } 