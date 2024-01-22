// @flow

import React from "react"
import { Region } from "./types/annotator.types"
import styled from "styled-components"
import MultiSelect from "./MultiSelect"


const AnnotationBox = styled.div`
  opacity: 1;
  cursor: pointer;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: 4px;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
`

const TagChip = styled.div<{chipColor?: string}>`
  display: flex;
  background-color: ${props => props.chipColor || "#888"};
  color: #fff;
  padding: 4px;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 4px;
  font-weight: bold;
  text-shadow: 0px 0px 5px rgba(0,0,0,0.4);
`


interface IRegionLabelProps {
  region: Region;
  editing?: boolean;
  allowedClasses?: Array<string>;
  allowedTags?: Array<string>;
  onDelete: (region: Region) => void;
  onChange: (region: Region) => void;
  onClose?: (region: Region) => void;
  onOpen?: (region: Region) => void;
}

const RegionLabel: React.FC<IRegionLabelProps> = ({
  region,
  editing,
  allowedClasses,
  allowedTags,
  onDelete,
  onChange,
  onClose,
  onOpen,
}) => {

  return (
      <AnnotationBox onClick={() => (!editing ? onOpen(region) : null)}>
        {!editing ? (
          <div>
            {region.cls && (
              <div>
                <div style={{ backgroundColor: region.color }}/>
                {region.cls}
              </div>
            )}
            {region.tags && (
              <div>
                {region.tags.map((tag, index) => (
                  <div key={index}>
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: 200 }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <TagChip chipColor={region.color}>
                {region.type}
              </TagChip>
              <div style={{ flexGrow: 1 }} />
              <button
                onClick={() => onDelete(region)}
                tabIndex={-1}
              >
                Delete
              </button>
            </div>
            {(allowedClasses || []).length > 0 && (
              <div style={{ marginTop: 6 }}>
                <select
                  onChange={e => onChange({ ...region, cls: e.target.value })}
                  value={region.cls}
                >
                  {allowedClasses.map((c, index) => (
                    <option key={index} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
            {(allowedTags || []).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <MultiSelect
                  availableOptions={(allowedTags || []).map(tag => ({
                    id: tag,
                    label: tag,
                  }))}
                  selectedItems={(region.tags || []).map(tag => ({
                    id: tag,
                    label: tag,
                  }))}
                  setSelectedItems={tags => onChange({
                    ...region,
                    tags: tags.map(t => t.id),
                  })}
                />
              </div>
            )}
            { onClose && (
              <div style={{ marginTop: 4, display: "flex" }}>
                <div style={{ flexGrow: 1 }} />
                <button
                  onClick={() => onClose(region)}
                  color="primary"
                >
                  Ok
                </button>
              </div>
            )}
          </div>
        )}
      </AnnotationBox>
  )
}

export default RegionLabel