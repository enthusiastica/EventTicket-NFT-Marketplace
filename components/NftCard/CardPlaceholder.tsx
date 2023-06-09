import { transform } from "@chakra-ui/react";
import React, {
  useEffect,
  useState,
  TouchEvent,
  CSSProperties,
  SyntheticEvent,
} from "react";
import { RiFullscreenLine } from "react-icons/ri";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  font: Lato;
  display: flex;
  justify-content: center;

  @media only screen and (max-width: 600px) {
    transform: scale(calc(400 / 600));
    transform-origin: top center;
  }

  .card {
    position: absolute;
    width: 544px;
    height: 975px;
  }

  .background {
    position: absolute;
    width: 544px;
    height: 897px;
    left: 0px;
    bottom: 0px;
  }

  .background-gradient {
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;

    background: linear-gradient(
      219.17deg,
      #4f66e1 -10.14%,
      #3d142d 48.6%,
      #cb0000 101.53%
    );
    mix-blend-mode: normal;
    mask-image: url(/img/card-mask.png);
    mask-repeat: no-repeat;
    mask-position: top center;
  }

  .background-img {
    position: absolute;
    width: 740px;
    left: 0px;
    top: 0px;
  }

  .crop-background-img {
    position: absolute;
    width: 100%;
    height: 750px;
    overflow: hidden;
    top: -80px;
  }

  .overlay-gradient {
    mask-image: url(/img/card-mask-gradient.png);
  }

  .background-stripes {
    position: absolute;
    top: 0%;
    width: 521.71px;
    height: 100%;
    left: 50%;
    transform: translate(-50%);
    opacity: 30%;
    background: url(/img/stripes.png);
    background-size: 550px;
  }

  .signature {
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: translate(-50%);
    width: 250px;
    height: 150px;
    mask-image: url(/img/signature.png);
    mask-size: 250px auto;
    mask-repeat: no-repeat;
    background: white;
  }

  .serial-number {
    position: absolute;
    bottom: 5%;
    text-align: center;
    font-weight: 100;
    font-size: 18px;
    left: 50%;
    transform: translate(-50%);
    display: inline;
    color: #ffffff7a;
  }

  .athlete-name {
    position: absolute;
    bottom: 40%;
    left: 50%;
    transform: translate(-50%);
    font-size: 64px;
    font-weight: 900;
    text-align: center;
    line-height: 65px;
    color: white;
  }

  .background-name {
    font-size: 100px;
    line-height: 95px;

    transform: rotate(90deg);
    transform-origin: top left;

    position: absolute;
    left: 530px;
    top: 85px;
    color: #ffffff00;
    text-overflow: clip;
    text-align: left;

    width: 580px;
    overflow: hidden;
    white-space: nowrap;

    -webkit-text-stroke: 1px white;
    opacity: 50%;
  }

  .verified-logo {
    position: absolute;
    left: 5%;
    top: 75px;
    opacity: 30%;
  }

  .bold-info {
    font-style: normal;
    font-weight: 900;
    display: inline;
    color: white;
    font-size: 20px;
  }
  .info-heading {
    font-weight: 100;
    display: inline;
    color: #ffffff7a;
    font-size: 18px;
  }

  .info-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    width: 60px;
  }

  .basic-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    width: 460px;
    text-align: center;

    position: absolute;
    top: 63%;
    left: 50%;
    transform: translate(-50%);
  }

  .reverse-background-mask {
    mask-image: url(/img/reverse-background.png);
    mask-repeat: no-repeat;
    mask-position: top center;
    overflow: hidden;
  }

  .background-video {
    position: absolute;
    top: 0px;
    display: block;
    height: 898px;
    // width: auto;
    vertical-align: center;
    max-width: 3000px;
    left: 50%;
    transform: translate(-50%);
  }

  .reverse-logo-background {
    position: absolute;
    height: 300px;
    width: 100%;
    background: linear-gradient(
      180deg,
      #000d52 -25.39%,
      rgba(107, 117, 170, 0.452044) 80.43%,
      rgba(196, 196, 196, 0) 100%
    );
  }

  .reverse-verified-logo {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translate(-50%) scale(1.5);
  }

  .reverse-name-background {
    position: absolute;
    background-color: #000d52;
    bottom: 0px;
    width: 100%;
    height: 180px;
    opacity: 80%;
  }

  .reverse-athlete-name {
    top: 82%;
    width: 200px;
    font-size: 36px;
    line-height: 38px;
  }

  .card-container {
    position: relative;
    transform-style: preserve-3d;
    // perspective: 200px;
    transform-origin: center;
  }

  .front {
    z-index: 2;
    backface-visibility: hidden;
    transform: rotateY(0deg);
  }

  .reverse {
    backface-visibility: hidden;
    transform: rotateY(180deg);
  }

  .viewer {
  }

  .fullscreen {
    position: absolute;
    top: 90px;
    right: 10px;
    height: 30px;
    width: 50px;
    color: white;
    opacity: 30%;
  }
