import { useState } from 'react'
import './App.css'
import { useEffect } from 'react'
import { useCallback } from 'react'
import ReactJson from 'react-json-view'

class LineCountError extends Error {}

function App() {
	const [fileContent, setFileContent] = useState('')
	const [parsedContent, setParsedContent] = useState([])
	const [depth, setDepth] = useState(2)

	const handleFileChange = (event) => {
	  const file = event.target.files[0]
	  if (file) {
		const reader = new FileReader()
		reader.onload = (e) => {
		  const content = e.target.result
		  setFileContent(content)
		}
		reader.readAsText(file)
	  }
	}

	const assertParseResult = useCallback(( linesArr, output) => {
		const entryCount = linesArr.filter(l => l.slice(0,4) === new Date().getFullYear() + '').length
		if (entryCount !== output.length){
			throw new LineCountError('LineCountError', entryCount, ' => ' , output.length)
		}
	},[])

	const parseTextLogWithConsole = useCallback(() => {
		if (!fileContent) return 
		const output = []
		const lines = fileContent.split('\r\n')
		
		for (const l of lines) {
			if (l.slice(0,4) === new Date().getFullYear() + '') {
				if (l.includes('{')) {
					const presumedJsonStart = l.indexOf('{')
					output.push({
						"action": l.slice(26,presumedJsonStart),
						"json": JSON.parse(l.slice(presumedJsonStart)),
					})
					continue
				}
				output.push(l.slice(26))
			} else {
				const presumedJsonStart = l.indexOf('{')
				try {
					output[output.length -1] = {
						"action": output[output.length -1],
						"json": JSON.parse(l.slice(presumedJsonStart)),
					}
				} catch (e) {
					console.log('ERROR:', e)
				}

			}
		}

		try {
			assertParseResult(lines, output)
		} catch (e) {
			console.log(e)
		} finally {
			console.log(output)
			setParsedContent(output)
		}

	},[fileContent])

	useEffect(() => {
		parseTextLogWithConsole()
	},[fileContent])
  
	return (
	  <div style={{width: '90vw'}}>
		<input
		  type="file"
		  onChange={handleFileChange}
		  accept=".txt"
		/>
		<div>
		  
		  {!fileContent ? <h2>Upload PlainText Log File</h2> : 
		  <div>
		  	Formatted output in console
			<div>
				Collapsed after depth
				<input style={{marginLeft: '1em', width: '3em'}} type="number" step='1' value={depth} onChange={(e) => {
					const val = Number(e.target.value)
					if (Number.isFinite(val)) 
						setDepth(val)
					}}/>
			</div>
			<ReactJson src={parsedContent} theme="rjv-default" collapsed={depth}
			displayDataTypes={false}
			displayObjectSize={true}
			/>
		  </div>
		  }
		</div>
	  </div>
	);
}

export default App
