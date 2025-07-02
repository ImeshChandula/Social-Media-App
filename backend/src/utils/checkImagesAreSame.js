// Check if images are unchanged
const areImagesUnchanged = (newImages, existingImages) => {
    if (!newImages && !existingImages) return true;
    if (!newImages || !existingImages) return false;

    const newImgArray = Array.isArray(newImages) ? newImages : [newImages];
    const existingImgArray = Array.isArray(existingImages) ? existingImages : [existingImages];

    if (newImgArray.length !== existingImgArray.length) return false;

    return newImgArray.every((img, index) => img === existingImgArray[index]);
};

module.exports = {areImagesUnchanged};
