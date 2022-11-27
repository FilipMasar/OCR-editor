/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useHover } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import { useAltoEditor } from 'renderer/context/AltoEditorContext';
import { useTextEditor } from 'renderer/context/AltoTextEditorContext';
import { useAlto } from '../../context/AltoContext';
import { toNumber } from '../../utils/alto';

interface TextBlockProps {
  element: any;
  metadata: any;
}

const TextBlock: FC<TextBlockProps> = ({ element, metadata }) => {
  const { ref, hovered } = useHover();

  const { updateTextBlock } = useAlto();
  const { openAltoEditor } = useAltoEditor();
  const { openTextEditor } = useTextEditor();

  const top = toNumber(element['@_VPOS']);
  const left = toNumber(element['@_HPOS']);
  const width = toNumber(element['@_WIDTH']);
  const height = toNumber(element['@_HEIGHT']);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.altKey) {
        openAltoEditor(
          element,
          () => (updated: any) => updateTextBlock(updated, metadata.index)
        );
      } else {
        openTextEditor('TEXTBLOCK', { element, metadata });
      }
    };

    const div = ref.current;

    div.addEventListener('click', handleClick);

    return () => {
      div.removeEventListener('click', handleClick);
    };
  }, [
    element,
    metadata,
    metadata.index,
    openAltoEditor,
    openTextEditor,
    ref,
    updateTextBlock,
  ]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        border: '1px solid red',
        backgroundColor: hovered ? 'red' : 'transparent',
        opacity: hovered ? 0.5 : 1,
        cursor: 'pointer',
      }}
    />
  );
};

export default TextBlock;
