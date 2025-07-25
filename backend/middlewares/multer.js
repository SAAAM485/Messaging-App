const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadFolder = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({ storage: storage });
module.exports = upload;
