import { Center, Loader, Title } from '@mantine/core';
import { FC, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import EditorOverlay from 'renderer/components/editorOverlay/EditorOverlay';
import Viewer from 'renderer/components/Viewer';
import { useAlto } from 'renderer/context/AltoContext';
import { useEditor } from 'renderer/context/EditorContext';

const Editor: FC = () => {
  const [urlSearchParams] = useSearchParams();
  const index = urlSearchParams.get('index');
  const imageFileName = urlSearchParams.get('image');
  const altoFileName = urlSearchParams.get('alto');

  const { loading, requestPageAssets, settings, setSettings, saveAlto } =
    useEditor();
  const { pageDimensions } = useAlto();

  const alignCenter = useCallback(() => {
    const availableWidth = window.innerWidth - 70 * 2;
    const availableHeight = window.innerHeight - 56 * 2;

    const contentWidth = settings.show.textNext
      ? pageDimensions.width * 2
      : pageDimensions.width;
    const contentHeight = pageDimensions.height;

    const scaleWidth = availableWidth / contentWidth;
    const scaleHeight = availableHeight / contentHeight;

    const ratio = Math.min(scaleWidth, scaleHeight);
    const newZoom =
      ratio < 1 ? Math.floor(ratio * 100) / 100 : Math.ceil(ratio * 100) / 100;

    const xCenter = (2 * pageDimensions.width + 40) / 2 - window.innerWidth / 2;
    window.scrollTo({
      left: settings.show.textNext
        ? xCenter + (pageDimensions.width * newZoom) / 2
        : xCenter,
      top: 0,
    });
    setSettings((old) => ({ ...old, zoom: newZoom }));
  }, [
    pageDimensions.height,
    pageDimensions.width,
    setSettings,
    settings.show.textNext,
  ]);

  const onSave = useCallback(() => {
    if (altoFileName && index) {
      saveAlto(altoFileName, parseInt(index, 10));
    }
  }, [altoFileName, index, saveAlto]);

  useEffect(() => {
    if (!loading) alignCenter();
  }, [alignCenter, loading]);

  useEffect(() => {
    if (imageFileName && altoFileName) {
      requestPageAssets(imageFileName, altoFileName);
    }
  }, [imageFileName, altoFileName, requestPageAssets]);

  if (loading)
    return (
      <Center mt={120}>
        <Loader />
        <Title order={2} ml="sm">
          Loading...
        </Title>
      </Center>
    );

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          minWidth: '100vw',
          width: 2 * pageDimensions.width + 40,
          height: 2 * pageDimensions.height + 40,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            margin: 56,
            transform: `scale(${settings.zoom})`,
            transformOrigin: 'center top',
          }}
        >
          <Viewer />
        </div>
      </div>
      <EditorOverlay
        alignCenter={alignCenter}
        pageNumber={parseInt(index || '0', 10)}
        onSave={onSave}
      />
    </>
  );
};

export default Editor;
