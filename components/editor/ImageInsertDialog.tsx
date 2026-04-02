'use client'

import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { isValidImageUrl, formatFileSize } from '@/lib/utils'

interface ImageInsertDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string) => void
  userId: string
}

export default function ImageInsertDialog({ isOpen, onClose, onInsert, userId }: ImageInsertDialogProps) {
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUrl('')
      setPreviewUrl(null)
      setSelectedFile(null)
      setUploading(false)
      setDragActive(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)

    // Update preview if valid URL
    if (value && isValidImageUrl(value)) {
      setPreviewUrl(value)
      setSelectedFile(null)
    } else {
      if (!selectedFile) setPreviewUrl(null)
    }
  }

  const handleUrlInsert = () => {
    if (!url.trim()) {
      toast.error('Please enter an image URL')
      return
    }
    if (!isValidImageUrl(url)) {
      toast.error('Please enter a valid HTTP or HTTPS URL')
      return
    }
    onInsert(url)
  }

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    }
    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      return `File too large (${formatFileSize(file.size)}). Maximum size is 5 MB.`
    }
    return null
  }

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUrl('')

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.url) {
        onInsert(data.url)
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg max-w-xl w-full mx-4 animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pink-100">
          <h2 className="text-lg font-semibold text-[#4a2d35]">Insert Image</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* URL Input Section */}
          <div>
            <label className="block text-sm font-medium text-[#4a2d35] mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              disabled={uploading}
            />
            {previewUrl && url && (
              <div className="mt-3 rounded-lg overflow-hidden border border-pink-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-contain bg-gray-50"
                  onError={() => {
                    setPreviewUrl(null)
                    toast.error('Failed to load image preview')
                  }}
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-pink-100" />
            <span className="text-sm text-[#9e7580]">OR</span>
            <div className="flex-1 h-px bg-pink-100" />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-[#4a2d35] mb-2">
              Upload from Computer
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                dragActive
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-pink-200 bg-pink-25 hover:border-pink-300 hover:bg-pink-50'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className="px-6 py-8 text-center">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-sm text-[#4a2d35] font-medium mb-1">
                  {uploading ? 'Uploading...' : 'Drop image here or click to browse'}
                </p>
                <p className="text-xs text-[#9e7580]">
                  JPEG, PNG, GIF, WebP • Max 5 MB
                </p>
                {selectedFile && !uploading && (
                  <p className="text-xs text-pink-600 mt-2">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
                    <p className="text-sm text-[#4a2d35]">Uploading...</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {previewUrl && selectedFile && !uploading && (
              <div className="mt-3 rounded-lg overflow-hidden border border-pink-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-contain bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pink-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#9e7580] hover:text-[#4a2d35] transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUrlInsert}
            disabled={!url || !isValidImageUrl(url) || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-300 to-pink-400 rounded-lg hover:from-pink-400 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert URL
          </button>
        </div>
      </div>
    </div>
  )
}
