const sharp = require('sharp');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'public', 'images');

(async () => {
  await sharp(path.join(IMG_DIR, 'chana-moong1.png'))
    .jpeg({ quality: 85 })
    .toFile(path.join(IMG_DIR, 'chana-moong1-conv.jpg'));
  console.log('chana-moong1-conv.jpg written');

  await sharp(path.join(IMG_DIR, 'chana-moong2.png'))
    .jpeg({ quality: 85 })
    .toFile(path.join(IMG_DIR, 'chana-moong2-conv.jpg'));
  console.log('chana-moong2-conv.jpg written');

  await sharp(path.join(IMG_DIR, 'chana-moong1-conv.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85 })
    .toFile(path.join(IMG_DIR, 'og-sprouts.jpg'));
  console.log('og-sprouts.jpg written');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
