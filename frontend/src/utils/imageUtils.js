/**
 * Enhance Cloudinary image URL with quality transformations
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {Object} options - Transformation options
 * @returns {string} Enhanced image URL
 */
export const enhanceImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return imageUrl;
  
  // If it's not a Cloudinary URL, return as is
  if (!imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = null,
    height = null,
    quality = 90, // Default to high quality (0-100)
    format = 'auto',
    dpr = 2 // Default to 2x for retina displays
  } = options;

  // Cloudinary URL format examples:
  // https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
  // https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/v{version}/{public_id}.{format}
  
  // Build transformation parameters
  const transformations = [];
  
  if (width || height) {
    const sizeParts = [];
    if (width) sizeParts.push(`w_${width}`);
    if (height) sizeParts.push(`h_${height}`);
    sizeParts.push('c_limit'); // Limit crop to maintain aspect ratio
    transformations.push(sizeParts.join(','));
  }
  
  // Handle quality - can be number (0-100) or string like 'auto:best'
  const qualityStr = typeof quality === 'number' ? quality : quality;
  transformations.push(`q_${qualityStr}`);
  transformations.push(`f_${format}`);
  transformations.push(`dpr_${dpr}`);
  transformations.push('fl_progressive'); // Progressive JPEG
  
  const transformString = transformations.join('/');
  
  // Handle different Cloudinary URL patterns
  // Pattern 1: .../image/upload/v{version}/...
  const pattern1 = imageUrl.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/)(.+)$/);
  if (pattern1) {
    return `${pattern1[1]}${transformString}/${pattern1[2]}${pattern1[3]}`;
  }
  
  // Pattern 2: .../image/upload/{existing_transforms}/v{version}/...
  const pattern2 = imageUrl.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)([^/]+)\/(v\d+\/)(.+)$/);
  if (pattern2) {
    // Replace existing transforms with new ones
    return `${pattern2[1]}${transformString}/${pattern2[3]}${pattern2[4]}`;
  }
  
  // Pattern 3: .../image/upload/... (no version)
  const pattern3 = imageUrl.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  if (pattern3) {
    // Check if there are already transformations
    const afterUpload = pattern3[2];
    if (afterUpload.match(/^[^/]+\//) && !afterUpload.startsWith('v')) {
      // Has transformations, replace them
      const rest = afterUpload.substring(afterUpload.indexOf('/') + 1);
      return `${pattern3[1]}${transformString}/${rest}`;
    } else {
      // No transformations, insert them
      return `${pattern3[1]}${transformString}/${afterUpload}`;
    }
  }
  
  // Fallback: try to insert transformations before the filename
  const lastSlash = imageUrl.lastIndexOf('/');
  if (lastSlash > 0) {
    const base = imageUrl.substring(0, lastSlash);
    const filename = imageUrl.substring(lastSlash + 1);
    
    // Check if /upload/ exists
    if (base.includes('/upload/')) {
      const uploadIndex = base.indexOf('/upload/') + '/upload/'.length;
      const afterUpload = base.substring(uploadIndex);
      
      // If there's already something after /upload/, replace it
      if (afterUpload) {
        const beforeUpload = base.substring(0, base.indexOf('/upload/') + '/upload/'.length);
        return `${beforeUpload}${transformString}/${filename}`;
      } else {
        return `${base}/${transformString}/${filename}`;
      }
    }
  }
  
  // If all else fails, return original URL
  return imageUrl;
};

