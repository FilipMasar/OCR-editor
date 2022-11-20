import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Settings } from '../types/app';
import { useAlto } from './AltoContext';

interface EditorProviderValue {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  imageSrc: string | undefined;
  setImageSrc: Dispatch<SetStateAction<string | undefined>>;
  requestPageAssets: (imageFileName: string, altoFileName: string) => void;
}

const defaultSettings: Settings = {
  zoom: 1,
  imageOpacity: 1,
  show: {
    printSpace: true,
    illustrations: true,
    graphicalElements: true,
    textBlocks: true,
    textLines: true,
    strings: false,
    textFit: false,
    textAbove: false,
  },
};

// Context
const EditorContext = createContext({} as EditorProviderValue);

// useContext
export const useEditor = () => useContext(EditorContext);

// Provider
const EditorProvider: FC<PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [imageSrc, setImageSrc] = useState<string>();
  const { setAlto } = useAlto();

  const requestPageAssets = useCallback(
    (imageFileName: string, altoFileName: string) => {
      if (imageFileName && altoFileName) {
        window.electron.ipcRenderer.sendMessage('editor-channel', {
          action: 'GET_PAGE_ASSETS',
          payload: { imageFileName, altoFileName },
        });
      }
    },
    []
  );

  useEffect(() => {
    window.electron.ipcRenderer.on('editor-channel', (data) => {
      console.log('editor-channel', data);
      switch (data.action) {
        case 'PAGE_ASSETS':
          setImageSrc(data.payload.imageUri);
          setAlto(data.payload.altoJson);
          break;
        case 'ERROR':
          console.log(String(data.payload));
          break;
        default:
          console.log('Unhandled action:', data.action);
      }
    });
  }, [setAlto]);

  return (
    <EditorContext.Provider
      value={{
        settings,
        setSettings,
        imageSrc,
        setImageSrc,
        requestPageAssets,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
