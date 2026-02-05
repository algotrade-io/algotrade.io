import { Card, Typography, Row, Col, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { NFTE } from "@nfte/react";
import HoverVideoPlayer from "react-hover-video-player";

// try use-nft instead

import styles from "./index.module.less";

const { Title } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const nftWidth = 400;
const metadataWidth = nftWidth / 3;
const nftCard = (contract: string, token: string) => (
  <NFTE contract={contract} tokenId={token} darkMode={true}>
    {({ data, className, style, darkMode, autoPlay }) => {
      return (
        <Card
          title={data?.name}
          extra={<a href={data?.mediaPageUrl}>etherscan</a>}
          style={{ width: nftWidth + 48 }}
        >
          <HoverVideoPlayer
            videoSrc={data?.metadata?.animation_url}
            loadingOverlay={
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spin indicator={antIcon} />
              </div>
            }
          />
          <div style={{ paddingTop: 18 }}>{data?.description}</div>
          <div
            style={{
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 16,
            }}
          >
            <span style={{ width: metadataWidth }}>owned by</span>
            <span style={{ width: metadataWidth }}>token id</span>
            <span style={{ width: metadataWidth }}>minted on</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ width: metadataWidth }}>
              vape<span style={{ color: "#52e5ff" }}>m.eth</span>
            </span>
            <span style={{ width: metadataWidth }}>{data?.tokenId}</span>
            <span style={{ width: metadataWidth }}>
              {data?.timestamp &&
                new Date(Number(data?.timestamp) * 1000).toISOString()}
            </span>
          </div>
        </Card>
      );
    }}
  </NFTE>
);

const ArtPage = () => {
  const nfts = [
    [
      {
        contract: "0x86b3448919dcb802c96759f85b532dfe34990e64",
        token: "49700010004",
      },
      {
        contract: "0x3e34556b7d6a6c79320168140e14c10d7a1febb7",
        token: "100010492",
      },
    ],
    [
      {
        contract: "0xc0cf5b82ae2352303b2ea02c3be88e23f2594171",
        token: "22700084881",
      },
      {
        contract: "0x4398b03f65d32505557d8719936d3a190c40df6c",
        token: "40200010012",
      },
    ],
    [
      {
        contract: "0xdad9dc2d497fbf0d27837700c0a7ba6b8c8f2b30",
        token: "49100040011",
      },
      {
        contract: "0xc92ca2b5b8a996ad2a6fdd97c6d7ed038e61c725",
        token: "14500012231",
      },
    ],
  ];

  return (
    <>
      <Title>Gallery</Title>
      {nfts.map((nft) => (
        <Row>
          <Col flex={1}>
            <div className={styles.cardLeft}>
              {nftCard(nft[0].contract, nft[0].token)}
            </div>
          </Col>
          <Col flex={1}>
            <div className={styles.cardRight}>
              {nftCard(nft[1].contract, nft[1].token)}
            </div>
          </Col>
        </Row>
      ))}
    </>
  );
};

ArtPage.displayName = "Art";

export default ArtPage;
