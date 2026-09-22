const multer = require("multer")
const { ApiError } = require("./error.middleware")

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "application/x-pdf" // some browsers/OS report PDFs with this type
])

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    },
    fileFilter: (req, file, cb) => {
        const isPdf = ALLOWED_MIME_TYPES.has(file.mimetype) ||
            file.originalname?.toLowerCase().endsWith(".pdf")

        if (!isPdf) {
            cb(new ApiError(400, "Only PDF files are allowed for the resume upload."))
            return
        }
        cb(null, true)
    }
})

module.exports = upload
