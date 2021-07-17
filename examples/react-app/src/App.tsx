import React from 'react';
import { Link } from 'react-router-dom';

interface IState {

}

interface IProps {

}

class HomePage extends React.PureComponent<IProps, IState> {
  render() {
    return (

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 100,
      }}
      >
        <Link to="/redirectMode"><button>Login with Redirect Mode (Recommended)</button></Link>
        <Link to="/popupMode"><button>Login with Popup Mode</button></Link>

      </div>
    );
  }
}

export default HomePage;
