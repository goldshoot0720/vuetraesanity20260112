import { createClient } from '@sanity/client'

const projectId = localStorage.getItem('sanity_project_id') || import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = localStorage.getItem('sanity_dataset') || import.meta.env.VITE_SANITY_DATASET || 'production'
const token = localStorage.getItem('sanity_token') || import.meta.env.VITE_SANITY_TOKEN
const apiVersion = localStorage.getItem('sanity_api_version') || import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03'

// Only initialize if projectId is present to avoid errors
let client = null

if (projectId) {
  client = createClient({
    projectId,
    dataset,
    useCdn: false, // set to `false` to bypass the edge cache
    apiVersion, 
    token, // Only if you want to update content with the client
    ignoreBrowserTokenWarning: true
  })
} else {
  console.warn('Sanity Project ID not found. Please configure it in Settings.')
}

export default client
