import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { AdminApp } from './AdminApp'

const container = document.getElementById('admin-root')

if (container) {
  createRoot(container).render(
    <StrictMode>
      <AdminApp />
    </StrictMode>,
  )
}
