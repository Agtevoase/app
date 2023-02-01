import { Container, Slider, Typography } from '@mui/material';
import cn from 'classnames';
import { useRef, useState } from 'react';

import styles from './App.module.scss';

const getImagePosition = (
  parentWidth,
  parentHeight,
  childWidth,
  childHeight,
  scale = 1,
  offsetX = 0.5,
  offsetY = 0.5,
) => {
  const childRatio = childWidth / childHeight;
  const parentRatio = parentWidth / parentHeight;
  let width = parentWidth * scale;
  let height = parentHeight * scale;

  if (childRatio < parentRatio) {
    height = width / childRatio;
  } else {
    width = height * childRatio;
  }

  return {
    width,
    height,
    offsetX: (parentWidth - width) * offsetX,
    offsetY: (parentHeight - height) * offsetY,
  };
};

const downloadResult = (
  firstImage,
  secondImage,
  firstOpacity,
  secondOpacity,
) => {
  if (!firstImage || !secondImage) return;

  if (!downloadResult.canvas) {
    downloadResult.canvas = document.createElement('canvas');
  }

  const canvas = downloadResult.canvas;
  const context = canvas.getContext('2d');

  const size = firstImage.offsetWidth;
  canvas.width = size;
  canvas.height = size;

  context.globalAlpha = firstOpacity;
  const firstParams = getImagePosition(
    size,
    size,
    firstImage.naturalWidth,
    firstImage.naturalHeight,
  );
  context.drawImage(
    firstImage,
    firstParams.offsetX,
    firstParams.offsetY,
    firstParams.width,
    firstParams.height,
  );

  context.globalAlpha = secondOpacity;
  const secondParams = getImagePosition(
    size,
    size,
    secondImage.naturalWidth,
    secondImage.naturalHeight,
  );
  context.drawImage(
    secondImage,
    secondParams.offsetX,
    secondParams.offsetY,
    secondParams.width,
    secondParams.height,
  );

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    if (!downloadResult.anchor) {
      downloadResult.anchor = document.createElement('a');
    }

    const anchor = downloadResult.anchor;
    anchor.download = 'result.png';
    anchor.href = url;
    anchor.click();
  }, 'image/png');
};

const App = () => {
  const [firstImage, setFirstImage] = useState();
  const [secondImage, setSecondImage] = useState();
  const [firstTransparency, setFirstTransparency] = useState(0.8);
  const [secondTransparency, setSecondTransparency] = useState(0.8);

  const firstResultRef = useRef(null);
  const secondResultRef = useRef(null);

  const onUpload = (event, index) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const src = URL.createObjectURL(file);

    if (index === 0) {
      setFirstImage(src);
    } else {
      setSecondImage(src);
    }
  };

  const firstOpacity = 1 - firstTransparency;
  const secondOpacity = 1 - secondTransparency;

  return (
    <Container maxWidth="xl">
      <div className={styles.container}>
        <Typography
          variant="h4"
          component="h1"
          textAlign="center"
          className={styles.title}
        >
          Накладання зображень з різними коефіцієнтами прозорості
        </Typography>
        <div className={styles.containerInner}>
          <div className={cn(styles.sourceImage, styles.column)}>
            <Typography
              variant="h5"
              component="h2"
              textAlign="center"
              className={styles.subtitle}
            >
              Перше зображення
            </Typography>
            <label className={styles.label}>
              <input
                id="first-image-input"
                type="file"
                accept="image/png, image/gif, image/jpeg, image/webp"
                hidden
                onChange={(event) => onUpload(event, 0)}
              />
              <img alt="first" src={firstImage || 'no-image.jpg'} />
            </label>

            <Typography
              gutterBottom
            >{`Коефіцієнт прозорості: ${firstTransparency}`}</Typography>
            <Slider
              value={firstTransparency}
              onChange={(_, value) => setFirstTransparency(value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className={cn(styles.sourceImage, styles.column)}>
            <Typography
              variant="h5"
              component="h2"
              textAlign="center"
              className={styles.subtitle}
            >
              Друге зображення
            </Typography>
            <label className={styles.label}>
              <input
                id="second-image-input"
                accept="image/png, image/gif, image/jpeg, image/webp"
                type="file"
                hidden
                onChange={(event) => onUpload(event, 1)}
              />
              <img alt="second" src={secondImage || 'no-image.jpg'} />
            </label>

            <Typography
              gutterBottom
            >{`Коефіцієнт прозорості: ${secondTransparency}`}</Typography>
            <Slider
              value={secondTransparency}
              onChange={(_, value) => setSecondTransparency(value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className={styles.column}>
            <Typography
              variant="h5"
              component="h2"
              textAlign="center"
              className={styles.subtitle}
            >
              Результуюче зображення
            </Typography>
            <div className={styles.result}>
              <img
                alt="first-result"
                src={firstImage}
                style={{ opacity: firstOpacity }}
                ref={firstResultRef}
              />
              <img
                src={secondImage}
                alt="second-result"
                style={{ opacity: secondOpacity }}
                ref={secondResultRef}
              />
              <button
                className={styles.resultButton}
                onClick={() =>
                  downloadResult(
                    firstResultRef.current,
                    secondResultRef.current,
                    firstOpacity,
                    secondOpacity,
                  )
                }
              >
                Зберегти результуюче зображення
              </button>
              <div
                className={cn(
                  styles.bg,
                  (firstImage || secondImage) && styles.hidden,
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default App;
