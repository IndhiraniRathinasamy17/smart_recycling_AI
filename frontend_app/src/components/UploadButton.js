import React from "react";

const UploadButton = ({ onFileSelect }) => {

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        id="upload-input"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: "none" }}
      />
   
      {/* Stylish + Icon button */}
      <label
        htmlFor="upload-input"
        style={{
          cursor: "pointer",
          background: "#10a37f",
          color: "white",
          width: "45px",
          height: "45px",
          borderRadius: "8px",
          fontSize: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.2)"
        }}
      >
        +
      </label>
    </>
  );
};

export default UploadButton;
