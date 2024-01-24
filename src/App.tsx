import Annotator from "components/Annotator";
import PdfDocuments from "components/PdfDocuments";
import { styled } from "styled-components";


const PageContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`


const App = () => {

  return (
    <>
      {/* <PdfDocuments /> */}
      <PageContainer>
        <Annotator
          regionTagList={["fur", "whisker", "organ"]}
          regionClsList={["cat", "not-cat"]}
          images={[
            {
              src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/VAN_CAT.png",
              name: "cat",
            },
            {
              src: "https://placekitten.com/408/287",
              name: "Image 1",
            }
          ]}
          onExit={(output) => {
            console.log(output);
          }}
        />
      </PageContainer>
    </>
  )
}


export default App;
