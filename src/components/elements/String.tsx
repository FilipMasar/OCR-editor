import { FC, useEffect, useState } from "react"
import { useAltoContext } from "../../context/altoContext"
import { usePanelContext } from "../../context/panelContext"
import { TextStyle } from "../../types/app"

const defaultStyle: TextStyle = {
	fontSize: 16,
	fontFamily: "Times New Roman",
}

interface StringProps {
	element: any;
	metadata: any;
}

const String:FC<StringProps> = ({ element, metadata}) => {
	const { styles } = useAltoContext()
	const { settings } = usePanelContext()
	const { show } = settings
	const [textStyle, setTextStyle] = useState<TextStyle>(defaultStyle)

	const top = element["@_VPOS"]
	const left = element["@_HPOS"]
	const width = element["@_WIDTH"]
	const height = element["@_HEIGHT"]
	const text = element["@_CONTENT"].toString()

	useEffect(() => {
		const styleRefsArray = metadata["@_STYLEREFS"].split(" ")
    
		for (const id of styleRefsArray) {
			if (styles[id]) {
				setTextStyle(styles[id])
			}
		}
	}, [styles])

	return (
		<>
			{/* Strings elements */}
			{show.strings && (
				<div 
					style={{ position: "absolute", top, left, width, height }} 
					className={`border border-green-500 hover:bg-green-500 hover:opacity-30 ${textStyle.color}`}
				/>
			)}

			{/* Text Fit */}
			{show.textFit && 
				<div 
					className="flex items-start justify-between"
					style={{ 
						position: "absolute", 
						top, 
						left,
						width,
						height,
						fontFamily: textStyle.fontFamily,
						fontSize: `calc(${textStyle.fontSize}pt / 0.2645833333)`,
						lineHeight: `${height}px`,
					}}
				>
					{text.split("").map((char: string, index: number) => (
						<span key={index}>{char}</span>
					))}
				</div>
			}

			{/* Text Above */}
			{show.textAbove && 
				<div 
					className="flex items-start justify-around"
					style={{ 
						position: "absolute", 
						top: metadata.lineVPos - 20, 
						left,
						width,
					}}
				>
					{text.split("").map((char: string, index: number) => (
						<span key={index}>{char}</span>
					))}
				</div>
			}
		</>
	)
}

export default String
