import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const OuterContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const InputBar = styled.div<{focus: boolean}>`
  display: flex;
  align-items: center;
  align-self: center;
  height: 30px;
  border: 1px solid grey;
  box-shadow: ${(props) => (props.focus ? "2px 2px 4px grey" : "hidden")};
  border-radius: 5px;
  padding: 5px;
  overflow: scroll;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ItemContainer = styled.div`
  margin-right: 2px;
  display: flex;
  align-items: center;
  background-color: lightgrey;
`;

const Item = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 5px 5px 5px 15px;
`;

const ItemRemove = styled.button`
  border-width: 0;
  outline-width: 0;
  padding: 5px 6px;
  background-color: lightgrey;
  cursor: pointer;
  &:hover {
    background-color: rgba(200, 0, 0, 0.3);
    color: white;
  }
`;

const ListItemContainer = styled.ul`
  position: absolute;
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  margin-top: 2px;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
  padding-top: 5px;
  box-sizing: border-box;
  background-color: white;
  z-index: 2;
  box-shadow: 5px 5px 10px grey;
  max-height: 200px;
  overflow: hidden;
  overflow-y: scroll;
`;

const ListItem = styled.li`
  width: 100%;
  display: flex;
  padding: 10px;
  border: none;
  &:hover {
    background-color: whitesmoke;
  }
`;

const SelectArea = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  height: 100%;
  cursor: pointer;
  min-width: 100px;
`


type SelectOption = {
  id: string;
  label: string;
}

interface ISelectProps {
  availableOptions: Array<SelectOption>;
  selectedItems: Array<SelectOption>;
  setSelectedItems: (items: Array<SelectOption>) => void;
}


const MultiSelect: React.FC<ISelectProps> = ({
  availableOptions,
  selectedItems,
  setSelectedItems
}) => {

  const wrapperRef = useRef<HTMLDivElement>();
  const [focus, setFocus] = useState<boolean>(false);

  const handleClick = (e: MouseEvent) => {
    if (wrapperRef && !wrapperRef?.current?.contains(e.target as Node)) {
      setFocus(false);
    }
  };

  const handleUserKeyPress = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    if (key === "Escape") {
      setFocus(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleUserKeyPress);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);


  const addData = (item: SelectOption) => {
    setSelectedItems([...selectedItems, { ...item }]);
  };

  return (
    <OuterContainer ref={wrapperRef}>
      <InputBar focus={focus}>
        { selectedItems.map((item, index) => (
          <ItemContainer key={index}>
            <Item>{item.label}</Item>
            <ItemRemove
              onClick={() =>
                setSelectedItems(selectedItems.filter((i) => i.id !== item.id))
              }
            >
              x
            </ItemRemove>
          </ItemContainer>
        ))}
        <SelectArea onClick={() => setFocus(true)} />
      </InputBar>
      {focus && (
        <ListItemContainer>
          {availableOptions.length && (
            availableOptions.map((opt, index) => (
              <ListItem key={index} onClick={() => addData(opt)}>
                {opt.label}
              </ListItem>
            ))
          )}
        </ListItemContainer>
      )}
    </OuterContainer>
  );
}

export default MultiSelect;
