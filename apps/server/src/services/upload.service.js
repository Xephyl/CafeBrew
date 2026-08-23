import { supabase } from '../config/supabase.js'
import { AppError } from '../utils/AppError.js'

const BUCKET = 'product-images'

export async function uploadProductImage(fileBuffer, filename, mimetype) {
  const path = `products/${Date.now()}-${filename}`

  let uploadResult

  try {
    uploadResult = await supabase.storage.from(BUCKET).upload(path, fileBuffer, {
      contentType: mimetype,
    })

    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    throw new AppError(502, 'UPLOAD_FAILED', 'Unable to upload file to storage')
  }

  if (uploadResult.error) {
    throw new AppError(502, 'UPLOAD_FAILED', 'Storage provider rejected upload')
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(uploadResult.data.path)

  return {
    url: data.publicUrl,
    path: uploadResult.data.path,
  }
}

export async function deleteProductImage(path) {
  if (!path) return

  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path])

    if (error) {
      console.error(error.message)
    }
  } catch (err) {
    console.error(err.message)
  }
}
