import { uploadProductImage } from '../services/upload.service.js'
import { success } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const uploadProductImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(422, 'VALIDATION_ERROR', 'File is required')
  }

  const result = await uploadProductImage(req.file.buffer, req.file.originalname, req.file.mimetype)

  res.status(200).json(success(result))
})
