import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from 'renderer/context/ProjectContext';

const ProjectAssetsList: FC = () => {
  const { projectAssets, addImages, addAltos } = useProject();

  if (projectAssets === undefined) return <div>Something went wrong</div>;

  return (
    <div>
      <h1>List</h1>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Altos</th>
          </tr>
        </thead>
        <tbody>
          {projectAssets.map(({ image, alto }) => (
            <tr key={image}>
              <td>{image}</td>
              <td>{alto}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={addImages}>
        Add images
      </button>
      <button type="button" onClick={addAltos}>
        Add altos
      </button>
      <Link to="/">home</Link>
    </div>
  );
};

export default ProjectAssetsList;
