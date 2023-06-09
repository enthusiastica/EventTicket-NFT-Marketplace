import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styled from "styled-components";
import { QRCode } from 'react-qrcode-logo';

const Wrapper = styled.div`
  // background: white !important;
  background: #c0c0c0 !important;
  margin: 0px !important;
  // padding: 40px !important;
  position: relative;
  width: 1900px;
  height: 3133px;

  #react-qrcode-logo {
    position: relative;
    top: 1383px;
    left: 653px;
    opacity: 0.75;
    backdrop-filter: blur(12px) brightness(0.85);
  }

  .target {
    position: absolute;
    width: 1900px;
  }

  .text{
    position: relative;
    top: 590px;
    left: 240px;
    opacity: 0;
  }
  .id{
    position: absolute;
    top: 2000px;
    left: 868px;
    opacity: 0.7;
    transform-origin: top left;
    font-size: 50px;
    // transform: rotate(-40deg);
    // backdrop-filter: blur(12px);
    
  }


`;

const Screenshot: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("no-background");

    return () => {
      document.body.classList.remove("no-background");
    };
  }, []);
  const router = useRouter();
  const { id, back } = router.query;



  return (

    <Wrapper id="card">
      <img className="target" src={back ? '/ar/source/target-back.png' : '/ar/source/target-front.png'}></img>
      {back ? null :
        <QRCode size={600} bgColor="transparent" fgColor="white" value={`https://verifiedink.us/ar?ar_id=${id}`} qrStyle="dots" />
      }
      <text className="text">Scan Me</text>
      {back ? null : <text className="id">No. {id}</text>}
            
    </Wrapper>
  );
};

export default Screenshot;
