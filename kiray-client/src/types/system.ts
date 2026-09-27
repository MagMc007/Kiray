export interface SystemDatabaseHealth {
  status: 'connected' | 'disconnected' | 'connecting' | string;
  host: string;
  name: string;
}

export interface SystemMemoryHealth {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | string;
  uptime: number;
  timestamp: string;
  database: SystemDatabaseHealth;
  memory: SystemMemoryHealth;
}



export interface PurgeSoftDeletedPayload {
  daysOld?: number;
  target?: 'listings' | 'users' | 'all';
}

export interface PurgeSoftDeletedResult {
  purgedListingsCount: number;
  purgedUsersCount: number;
  cutoffDate: string;
}
