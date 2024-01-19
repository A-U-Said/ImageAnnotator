import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import fileRequests from "api/fileRequests";
import PdfUpload from "./PdfUpload";
import { PdfFileView } from "api/types/fileRequests.views";
import PdfEditor from "./PdfEditor";


const DocumentsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  div {
    display: flex;
    flex-flow: column nowrap;
    cursor: pointer;
    background-color: #D3D3D3;
    box-sizing: border-box;
    padding: 12px;
    margin: 4px;
    max-width: 200px;

    h3 {
      margin: 4px;
      font-size: 16px;
    }
  }
`


const PdfDocuments: React.FC = () => {

  const uploadRef = useRef<HTMLSpanElement>();
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [documents, setDocuments] = useState<PdfFileView[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PdfFileView>();

  useEffect(() => {
    if (uploadRef.current) {
      uploadRef.current.innerHTML = `${uploadPercent}%`;
    }
  }, [uploadPercent])
  
  const handleUpload = (fileData: File[]) => {
    const formData = new FormData();

    for (let i = 0; i < fileData.length; i++) {
      formData.append("formFiles", fileData[i]);
    }

    fileRequests.splitPdf(formData, (progressEvent) => {
      if (progressEvent.total) {
        const _uploadPercent = Math.floor(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        setUploadPercent(_uploadPercent);
      }
    })
    .then(payload => {
      setUploadPercent(0);
      setDocuments(payload);
    });
  }

  const handleReset = () => {
    setDocuments([]);
  }

  return ( documents.length === 0 ? (
    <>
      <PdfUpload 
        onUpload={handleUpload} 
        showPreview 
      />
      { uploadPercent > 0 && ( <span ref={uploadRef}></span> )}
    </>
    ) : (
    <>
      <button type="button" onClick={handleReset}>Reset</button>

      {!selectedDocument ? (
        <DocumentsContainer>
          { documents.map((document, index) => (
            <div key={index}>
              <h3>{document.title}</h3>
              <img 
                key={index} 
                src={document.pages[0]?.data}
                alt={document.title}
                onClick={() => setSelectedDocument(documents[index])}
              />
            </div>
          ))}
        </DocumentsContainer>
      )
      : (
        <>
          <button type="button" onClick={() => setSelectedDocument(null)}>Back</button>
          <PdfEditor document={selectedDocument} />
        </>
      )}
    </>
    )
  )
}


export default PdfDocuments;