import { createContext, Dispatch, SetStateAction } from "react"

export type TextStyle = {
  fontSize: number,
  fontFamily: string,
}

export const defaultStyle: TextStyle = {
	fontSize: 16,
	fontFamily: "Times New Roman",
}

const StyleContext = createContext<{
  styles: Record<string, TextStyle>,
  setStyles: Dispatch<SetStateAction<Record<string, TextStyle>>>
}>({ styles: {}, setStyles: () => null })

export default StyleContext