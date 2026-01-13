import multer from "multer";  //using multer to manage file uploading, it adds the metadata about the file to req.file in routes.

const storage = multer.diskStorage({})  //Initializes Multer’s disk storage engine. Disk storage writes uploaded files (sent from client) to your filesystem into temp destination & filename and add it to route (req.file). here its empty {} therefore settings is default.

const upload = multer({storage})  //Creates a Multer instance (middleware), this stores the file according to disk storage settings.

export default upload;