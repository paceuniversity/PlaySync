import React from "react";
import Header from "../components/Header";

const DirectMessage = () => {
  return (
    <div
      className="align-items-center justify-content-center vw-100 vh-100"
      style={{ backgroundColor: "#223142" }}
    >
      <Header />
      <h4 className="text-4xl text-white font-bold mt-3">DirectMessage</h4>
    </div>
  );
};

export default DirectMessage;
