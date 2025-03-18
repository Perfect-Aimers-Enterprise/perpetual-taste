const path = require('path')
const multer = require('multer')
const fs = require('fs')


// Ensure the directory exists
const uploadDir = 'public/uploads/menuImage'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const newMenuStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir) // Now the folder exists for sure
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9)
        const fileExtension = path.extname(file.originalname)
        cb(null, file.fieldname + '_' + uniqueSuffix + fileExtension)
    }
})


// const newMenuStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadPath = process.env.VERCEL ? '/tmp' : 'public/image/menuImage'
//         cb(null, uploadPath)
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() +'_'+ Math.round(Math.random()*1E9)
//         const fileExtension = path.extname(file.originalname)
//         cb(null, file.fieldname +'_'+ uniqueSuffix+fileExtension)
//     }
// })

const menuStorage = multer({storage: newMenuStorage}).single('menuImage')


const newSpecialStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/specialImage')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() +'_'+ Math.round(Math.random()*1E9)
        const fileExtension = path.extname(file.originalname)
        cb(null, file.fieldname +'_'+ uniqueSuffix+fileExtension)
    }
})

// const newSpecialStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadPath = process.env.VERCEL ? '/tmp' : 'public/image/specialImage'
//         cb(null, uploadPath)
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() +'_'+ Math.round(Math.random()*1E9)
//         const fileExtension = path.extname(file.originalname)
//         cb(null, file.fieldname +'_'+ uniqueSuffix+fileExtension)
//     }
// })

const specialStorage = multer({storage: newSpecialStorage}).single('specialImage')


// const handleFileUpload = (req, res, next) => {
//     if (process.env.VERCEL) {
//         const tempPath = req.file.path
//         const targetPath = path.join('public/image/menuImage', req.file.filename)

//         // Move the file from /tmp to your public folder
//         fs.rename(tempPath, targetPath, (err) => {
//             if (err) return next(err)
//             next()
//         })
//     } else {
//         next()
//     }
// }

// const handleSpecialFileUpload = (req, res, next) => {
//     if (process.env.VERCEL) {
//         const tempPath = req.file.path
//         const targetPath = path.join('public/image/specialImage', req.file.filename)

//         // Move the file from /tmp to your public folder
//         fs.rename(tempPath, targetPath, (err) => {
//             if (err) return next(err)
//             next()
//         })
//     } else {
//         next()
//     }
// }

module.exports = {menuStorage, specialStorage}