/* eslint-disable class-methods-use-this */
import React from "react";
import Link from "next/link";

interface IState {}

interface IProps {}

class HomePage extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          margin: 100,
        }}
      >
        <Link href="/redirectMode/login">
          <button>Login with Redirect Mode (Recommended)</button>
        </Link>
        <Link href="/popupMode/login">
          <button>Login with Popup Mode</button>
        </Link>
      </div>
    );
  }
}

export default HomePage;
