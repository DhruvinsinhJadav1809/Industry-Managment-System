import multer from "multer";

export const imageFileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb,
) => {
  const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PNG, JPG and JPEG images are allowed."));
  }

  cb(null, true);
};
