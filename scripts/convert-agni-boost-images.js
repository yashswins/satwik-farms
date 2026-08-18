const sharp = require('sharp');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'public', 'images');

(async () => {
  await sharp(path.join(IMG_DIR, 'weight-loss.jpg'))
    .jpeg({ quality: 85 })
    .toFile(path.join(IMG_DIR, 'weight-loss-cover.jpg'));
  console.log('weight-loss-cover.jpg written');

  await sharp(path.join(IMG_DIR, 'weight-loss2.png'))
    .png({ compressionLevel: 9 })
    .toFile(path.join(IMG_DIR, 'weight-loss-ingredients.png'));
  console.log('weight-loss-ingredients.png written');

  await sharp(path.join(IMG_DIR, 'weight-loss-cover.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85 })
    .toFile(path.join(IMG_DIR, 'og-agni-boost.jpg'));
  console.log('og-agni-boost.jpg written');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
