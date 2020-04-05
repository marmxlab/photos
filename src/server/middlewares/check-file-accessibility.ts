import FileUtils from "../utils/file";

const CheckFileAccessibility = (ctx: any, next: () => Promise<void>) => {
  const path = ctx.query.path || ctx.request.body.path || '';
  const aPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getRootFolderPath(), path);
  // Check if accessing folder is allowed to access
  if (!FileUtils.isAccessAllowed(aPath)) {
    throw 'This directory is not allowed to access';
  }
  return next();
}

export default CheckFileAccessibility;
