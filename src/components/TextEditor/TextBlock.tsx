import { FC, useEffect, useState } from "react"
import { addMetadata, getStringsFromLine } from "../../utils/alto"
import EditableLine from "./EditableLine"

interface TextBlockProps {
  textBlock: any
}

const TextBlock:FC<TextBlockProps> = ({ textBlock }) => {
	const [textLines, setTextLines] = useState<any[]>([])

	useEffect(() => {
		setTextLines([])
		if (textBlock.element?.TextLine) {
			const parentStyleRefs = textBlock.metadata["@_STYLEREFS"]
			const otherMetadata = {
				textBlockIndex: textBlock.metadata.index
			}

			setTextLines(addMetadata(textBlock.element.TextLine, parentStyleRefs, otherMetadata))
		}
	}, [textBlock])
  
	return (
		<div className="border m-2 p-2">
			{textLines.map((textLine: any) => (
				<EditableLine 
					key={`${textLine.metadata.textBlockindex}${textLine.metadata.index}`} 
					text={getStringsFromLine(textLine.element)}
					textLine={textLine}
				/>
			))}
		</div>
	)
}

export default TextBlock