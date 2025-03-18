const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'deelam9kb',
    api_key: '537429937295938',
    api_secret: '4b6KwYuAzQjhQwYr_xAMMXJz1uo'
})

// Setup Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'menuImages', // Folder name in Cloudinary
        format: async (req, file) => 'png', // Convert to PNG
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
})

const newMenuStorage = multer({ storage: storage }).single('menuImage')

module.exports = { newMenuStorage }
