export interface NotificationDto {
  from: string
  recipient: string
  message: string
  createdAt: string
}

export interface NotificationRequest {
  page: number
  size: number
  startDate: string
  endDate: string
}