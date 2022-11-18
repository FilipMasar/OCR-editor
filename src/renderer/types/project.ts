export type ProjectAsset = {
  image: string;
  alto: string;
};

export type ProjectAssets = ProjectAsset[];

export type ProjectContextValues = {
  projectAssets: ProjectAssets | undefined;
  errorMessage: string | undefined;
  resetErrorMessage: () => void;
  createProject: () => void;
  openProject: (projectPath?: string) => void;
  addImages: () => void;
  addAltos: () => void;
  removeAsset: (directory: 'images' | 'altos', name: string) => void;
};
