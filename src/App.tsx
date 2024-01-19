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
          regionTagList={["has-bun"]}
          regionClsList={["hotdog", "not-hotdog"]}
          images={[
            {
              src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/VAN_CAT.png",
              name: "hot-dogs-1",
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
