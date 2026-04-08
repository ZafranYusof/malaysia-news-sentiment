import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <style>{`
        .notfound-container {
          min-height: 100vh;
          background-color: #020617;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          padding: 20px;
        }

        .main_wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30em;
          height: 30em;
          position: relative;
        }

        .main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 5em;
          position: relative;
          z-index: 10;
        }

        .antenna {
          width: 5em;
          height: 5em;
          border-radius: 50%;
          border: 2px solid black;
          background-color: #f27405;
          margin-bottom: -6em;
          margin-left: 0em;
          z-index: -1;
          position: relative;
        }

        .antenna_shadow {
          position: absolute;
          background-color: transparent;
          width: 50px;
          height: 56px;
          margin-left: 1.68em;
          border-radius: 45%;
          transform: rotate(140deg);
          border: 4px solid transparent;
          box-shadow: inset 0px 16px #a85103, inset 0px 16px 1px 1px #a85103;
        }

        .antenna::after {
          content: "";
          position: absolute;
          margin-top: -9.4em;
          margin-left: 0.4em;
          transform: rotate(-25deg);
          width: 1em;
          height: 0.5em;
          border-radius: 50%;
          background-color: #f69e50;
        }

        .antenna::before {
          content: "";
          position: absolute;
          margin-top: 0.2em;
          margin-left: 1.25em;
          transform: rotate(-20deg);
          width: 1.5em;
          height: 0.8em;
          border-radius: 50%;
          background-color: #f69e50;
        }

        .a1 {
          position: relative;
          top: -102%;
          left: -130%;
          width: 12em;
          height: 5.5em;
          border-radius: 50px;
          background-image: linear-gradient(#171717, #171717, #353535, #353535, #171717);
          transform: rotate(-29deg);
          clip-path: polygon(50% 0%, 49% 100%, 52% 100%);
        }

        .a1d {
          position: relative;
          top: -211%;
          left: -35%;
          transform: rotate(45deg);
          width: 0.5em;
          height: 0.5em;
          border-radius: 50%;
          border: 2px solid black;
          background-color: #979797;
          z-index: 99;
        }

        .a2 {
          position: relative;
          top: -210%;
          left: -10%;
          width: 12em;
          height: 4em;
          border-radius: 50px;
          background-color: #171717;
          background-image: linear-gradient(#171717, #171717, #353535, #353535, #171717);
          margin-right: 5em;
          clip-path: polygon(47% 0, 47% 0, 34% 34%, 54% 25%, 32% 100%, 29% 96%, 49% 32%, 30% 38%);
          transform: rotate(-8deg);
        }

        .a2d {
          position: relative;
          top: -294%;
          left: 94%;
          width: 0.5em;
          height: 0.5em;
          border-radius: 50%;
          border: 2px solid black;
          background-color: #979797;
          z-index: 99;
        }

        .tv {
          width: 17em;
          height: 9em;
          margin-top: 3em;
          border-radius: 15px;
          background-color: #d36604;
          display: flex;
          justify-content: center;
          border: 2px solid #1d0e01;
          box-shadow: inset 0.2em 0.2em #e69635;
          position: relative;
        }

        .tv::after {
          content: "";
          position: absolute;
          width: 17em;
          height: 9em;
          border-radius: 15px;
          background: repeating-radial-gradient(#d36604 0 0.0001%, #00000070 0 0.0002%) 50% 0/2500px 2500px,
                      repeating-conic-gradient(#d36604 0 0.0001%, #00000070 0 0.0002%) 60% 60%/2500px 2500px;
          background-blend-mode: difference;
          opacity: 0.09;
        }

        .curve_svg {
          position: absolute;
          margin-top: 0.25em;
          margin-left: -0.25em;
          height: 12px;
          width: 12px;
        }

        .display_div {
          display: flex;
          align-items: center;
          align-self: center;
          justify-content: center;
          border-radius: 15px;
          box-shadow: 3.5px 3.5px 0px #e69635;
        }

        .screen_out {
          width: auto;
          height: auto;
          border-radius: 10px;
        }

        .screen_out1 {
          width: 11em;
          height: 7.75em;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .screen {
          width: 13em;
          height: 7.85em;
          border: 2px solid #1d0e01;
          background: repeating-radial-gradient(#000 0 0.0001%, #ffffff 0 0.0002%) 50% 0/2500px 2500px,
                      repeating-conic-gradient(#000 0 0.0001%, #ffffff 0 0.0002%) 60% 60%/2500px 2500px;
          background-blend-mode: difference;
          animation: static-interference 0.2s infinite alternate;
          border-radius: 10px;
          z-index: 99;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #252525;
          letter-spacing: 0.15em;
          text-align: center;
        }

        .notfound_text {
          background-color: black;
          padding: 2px 6px;
          font-size: 0.75em;
          color: white;
          letter-spacing: 0;
          border-radius: 5px;
          z-index: 10;
        }

        @keyframes static-interference {
          100% { background-position: 50% 0, 60% 50%; }
        }

        .lines {
          display: flex;
          column-gap: 0.1em;
          align-self: flex-end;
        }

        .line1, .line3 {
          width: 2px;
          height: 0.5em;
          background-color: black;
          border-radius: 25px 25px 0px 0px;
          margin-top: 0.5em;
        }

        .line2 {
          flex-grow: 1;
          width: 2px;
          height: 1em;
          background-color: black;
          border-radius: 25px 25px 0px 0px;
        }

        .buttons_div {
          width: 4.25em;
          align-self: center;
          height: 8em;
          background-color: #e69635;
          border: 2px solid #1d0e01;
          padding: 0.6em;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          row-gap: 0.75em;
          box-shadow: 3px 3px 0px #e69635;
        }

        .b1 {
          width: 1.65em;
          height: 1.65em;
          border-radius: 50%;
          background-color: #7f5934;
          border: 2px solid black;
          box-shadow: inset 2px 2px 1px #b49577, -2px 0px #513721, -2px 0px 0px 1px black;
          position: relative;
        }

        .b1::before {
          content: "";
          position: absolute;
          top: 0.8em;
          left: 0.4em;
          transform: rotate(47deg);
          border-radius: 5px;
          width: 0.1em;
          height: 0.4em;
          background-color: #000000;
        }

        .b1 div {
          content: "";
          position: absolute;
          top: 0;
          left: 0.65em;
          transform: rotate(45deg);
          width: 0.15em;
          height: 1.5em;
          background-color: #000000;
        }

        .b2 {
          width: 1.65em;
          height: 1.65em;
          border-radius: 50%;
          background-color: #7f5934;
          border: 2px solid black;
          box-shadow: inset 2px 2px 1px #b49577, -2px 0px #513721, -2px 0px 0px 1px black;
          position: relative;
        }

        .speakers {
          display: flex;
          flex-direction: column;
          row-gap: 0.5em;
        }

        .speakers .g1 {
          display: flex;
          column-gap: 0.25em;
        }

        .speakers .g1 .g11, .g12, .g13 {
          width: 0.65em;
          height: 0.65em;
          border-radius: 50%;
          background-color: #7f5934;
          border: 2px solid black;
          box-shadow: inset 1.25px 1.25px 1px #b49577;
        }

        .speakers .g {
          width: auto;
          height: 2px;
          background-color: #171717;
        }

        .bottom {
          width: 100%;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 8.7em;
          margin-top: 10px;
        }

        .base1, .base2 {
          height: 1em;
          width: 2em;
          border: 2px solid #171717;
          background-color: #4d4d4d;
          margin-top: -0.15em;
          z-index: -1;
        }

        .base3 {
          position: absolute;
          height: 0.15em;
          width: 17.5em;
          background-color: #171717;
          margin-top: 0.8em;
        }

        .text_404 {
          position: absolute;
          display: flex;
          flex-direction: row;
          column-gap: 6em;
          z-index: -5;
          margin-bottom: 2em;
          align-items: center;
          justify-content: center;
          opacity: 0.15;
        }

        .text_4041, .text_4042, .text_4043 {
          font-size: 15rem;
          font-weight: 900;
          color: #1e293b;
        }

        .error-message-container {
          margin-top: 2rem;
          text-align: center;
          max-width: 500px;
          z-index: 20;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .error-desc {
          color: #94a3b8;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .btn-home {
          padding: 12px 32px;
          background: linear-gradient(to right, #6366f1, #a855f7);
          color: white;
          border-radius: 99px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
          display: inline-block;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }

        .btn-home:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
        }
      `}</style>

      <div className="main_wrapper">
        <div className="main">
          <div className="antenna">
            <div className="antenna_shadow"></div>
            <div className="a1"></div>
            <div className="a1d"></div>
            <div className="a2"></div>
            <div className="a2d"></div>
          </div>
          <div className="tv">
            <div className="display_div">
              <div className="screen_out">
                <div className="screen_out1">
                  <div className="screen">
                    <span className="notfound_text">SIGNAL LOST</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lines">
              <div className="line1"></div>
              <div className="line2"></div>
              <div className="line3"></div>
            </div>
            <div className="buttons_div">
              <div className="b1"><div></div></div>
              <div className="b2"></div>
              <div className="speakers">
                <div className="g1">
                  <div className="g11"></div>
                  <div className="g12"></div>
                  <div className="g13"></div>
                </div>
                <div className="g"></div>
                <div className="g"></div>
              </div>
            </div>
          </div>
          <div className="bottom">
            <div className="base1"></div>
            <div className="base2"></div>
            <div className="base3"></div>
          </div>
        </div>
        <div className="text_404">
          <div className="text_4041">4</div>
          <div className="text_4042">0</div>
          <div className="text_4043">4</div>
        </div>
      </div>

      <div className="error-message-container">
        <h1 className="error-title">Intelligence Node Offline</h1>
        <p className="error-desc">
          The intelligence node you are attempting to access appears to have lost its connection to the national news matrix. 
          The frequency might be encrypted or the source has been decommissioned.
        </p>
        <Link to="/" className="btn-home">RE-ESTABLISH LINK</Link>
      </div>
    </div>
  );
};

export default NotFound;
