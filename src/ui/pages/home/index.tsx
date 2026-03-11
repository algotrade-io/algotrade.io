import React, { memo, useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Table,
  Alert,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Modal,
  Skeleton,
  notification,
} from "antd";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import type { Data, Layout, Config } from "plotly.js";
const Plot = createPlotlyComponent(Plotly);
import {
  LoadingOutlined,
  CaretDownFilled,
  CaretUpFilled,
  QuestionOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";
import subStyles from "@/pages/subscription/index.module.less";
import "./index.module.less";
import {
  getApiUrl,
  getLoginLoading,
  getDateRange,
  addDays,
  signalColors,
  signalEmojis,
  Toggle,
  colors,
} from "@/utils";
import type { PreviewDataPoint } from "@/types";
import { useAuthenticator } from "@aws-amplify/ui-react";
const { Title } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
import { useAccount } from "@/contexts";

const toggleLabels = { BTC: "₿", USD: "$" };

const HODL = "HODL";
const hyperdrive = "hyperdrive";
const formatBTC = (v: number | string) => `${Math.round(Number(v) * 10) / 10} ₿`;
const formatUSD = (v: number | string) => {
  const num = Number(v);
  if (num < 1e3) {
    return `$ ${num}`;
  } else if (num < 1e6) {
    return `$ ${num / 1e3}k`;
  }
  return `$ ${num / 1e6}M`;
};

// Color constants moved outside component to avoid recreation
const ribbonColors: Record<string, string> = {
  Sun: "red",
  Mon: "yellow",
  Tue: "blue",
  Wed: "pink",
  Thu: "green",
  Fri: "cyan",
  Sat: "orange",
};
const cardHeaderColors: Record<string, string> = {
  Sun: "#D32029",
  Mon: "#D8BD14",
  Tue: "#177DDC",
  Wed: "#CB2B83",
  Thu: "#49AA19",
  Fri: "#13A8A8",
  Sat: "#D87A16",
};

// Type definitions
interface LineChartProps {
  data: PreviewDataPoint[];
  formatFx: (value: number | string) => string;
}

// Plotly-based chart with native marker support for BUY/SELL signals
const LineChart: React.FC<LineChartProps> = memo(
  function LineChart({ data, formatFx }) {
    // Separate data by series
    const hodlData = data.filter((d) => d.Name === HODL);
    const hyperdriveData = data.filter((d) => d.Name === hyperdrive);

    // Extract signal points (BUY and SELL)
    const buySignals = hyperdriveData.filter((d) => d.Sig === true);
    const sellSignals = hyperdriveData.filter((d) => d.Sig === false && d.Sig !== null);

    const traces: Data[] = [
      // HODL line
      {
        x: hodlData.map((d) => d.Time),
        y: hodlData.map((d) => d.Bal),
        type: "scatter",
        mode: "lines",
        name: HODL,
        line: { color: "magenta", width: 2, shape: "spline" },
        fill: "tozeroy",
        fillcolor: "rgba(255, 0, 255, 0.1)",
        hovertemplate: `<b>${HODL}</b><br>%{x}<br>%{y:,.2f}<extra></extra>`,
      },
      // Hyperdrive line
      {
        x: hyperdriveData.map((d) => d.Time),
        y: hyperdriveData.map((d) => d.Bal),
        type: "scatter",
        mode: "lines",
        name: hyperdrive,
        line: { color: colors.accentCyan, width: 2, shape: "spline" },
        fill: "tozeroy",
        fillcolor: "rgba(82, 229, 255, 0.1)",
        hovertemplate: `<b>${hyperdrive}</b><br>%{x}<br>%{y:,.2f}<extra></extra>`,
      },
      // BUY signals (triangle-up markers)
      {
        x: buySignals.map((d) => d.Time),
        y: buySignals.map((d) => d.Bal),
        type: "scatter",
        mode: "markers",
        name: "BUY",
        marker: {
          symbol: "triangle-up",
          size: 12,
          color: "lime",
          line: { color: "darkgreen", width: 1 },
        },
        hovertemplate: "<b>▲ BUY</b><br>%{x}<br>%{y:,.2f}<extra></extra>",
      },
      // SELL signals (triangle-down markers)
      {
        x: sellSignals.map((d) => d.Time),
        y: sellSignals.map((d) => d.Bal),
        type: "scatter",
        mode: "markers",
        name: "SELL",
        marker: {
          symbol: "triangle-down",
          size: 12,
          color: "red",
          line: { color: "darkred", width: 1 },
        },
        hovertemplate: "<b>▼ SELL</b><br>%{x}<br>%{y:,.2f}<extra></extra>",
      },
    ];

    const layout: Partial<Layout> = {
      autosize: true,
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: { color: "rgba(255, 255, 255, 0.85)" },
      margin: { l: 60, r: 20, t: 40, b: 40 },
      legend: {
        orientation: "h",
        x: 1,
        xanchor: "right",
        y: 1.15,
        bgcolor: "transparent",
      },
      xaxis: {
        showgrid: false,
        tickformat: "%b %Y",
        tickfont: { size: 10 },
      },
      yaxis: {
        showgrid: false,
        tickformat: formatFx === formatBTC ? ",.1f" : ",.0f",
        tickprefix: formatFx === formatUSD ? "$ " : "",
        ticksuffix: formatFx === formatBTC ? " ₿" : "",
        tickfont: { size: 10 },
      },
      hovermode: "x unified",
      hoverlabel: {
        bgcolor: "rgba(45, 45, 45, 0.95)",
        bordercolor: "rgba(255, 255, 255, 0.2)",
        font: { color: "rgba(255, 255, 255, 0.85)" },
      },
    };

    const config: Partial<Config> = {
      displayModeBar: false,
      responsive: true,
    };

    return (
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    );
  },
  (pre, next) => JSON.stringify(pre?.data) === JSON.stringify(next?.data)
);

const Page = () => {
  const { account, accountLoading } = useAccount();

  const caretIconSize = 50;
  const { user: loggedIn } = useAuthenticator((context) => [context.user]);
  const [previewData, setPreviewData] = useState({
    BTC: { data: [], stats: [] },
    USD: { data: [], stats: [] },
  });
  const numDaysInAWeek = 7;
  const signalDates = getDateRange(
    addDays(new Date(), -numDaysInAWeek),
    numDaysInAWeek - 1
  );
  const defaultSignals = signalDates.map((date) => ({
    Date: !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '',
    Day: !isNaN(date.getTime()) ? date.toUTCString().slice(0, 3) : '',
    Signal: "?",
    Asset: "BTC",
  }));
  const [signalData, setSignalData] = useState(defaultSignals);
  const [toggle, setToggle] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [signalLoading, setSignalLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showSignalCard, setShowSignalCard] = useState(false);
  const [signalCardData, setSignalCardData] = useState(defaultSignals[0]);
  const [haveNewSignal, setHaveNewSignal] = useState(false);
  const [quotaReached, setQuotaReached] = useState(false);
  const loading = previewLoading || accountLoading || loginLoading;
  const inBeta = loggedIn && (account?.in_beta || account?.subscribed);

  useEffect(() => {
    // find a way to not load this for in_beta
    // simple if !inBeta or checking accountLoading and loginLoading doesn't work
    const url = `${getApiUrl({ localOverride: "prod" })}/preview`;
    fetch(url, { method: "GET" })
      .then((response) => response.json())
      .then((data) => setPreviewData(data))
      .catch((err) => console.error(err))
      .finally(() => setPreviewLoading(false));
  }, []);

  // useEffect(getAccount(loggedIn, setAccount, setAccountLoading), [loggedIn]);
  useEffect(() => {
    getLoginLoading(setLoginLoading)();
  }, []);

  const fetchSignals = () => {
    setSignalLoading(true);
    const url = `${getApiUrl()}/signals`;
    const headers: HeadersInit = {};
    if (account?.api_key) {
      headers["X-API-Key"] = account.api_key;
    }
    fetch(url, { method: "GET", headers })
      .then((response) => response.json())
      .then((data) => {
        if (!("data" in data)) {
          const { message } = data;
          const pattern = /^(.[^\d]*)(.*)$/;
          const match = message.match(pattern);
          setQuotaReached(true);
          notification.error({
            duration: 10,
            message: "Quota Reached",
            description: (
              <>
                <div>{match[1]}</div>
                <div>{match[2]}</div>
              </>
            ),
          });
          setTimeout(() => {
            setQuotaReached(false);
          }, 10000);
          throw new Error(message);
        }
        return data;
      })
      .then((response) => {
        const { message, data } = response;
        notification.warning({
          duration: 10,
          message: "Quota",
          description: message,
        });
        setSignalData(data);
      })
      .then(() => setHaveNewSignal(true))
      .catch((err) => console.error(err))
      .finally(() => setSignalLoading(false));
  };

  // Memoize columns to prevent recreation on each render
  // Empty dependency array is intentional since HODL and hyperdrive are module-level constants
  const columns = useMemo(() => [
    { title: "Metric", dataIndex: "metric", key: "metric" },
    {
      title: <span style={{ color: colors.hodlMagenta }}>{HODL}</span>,
      dataIndex: HODL,
      key: HODL,
    },
    {
      title: <i style={{ color: colors.accentCyan }}>{hyperdrive}</i>,
      dataIndex: hyperdrive,
      key: hyperdrive,
    },
  ], []);

  const betaTitlePrefix = "New Signal:";
  // Memoize betaTitle to avoid recreation on every render
  const betaTitle = useMemo(() => (
    <div className={styles.content}>
      <div className={styles.betaContainer}>
        <div className={styles.text}>{betaTitlePrefix}</div>
        <div className={styles.list}>
          <div>
            <span style={{ fontSize: "30px" }}>
              <span
                style={{
                  color: haveNewSignal
                    ? signalColors[signalData[signalData.length - 1].Signal]
                    : "lime",
                }}
                className={styles.betaItem}
              >
                &nbsp;
                {haveNewSignal
                  ? signalData[signalData.length - 1].Signal
                  : "BUY"}
              </span>
              {haveNewSignal && (
                <>
                  {signalData[signalData.length - 1].Signal === "BUY" && (
                    <span>&nbsp;</span>
                  )}
                  <span>
                    &nbsp;
                    {signalEmojis[signalData[signalData.length - 1].Signal]}
                  </span>
                </>
              )}
              {!haveNewSignal && <span>&nbsp;&nbsp;&nbsp;?</span>}
            </span>
          </div>
          <div>
            <span style={{ opacity: 0 }}>{betaTitlePrefix}</span>
            <span style={{ fontSize: "30px" }}>
              <span
                style={{
                  color: haveNewSignal
                    ? signalColors[signalData[signalData.length - 1].Signal]
                    : "#F7931A",
                }}
                className={styles.betaItem}
              >
                &nbsp;
                {haveNewSignal
                  ? signalData[signalData.length - 1].Signal
                  : "HODL"}
              </span>
              {haveNewSignal && (
                <>
                  {signalData[signalData.length - 1].Signal === "BUY" && (
                    <span>&nbsp;</span>
                  )}
                  <span>
                    &nbsp;
                    {signalEmojis[signalData[signalData.length - 1].Signal]}
                  </span>
                </>
              )}
              {!haveNewSignal && <span>&nbsp;?</span>}
            </span>
          </div>
          <div>
            <span style={{ opacity: 0 }}>{betaTitlePrefix}</span>
            <span style={{ fontSize: "30px" }}>
              <span
                style={{
                  color: haveNewSignal
                    ? signalColors[signalData[signalData.length - 1].Signal]
                    : "red",
                }}
                className={styles.betaItem}
              >
                &nbsp;
                {haveNewSignal
                  ? signalData[signalData.length - 1].Signal
                  : "SELL"}
              </span>
              {haveNewSignal && (
                <>
                  {signalData[signalData.length - 1].Signal === "BUY" && (
                    <span>&nbsp;</span>
                  )}
                  <span>
                    &nbsp;
                    {signalEmojis[signalData[signalData.length - 1].Signal]}
                  </span>
                </>
              )}
              {!haveNewSignal && <span>&nbsp;?</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  ), [haveNewSignal, signalData]);

  return (
    <>
      {loggedIn && account && (
        <Alert
          message={
            inBeta
              ? "Congrats! You've been selected for the closed beta. 🎊"
              : "You are not in the closed beta, but you may receive an invitation in the future. 📧"
          }
          type={inBeta ? "success" : "warning"}
          showIcon
          closable
          style={{ marginBottom: "12px" }}
        />
      )}
      {!loading && (
        <>
          <Title>
            {inBeta ? (
              <div className={styles.parent}>
                <div className={styles.child} style={{ marginBottom: "10px" }}>
                  {betaTitle}
                </div>
                <div
                  className={styles.child}
                  style={{
                    marginBottom: "0px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "45px",
                  }}
                >
                  {
                    <Button
                      disabled={quotaReached}
                      loading={signalLoading}
                      className={`${subStyles.subscribe} ${styles.signals} ${quotaReached && styles.disabled
                        }`}
                      onClick={fetchSignals}
                    >
                      Fetch the latest signals
                    </Button>
                  }
                </div>
              </div>
            ) : (
              "Leveraging AutoML to beat BTC"
            )}
            {/* if consecutive buy, then label BUY/HODL with green/orange diagonal split */}
            {/* same if consecutive sell, then label SELL/HODL with red/orange diagonal split */}
            {/* on the right of latest signal title or  below latest signals title but above squares row*/}
            {/* #0C2226 background color of chart — cyan*/}
            {/* #2C2246 background color of chart — magenta*/}
          </Title>
          <span
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "-12px 0px 12px 0px",
            }}
          >
            {!inBeta && (
              <>
                <Title level={5}>
                  a momentum trading strategy using{" "}
                  <a href="https://github.com/suchak1/hyperdrive">
                    <i style={{ color: colors.accentCyan }}>{hyperdrive}</i>
                  </a>
                </Title>
                <Toggle
                  var={'home'}
                  val={toggle}
                  options={[toggleLabels.BTC, toggleLabels.USD]}
                  defaultValue={toggleLabels.BTC}
                  onChange={(val: string) => setToggle(val === toggleLabels.BTC)}
                />
              </>
            )}
          </span>
        </>
      )}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin indicator={antIcon} />
        </div>
      ) : (
        <div className={`${styles.parent} ${styles.fullHeight}`}>
          {!inBeta && !loading && (
            <div className={`${styles.child} ${styles.chartMobile}`}>
              <LineChart
                data={toggle ? previewData.BTC.data : previewData.USD.data}
                formatFx={toggle ? formatBTC : formatUSD}
              />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center' }} className={styles.child}>
            {inBeta ? (
              <>
                <Modal
                  open={showSignalCard}
                  closable={false}
                  onCancel={() => setShowSignalCard(false)}
                  centered
                  footer={null}
                  zIndex={2000}
                ><Card
                  headStyle={{
                    background: cardHeaderColors[signalCardData.Day],
                  }}
                  title={signalCardData.Day.toUpperCase()}
                >
                    <div>
                      <span>
                        <b>{"Signal: "}</b>
                      </span>
                      <span
                        style={{
                          fontFamily: '"Courier","Courier New",monospace',
                          color:
                            signalCardData.Signal === "BUY"
                              ? "lime"
                              : signalCardData.Signal === "SELL"
                                ? "red"
                                : "inherit",
                        }}
                      >
                        {signalCardData.Signal}
                      </span>
                    </div>
                    <div>
                      <span>
                        <b>{"Date: "}</b>
                      </span>
                      <span style={{ fontFamily: '"Courier","Courier New",monospace' }}>
                        {signalCardData.Date}
                      </span>
                    </div>
                    <div>
                      <span>
                        <b>{"Asset: "}</b>
                      </span>
                      <span style={{ fontFamily: '"Courier","Courier New",monospace' }}>
                        {"BTC ("}
                        <span style={{ color: "#F7931A" }}>{"₿"}</span>
                        {")"}
                      </span>
                    </div>
                  </Card>
                </Modal>
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    // marginBottom: "36px",
                  }}
                >
                  <Row style={{ width: "100%" }}>
                    {signalData.map((datum, idx) => (
                      <Col key={idx} flex={1} className={styles.ribbonCol}>
                        <Badge.Ribbon
                          color={ribbonColors[datum.Day]}
                          text={<b>{datum.Day.toUpperCase()}</b>}
                        >
                          <Card
                            hoverable
                            onClick={() => {
                              setSignalCardData(datum);
                              setShowSignalCard(true);
                            }}
                            bodyStyle={{
                              display: "flex",
                              justifyContent: "center",
                              height: "100%",
                              alignItems: "center",
                            }}
                          >
                            {signalLoading && (
                              <Skeleton
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                loading
                                active
                              />
                            )}
                            {!signalLoading &&
                              (datum.Signal === "BUY" ? (
                                <CaretUpFilled
                                  style={{
                                    fontSize: `${caretIconSize}px`,
                                    color: "lime",
                                    marginBottom: `${caretIconSize / 2}px`,
                                  }}
                                />
                              ) : datum.Signal === "SELL" ? (
                                <CaretDownFilled
                                  style={{
                                    fontSize: `${caretIconSize}px`,
                                    color: "red",
                                    marginTop: `${caretIconSize / 2}px`,
                                  }}
                                />
                              ) : (
                                <QuestionOutlined
                                  style={{ fontSize: `${caretIconSize}px` }}
                                />
                              ))}
                          </Card>
                        </Badge.Ribbon>
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ) : (
              !loading && (
                <Table
                  style={{ width: '100%' }}
                  dataSource={
                    toggle ? previewData.BTC.stats : previewData.USD.stats
                  }
                  columns={columns}
                  pagination={false}
                  loading={loading}
                />
              )
            )}
          </div>
        </div>
      )}
    </>
    // automated portfolio management
    // using momentum based strategy

    // use this example: https://g2plot.antv.vision/en/examples/line/multiple#line-area
    // multiline chart w area obj and animation obj
    // ant design charts is react wrapper of g2plot

    // use simulated data from model
    // need to make oracle class in hyperdrive
    // and write declassified script that updates predictions.csv in models/latest each night
    // does it need latest data? then make sure api key is hidden in declassified file

    // OR EASIER:
    // have lambda predict using pickled data and combine w signals.csv (consistent simulation)

    // best soln so far:
    // hyperdrive: test predictions.csv using pca5 branch / create model workflow dispatch
    // backend: make api endpoint that combines predictions.csv with signals.csv and returns
    // backend: make endpoint that returns btc close data (including most recent close — little hard) / might use alt source
    // frontend: make js fx that calculates acct balance given close array and signals array
  );
};

Page.displayName = "Page";

export default Page;
