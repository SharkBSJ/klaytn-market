import { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faWallet, faPlus } from '@fortawesome/free-solid-svg-icons';
import { fetchCardsOf, getBalance } from './api/UseCaver';
import * as KlipAPI from './api/UseKlip';
import 'bootstrap/dist/css/bootstrap.min.css';
import './market.css';
import './App.css';
import { Alert, Card, Container, Form, Nav, Button, Modal, Row, Col } from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from "./constants";

// GitHub로부터 Clone 
const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = '0x000000000000000000000000'
function App() {
  // NFT
  const [nfts, setNfts] = useState([]); // {id, uri}
  const [myBalance, setMyBalance] = useState('0');
  const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS);
  const rows = nfts.slice(nfts.length / 2);

  // UI
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);
  const [tab, setTab] = useState('MARKET'); // MARKEY, MINT, WALLET
  const [mintImgUri, setMintImgUri] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "MODAL", 
    onConfirm: () => {}
  });

  const fetchMarketNfts = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  }

  const fetchMyNfts = async () => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert('NO ADDRESS!');  
      return;
    }

    const _nfts = await fetchCardsOf(myAddress);
    setNfts(_nfts);
  }

  const getUserData = () => {
    setModalProps({
      title: 'Klip 지갑을 연동하시겠습니까?',
      onConfirm: () => {
        KlipAPI.getAddress(setQrvalue, async (address) => {
          setMyAddress(address);
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      }
    })
    setShowModal(true);
  }

  const onClickMint = async (uri) => {
    console.log(`[onClickMint]`)
    if (myAddress === DEFAULT_ADDRESS) {
      alert('NO ADDRESS!');  
      return;
    }
    const randomTokenId = parseInt(Math.random() * 10000000);
    console.log(`[onClickMint] randomTokenId : ${randomTokenId}`)
    KlipAPI.mintCardWithURI(myAddress, randomTokenId, uri, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }

  const onClickCard = (id) => {
    console.log(`[onClickCard]`)
    if (tab === 'WALLET') {
      setModalProps({
        title: 'NFT를 마켓에 올리시겠어요?',
        onConfirm: () => {
          onClickMyCard(id);
        }
      })
      setShowModal(true);
    } else {
      setModalProps({
        title: 'NFT를 구매하시겠어요?',
        onConfirm: () => {
          onClickMarketCard(id);
        }
      })
      setShowModal(true);
    }
  }

  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }

  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }

  useEffect(() => {
    getUserData();
    fetchMarketNfts();
  }, []);
  return (
    <div className="App"> 
      {/* 주소 잔고 */}
      <div style={{ backgroundColor: "black", padding: 10 }}>
        <div
          style={{ fontWeight: "bold", paddingLeft: 5, marginTop: 10, fontSize: 30 }}
        >내 지갑</div>
        {myAddress}
        <br />
        <Alert
          onClick={getUserData}
          variant={"balance"}
          style={{ backgroundColor: "pink", fontSize: 25 }} >
            {myAddress !== DEFAULT_ADDRESS
              ? `${myBalance} KLAY`
              : '지갑 연동하기'}
        </Alert>
        
        {qrvalue !== DEFAULT_QR_CODE 
          ? (<Container style={{ backgroundColor: "white", width: 300, height: 300, padding: 20 }}>
              <QRCode value={qrvalue} size={256} style={{ margin: "auto" }}/>
            </Container>) : null}

        <br />

        {/* 갤러리(마켓, 내 지갑) */}
        {tab === "MARKET" || tab === "WALLET" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row>
                <Col style={{ marginRight: 0, paddingRight: 0}}>
                  <Card
                    onClick={() => {
                      onClickCard(nfts[rowIndex * 2].id);
                    }}>
                    <Card.Img src={nfts[rowIndex * 2].uri} />
                  </Card>
                  [{nfts[rowIndex * 2].id}NFT]
                </Col>
                <Col style={{ marginRight: 0, paddingRight: 0}}>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card
                      onClick={() => {
                        onClickCard(nfts[rowIndex * 2 + 1].id);
                      }}>
                      <Card.Img src={nfts[rowIndex * 2 + 1].uri} />
                    </Card>
                  ) : null}
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <>[{nfts[rowIndex * 2 + 1].id}]NFT</>
                  ) : null}
                </Col>
              </Row>))}
          </div>) : null}

        {/* 발행 페이지 */}
        {tab === "MINT" ? (
          <div
            className = 'container'
            style={{padding: 0, width: "100%"}}
          >
            <Card 
              className = 'text-center'
              style={{color: 'black', borderColor: 'pink', height: "50%"}}
            >
              <Card.Body style={{opacity: 0.9, backgroundColor: "black"}}>
                {mintImgUri !== "" ? (
                  <Card.Img src={mintImgUri} height={"50%"} />
                ) : null}
                <Form>
                  <Form.Group>
                    <Form.Control 
                      value = {mintImgUri}
                      onChange={(e) => {
                        setMintImgUri(e.target.value);
                        console.log(`[onChange] ${e.target.value}`)
                      }}
                      type="test"
                      placeholder='이미지 주소를 입력하세요.'
                    />
                  </Form.Group>
                  <br />
                  <Button
                    onClick={() => {onClickMint(mintImgUri);}}
                    variant='primary'
                    style={{
                      backgroundColor: 'pink', 
                      borderColor: 'pink'
                    }}
                  >발행하기</Button>
                </Form>
              </Card.Body>
            </Card>
          </div>) : null}
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />

      {/* 모달 */}
      <Modal 
        centered
        size="sm"
        show={showModal}
        onHid={() => {
          setShowModal(false);
        }}>
        <Modal.Header style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}>
          <Modal.Title>{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Footer
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        ></Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            setShowModal(false);
          }}
        >
          닫기
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            modalProps.onConfirm();
            setShowModal(false);
          }}
          style={{ backgroundColor: "pink", borderColor: "pink" }}
        >
          진행
        </Button>
      </Modal>
      
      {/* 탭 */}
      <nav 
        style={{ background: 'pink', height: 45}}
        className="navbar fixed-bottom navbar-light"
        role="navigation"
        >
          <Nav className="w-100">
            <div className="d-flex flex-row justify-content-around w-100">
              <div
                onClick={() => {
                  setTab("MARKET");
                  fetchMarketNfts();
                }}
                className="row d-flex flex-column justify-content-center align-items-center"
              >
                <div><FontAwesomeIcon color="white" size="1g" icon={faHome} /></div>
              </div>
              <div
                onClick={() => {
                  setTab("MINT");
                }}
                className="row d-flex flex-column justify-content-center align-items-center"
              >
                <div><FontAwesomeIcon color="white" size="1g" icon={faPlus} /></div>
              </div>
              <div
                onClick={() => {
                  setTab("WALLET");
                  fetchMyNfts();
                }}
                className="row d-flex flex-column justify-content-center align-items-center"
              >
                <div><FontAwesomeIcon color="white" size="1g" icon={faWallet} /></div>
              </div>
            </div>
          </Nav>
      </nav> 
    </div>
  );
}

export default App;
