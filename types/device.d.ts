interface DeviceDTO {
  deviceMac: string
  name: string
  type: number
  status: number
  temperature?: number
  humidity?: number
  tenantId?: number
  location?: string
}

interface DeviceVO extends DeviceDTO {
  id: number
  createTime: string
  updateTime: string
}

interface DeviceQuery {
  userId?: number
  tenantId?: number
  status?: number
  type?: number
  page: number
  limit: number
}

interface DeviceStatusDTO {
  id: number
  status: number
}

interface DeviceUpdateDTO {
  id: number
  name?: string
  status?: number
  temperature?: number
  humidity?: number
  location?: string
}

interface DeviceCreateDTO extends DeviceDTO {}

interface PageResult<T> {
  total: number
  page: number
  limit: number
  records: T[]
}
