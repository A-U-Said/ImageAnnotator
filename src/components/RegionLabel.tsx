// @flow

import React, { useRef, memo } from "react"
import { Region } from "./types/annotator.types"
import styled from "styled-components"


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


interface IRegionLabelProps {
  region: Region,
  editing?: boolean,
  allowedClasses?: Array<string>,
  allowedTags?: Array<string>,
  cls?: string,
  tags?: Array<string>,
  onDelete: (region: Region) => null,
  onChange: (region: Region) => null,
  onClose?: (region: Region) => null,
  onOpen?: (region: Region) => null,
  onRegionClassAdded?: () => {},
  allowComments?: boolean,
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
  onRegionClassAdded,
  allowComments,
}) => {

  const commentInputRef = useRef(null)
  const onCommentInputClick = () => {
    // The TextField wraps the <input> tag with two divs
    const commentInput = commentInputRef.current.children[0].children[0]

    if (commentInput) {
      return commentInput.focus()
    }
  }

  return (
      <AnnotationBox onClick={() => (!editing ? onOpen(region) : null)}>
        {!editing ? (
          <div>
            {region.cls && (
              <div className="name">
                <div
                  className="circle"
                  style={{ backgroundColor: region.color }}
                />
                {region.cls}
              </div>
            )}
            {region.tags && (
              <div className="tags">
                {region.tags.map((t) => (
                  <div key={t} className="tag">
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: 200 }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  display: "flex",
                  backgroundColor: region.color || "#888",
                  color: "#fff",
                  padding: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                  borderRadius: 4,
                  fontWeight: "bold",
                  textShadow: "0px 0px 5px rgba(0,0,0,0.4)",
                }}
              >
                {region.type}
              </div>
              <div style={{ flexGrow: 1 }} />
              <button
                onClick={() => onDelete(region)}
                tabIndex={-1}
                style={{ width: 22, height: 22 }}
              >
                Delete
              </button>
            </div>
            {/* {(allowedClasses || []).length > 0 && (
              <div style={{ marginTop: 6 }}>
                <CreatableSelect
                  placeholder="Classification"
                  onChange={(o, actionMeta) => {
                    if (actionMeta.action == "create-option") {
                      onRegionClassAdded(o.value)
                    }
                    return onChange({
                      ...region,
                      cls: o.value,
                    })
                  }}
                  value={
                    region.cls ? { label: region.cls, value: region.cls } : null
                  }
                  options={
                    allowedClasses.map((c) => ({ value: c, label: c }))
                  }
                />
              </div>
            )}
            {(allowedTags || []).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <select
                  onChange={(newTags) =>
                    onChange({
                      ...region,
                      tags: newTags.map((t: any) => t.value),
                    })
                  }
                  placeholder="Tags"
                  value={(region.tags || []).map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  isMulti
                  options={
                    allowedTags.map((c) => ({ value: c, label: c }))
                  }
                />
              </div>
            )} */}
            {onClose && (
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