`;

const CardPlaceholder = () => {
  const [lastX, setLastX] = useState(-1);
  const [lastY, setLastY] = useState(0);
  const [cssTransform, setCssTransform] = useState<CSSProperties>({});

  const handleTouchEvent = (e: TouchEvent) => {
    if (e.type === "touchend") {
      setLastX(-1);

      let res = 0;
      let y = Math.floor(lastY / 180);

      let min_val = lastY - y * 180;
      let max_val = (y + 1) * 180 - lastY;

      if (min_val < max_val) {
        res = y * 180;
      } else {
        res = (y + 1) * 180;
      }
      setLastY(res);
    } else if (lastX === -1) {
      setLastX(e.touches[0].clientX);
    } else {
      setLastY(lastY + e.touches[0].clientX - lastX);
      setLastX(e.touches[0].clientX);
    }
  };

  const flipCard = () => {
    setLastY(lastY + 180);
  };

  const goFullscreen = (e: SyntheticEvent) => {
    e.stopPropagation();

    var el = document.getElementById("player-video");

    if (el?.requestFullscreen) {
      el.requestFullscreen();
      // @ts-ignore
    } else if (el?.webkitRequestFullScreen) {
      // @ts-ignore
      el.webkitRequestFullScreen();
    }
    //@ts-ignore
    else if (el?.webkitSupportsFullscreen) {
      //@ts-ignore
      el.webkitEnterFullscreen();
    }
  };

  useEffect(() => {
    if (lastY % 360 === 0) {
      setCssTransform({
        transitionDelay: `100ms`,
        transform: `perspective(1000px) rotateY(${lastY}deg)`,
        transition: `transform 500ms ease-in-out`,
      });
    } else if (lastY % 180 === 0) {
      setCssTransform({
        transform: `perspective(1000px) rotateY(${lastY}deg)`,
        transition: `transform 300ms ease-in-out`,
      });
    } else {
      setCssTransform({
        transform: `perspective(1000px) rotateY(${lastY}deg)`,
      });
    }
  }, [lastY]);

  return (
    <Wrapper>
      <div className="viewer">
        <div
          className="card card-container"
          onTouchMove={handleTouchEvent}
          onTouchEnd={handleTouchEvent}
          onClick={flipCard}
          style={cssTransform}
        >
          <div className="card front">
            <div className="background">
              <div className="background-gradient">
                <div className="background-stripes"></div>
                <div className="background-name">
                  BOBBY
                  <br />
                  SMITH
                </div>
              </div>
              <div className="crop-background-img">
                <img className="background-img" src="/img/qb-removebg.png" />
              </div>
              <img className="verified-logo" src="/img/card-logo.svg" />
              <div className="background-gradient overlay-gradient"></div>

              <div className="athlete-name">Bobby Smith</div>
              <div className="basic-info">
                <div className="info-group">
                  <div className="info-heading">Year</div>
                  <div className="bold-info">'22</div>
                </div>
                <div className="info-group">
                  <div className="info-heading">Position</div>
                  <div className="bold-info">Quarterback</div>
                </div>
                <div className="info-group">
                  <div className="info-heading">Hometown</div>
                  <div className="bold-info">Highland Park, IL</div>
                </div>
                <div className="info-group">
                  <div className="info-heading">Sport</div>
                  <div className="bold-info">Football</div>
                </div>
              </div>
              <div className="signature"></div>
              <div className="serial-number">
                <div className="bold-info">1</div>/100
              </div>
            </div>
          </div>
          <div className="card reverse">
            <div className="background">
              <div className="background-gradient">
                <div className="background-gradient reverse-background-mask">
                  <video
                    className="background-video"
                    id="player-video"
                    src="https://linsky-planck.s3.amazonaws.com/hudson2.mp4"
                    playsInline
                    autoPlay
                    loop
                    muted
                  ></video>
                  <div className="reverse-logo-background"></div>
                  <img
                    className="reverse-verified-logo"
                    src="/img/card-logo.svg"
                    onClick={goFullscreen}
                  />
                  <div className="reverse-name-background"></div>
                  <div className="athlete-name reverse-athlete-name">
                    Bobby
                    <br />
                    Smith
                  </div>
                  <RiFullscreenLine
                    className="fullscreen"
                    onClick={goFullscreen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default CardPlaceholder;
