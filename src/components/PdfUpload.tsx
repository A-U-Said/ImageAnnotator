import React, { useState } from "react";
import styled from "styled-components"
import PDFViewer from "./PdfViewer";
import PdfSelector from "./PdfSelector";
import { files } from "utils";


const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
`
const PreviewContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
`
const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;

  button {
    margin: 4px;
  }
`


interface IPdfUploadProps {
  onUpload: (fileData: File[]) => void;
  allowMultiple?: boolean;
  showPreview?: boolean;
}


const PdfUpload: React.FC<IPdfUploadProps> = ({ onUpload, allowMultiple, showPreview }) => {

  const [fileData, setFileData] = useState<File[]>([]);
  const [dataUris, setDataUris] = useState<string[]>([])

  const handleSelect = (data: File[]) => {
    data.forEach(_file => {
      files.fileToDataUri(_file)
        .then(dataUri => {
          setDataUris(prev => [...prev, dataUri]);
        });
    })
    setFileData(data);
  }

  const handleClear = () => {
    setFileData([]);
    setDataUris([]);
  }

  const handleUpload = () => {
    onUpload(fileData);
  }

  return (
    <Container>

      <PdfSelector 
        onSelect={handleSelect} 
        allowMultiple={allowMultiple} 
      />

      { dataUris.length > 0 && showPreview && (
        <PreviewContainer>
          {/* <h3>Preview:</h3> */}
          { allowMultiple ?
            dataUris.map((dataUri, index) => (
            <PDFViewer 
              key={index} 
              data={dataUri} 
              showToolbar={false} 
              style={{ margin: 12, flexGrow: 1 }} 
              height={500}
            />
          ))
          : (
            <PDFViewer 
              data={dataUris[0]} 
              style={{ margin: 12, flexGrow: 1 }}
              height={500}
            />
          )}
        </PreviewContainer>
      )}

      { dataUris.length > 0 && (
        <ButtonContainer>
          <button type="button" onClick={handleClear}>Clear</button>
          <button type="button" onClick={handleUpload}>Upload</button>
        </ButtonContainer>
      )}

    </Container>
  )
}


export default PdfUpload;