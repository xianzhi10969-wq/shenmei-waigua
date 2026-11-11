export function snapCoordinate(value, grid = 1) {
  const step = Number.isFinite(grid) && grid >= 1 ? grid : 1;
  return Math.round(value / step) * step;
}
export function integerImageSize(asset, width, height) {
  const maxScale = Math.floor(24000 / Math.max(asset.width, asset.height));
  if (maxScale < 1) throw new Error('原图超过 24000 像素，请使用真正的小尺寸像素素材');
  const factor = Math.max(1, Math.min(maxScale, Math.round(Math.max(width / asset.width, height / asset.height))));
  return { width: asset.width * factor, height: asset.height * factor, factor };
}
