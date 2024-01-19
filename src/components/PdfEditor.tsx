import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { PdfFileView, PdfPageView } from "api/types/fileRequests.views";
import Annotator from "./Annotator";


const ThumbnailsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  img {
    cursor: pointer;
    background-color: #D3D3D3;
    box-sizing: border-box;
    padding: 8px;
    margin: 4px;
    max-width: 10%;
  }
`

const PageContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`


interface IPdfEditorProps {
  document: PdfFileView
}


const PdfEditor: React.FC<IPdfEditorProps> = ({ document }) => {

  const [selectedPage, setSelectedPage] = useState<PdfPageView>();

  return (
    <>
      <ThumbnailsContainer>
        { document.pages.map((page, index) => (
          <img 
            key={index} 
            src={page.data}
            alt={`page-${page.index}`}
            onClick={() => setSelectedPage(page)}
          />
        ))}
      </ThumbnailsContainer>

      {selectedPage && (
        <PageContainer>
          <Annotator
            regionTagList={["has-bun"]}
            regionClsList={["hotdog", "not-hotdog"]}
            images={document.pages.map(page => ({
              src: page.data,
              name: `page-${page.index}`
            }))}
            onExit={(output) => {
              console.log(output);
            }}
          />
        </PageContainer>
      )}
    </>
  )
}


export default PdfEditor;