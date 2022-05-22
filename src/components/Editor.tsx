import { FC, useContext } from "react"
import AppContext from "../context/appContext"
import StyleContext from "../context/styleContext"

interface EditorProps {
  handleAltoChange: any;
  handleImageChange: any;
}

const Editor:FC<EditorProps> = ({handleAltoChange, handleImageChange}) => {
	const {zoom, setZoom} = useContext(AppContext)
	const {styles, setStyles} = useContext(StyleContext)

	return (
		<div>
			<p>Pick alto xml file: </p>
			<input type="file" onChange={handleAltoChange} accept=".xml"/>
			<p>Pick jpeg scan: </p>
			<input type="file" onChange={handleImageChange} accept=".jpg"/>
			<p>Zoom: {zoom}</p>
			<button onClick={() => setZoom(old => Math.round((old - 0.1) * 100) / 100)}>-</button>
			<button onClick={() => setZoom(old => Math.round((old + 0.1) * 100) / 100)}>+</button>
			<hr />
			<p>Font settings:</p>
			{Object.keys(styles).map(key => (
				<div key={key}>
					<p>{key}</p>
					<input 
						type="number" 
						value={styles[key].fontSize} 
						onChange={(e) => setStyles(old => ({...old, [key]: {...old[key], fontSize: parseInt(e.target.value)}}))}
					/>
					<p>Font family: {styles[key].fontFamily}</p>
				</div>
			))}
		</div>
	)
}

export default Editor