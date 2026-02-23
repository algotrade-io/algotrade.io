import { Typography, Table, Button, notification } from "antd";
import { useState, useEffect, useReducer } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
const { Title } = Typography;
import { getApiUrl, Toggle, getEnvironment, isEmpty } from "@/utils";
import { Pie } from '@ant-design/charts';
import useWebSocket from 'react-use-websocket';
import layoutStyles from "@/layouts/index.module.less";
import subStyles from "@/pages/subscription/index.module.less";
import tradeStyles from "./index.module.less";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { getHostname } from "@/utils/env";
import type { Holding, TradeMessage, TradeResult, TradeLoadingState, QueueState } from "./types";
import type { AuthUser } from "@/types";


const isLocal = getEnvironment() === "local";
let mockData: Holding[] = [];
if (isLocal) {
  mockData = (await import("@/pages/trade/fixtures")).default as Holding[];
}
const TradePage = () => {

  const { user: loggedIn } = useAuthenticator((context) => [context.user]);
  const [portfolio, setPortfolio] = useState<Holding[][]>([[], []]);
  const [loading, setLoading] = useState(true);
  const variantLabels = { DEF: "DEFAULT", VAR: "VARIANT" };
  const [tradeLoading, setTradeLoading] = useState<TradeLoadingState>({ [variantLabels.DEF]: new Set(), [variantLabels.VAR]: new Set() });
  const [toggle, setToggle] = useState(false);
  const [variant, setVariant] = useState(0);
  const [queue, setQueue] = useState<QueueState>({ [variantLabels.DEF]: new Set(), [variantLabels.VAR]: new Set() });
  const [direction, setDirection] = useState(false);
  const toggleLabels = { OPTIONS: "OPT", STOCKS: "STX" };
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const selector = variant ? variantLabels.VAR : variantLabels.DEF;

  // const [message, setMessage] = useState({});

  // instead of selling or buying when press sell or buy, add to queue
  // add Execute button that executes the queue
  // this fixes too many requests issue and websocket issue


  const format = (prefix = '', suffix = '', mult = 1, color = (_: number) => 'inherit', arrow = false) => {
    const FormatValue = (toRound: unknown): React.ReactNode => {
      const num = parseFloat(String(toRound)) * mult;
      return num ? (
        <>
          <span style={{ color: color(num) }}>{`${prefix}${num % 1 ? num.toFixed(2) : num}${suffix}`}</span>
          <span style={{ color: num >= 0 ? 'cyan' : 'magenta' }}>{arrow && (num >= 0 ? ' ▲' : ' ▼') || ''}</span>
        </>) : '';
    };
    FormatValue.displayName = 'FormatValue';
    return FormatValue;
  };

  // Helper type guard
  const isTradeResult = (val: unknown): val is TradeResult =>
    typeof val === 'object' && val !== null && 'direction' in val;

  const createColumn = ({ dataName = '', displayName = '', render = (s: unknown): React.ReactNode => String(s), sort = null as boolean | { defaultSortOrder?: string; sorter: { compare: (a: Holding, b: Holding) => number } } | null }) => (
    Object.assign({
      title: (displayName || dataName).toLowerCase().replace(/(^| )(\w)/g, (s: string) => s.toUpperCase()),
      dataIndex: dataName,
      key: dataName,
      align: 'center' as const,
      render
    }, sort && Object.assign({
      sorter: { compare: (a: Holding, b: Holding) => Number(a[dataName as keyof Holding]) - Number(b[dataName as keyof Holding]) }
    }, typeof sort === 'object' ? sort : {})));
  // can add route cache=random to end to force new connections?
  // and set share=false
  const socketUrl = `wss://api2.${getHostname(false)}`;
  const { sendJsonMessage: sendMessage, lastJsonMessage: message } = useWebSocket<TradeMessage>(socketUrl);

  useEffect(() => {
    if (!isEmpty(message)) {
      const { message: error } = message;
      if (error) {
        console.error(error);
        if (error === 'Internal server error') {
          notification.error({
            duration: 10,
            message: "Failure",
            description: `Failed to execute order.`,
          });
        }
        return;
      }
      Object.keys(message).forEach(symbol => {
        if (symbol === 'message') return; // Skip the error message key
        const result = message[symbol];
        if (!isTradeResult(result)) return;

        if (result.error) {
          notification.error({
            duration: 10,
            message: "Failure",
            description: `Failed to execute order for ${symbol}.`,
          });
        } else {
          const { direction } = result;
          notification.success({
            duration: 10,
            message: <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Success</span><span style={{ color: direction === 'credit' ? 'lime' : 'red', fontWeight: 'bold' }}>{direction === 'credit' ? '+' : '-'} ${(parseFloat(result.premium) * parseFloat(result.quantity)).toFixed(0)}</span></span>,
            description: `Executed order for ${symbol}!`,
          });
          setPortfolio(prev => {
            const updated = [...prev];
            updated[variant] = prev[variant].map(p =>
              p.symbol === symbol
                ? {
                  ...p,
                  open_contracts: p.open_contracts + (direction === 'credit' ? -1 : 1) * parseInt(result.quantity),
                  expiration: result.legs[0]?.expiration_date,
                  strike: parseFloat(result.legs[0]?.strike_price || '0'),
                  chance: 0.88
                }
                : p
            );
            return updated;
          });
          setTradeLoading(prev => {
            prev[selector].delete(symbol);
            return { ...prev };
          });
        }
      })
    }
  }, [message, selector, variant]);
  const handleQueue = (holding: Holding) => {
    const holdingDir = Boolean(holding.open_contracts);
    const queueIsEmpty = queue[selector].size === 0;
    if (queue[selector].has(holding.symbol)) {
      setQueue(prev => prev[selector].delete(holding.symbol) ? prev : prev);
    } else if (direction === holdingDir || queueIsEmpty) {
      setQueue(prev => prev[selector].add(holding.symbol) ? prev : prev);
    }
    setDirection(queueIsEmpty ? holdingDir : direction)
    forceUpdate();
    console.log('queue', queue);
  };
  const trade = async (symbols: Array<string>) => {
    // TODO: change direction name (overlap with response) and change to be dual (account for both variants)
    setTradeLoading(prev => {
      symbols.forEach((symbol: string) => prev[selector].add(symbol));
      return { ...prev };
    });
    const renderError = () => notification.error({
      duration: 10,
      message: "Failure",
      description: `Failed to execute order for [${symbols.join(', ')}].`,
    });
    const token = (loggedIn as AuthUser)?.signInUserSession?.idToken?.jwtToken;
    // const url = `${getApiUrl({ localOverride: "dev" })}/trade?variant=${Boolean(variant)}`;
    try {
      sendMessage({ token, type: direction ? 'BUY' : 'SELL', symbols: symbols, variant });
      // const response = await fetch(url, { method: "POST", headers: { Authorization: jwtToken }, body: JSON.stringify({ type: holding.open_contracts ? 'BUY' : 'SELL', symbols: [holding.symbol] }) });
      // const data = await response.json();
      // console.log('data', typeof data, data);
      // console.log('data keys', Object.keys(data));
      //   {
      //     "statusCode": 200,
      //     "headers": {
      //         "Access-Control-Allow-Origin": "*"
      //     }
      // }
      // buy result is putting statusCode body and headers all in body — fix in api

      // if ('error' in data[holding.symbol]) {
      //   renderError();
      // } else {
      //   // this is for sell req,
      //   // make for buy req too!
      //   notification.success({
      //     duration: 10,
      //     message: <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Success</span><span style={{ color: 'lime', fontWeight: 'bold' }}>+ ${parseFloat(data[holding.symbol].premium).toFixed(0)}</span></span>,
      //     description: `Executed order for ${holding.symbol}!`,
      //   });

      //   setPortfolio(prev => [
      //     ...(prev.slice(0, variant).length === 1 ? [prev.slice(0, variant)] : prev.slice(0, variant)),
      //     prev[variant].map(p =>
      //       p.symbol === holding.symbol ?
      //         ({
      //           ...p,
      //           ...{
      //             open_contracts: holding.open_contracts - parseInt(data[holding.symbol].quantity),
      //             expiration: data[holding.symbol].legs[0].expiration_date,
      //             strike: parseFloat(data[holding.symbol].legs[0].strike_price),
      //             chance: 0.88
      //           }
      //         }) : p
      //     ),
      //     ...(prev.slice(variant + 1).length === 1 ? [prev.slice(variant + 1)] : prev.slice(variant + 1))
      //   ])

    } catch (e) {
      console.error(e);
      renderError()
    }
    // setTradeLoading(prev => prev[selector].delete(holding.symbol) ? prev : prev);
  }

  const columns = toggle ? [
    createColumn({ dataName: 'symbol' }),
    createColumn({ dataName: 'quantity', render: format() }),
    createColumn({ dataName: 'price', render: format('$') }),
    createColumn({
      dataName: 'percent_change', displayName: 'Delta',
      render: format(
        '',
        '%',
        1,
        (num) => num >= 0 ? 'cyan' : 'magenta',
        true
      ),
      sort: true,
    }),
    createColumn({ dataName: 'percentage', render: format('', '%'), sort: true })
  ] : [
    createColumn({ dataName: 'symbol' }),
    createColumn({ dataName: 'open_contracts', displayName: 'Contracts', sort: { sorter: { compare: (a: Holding, b: Holding) => a.open_contracts - b.open_contracts } } }),
    createColumn({ dataName: 'strike', render: format('$') }),
    createColumn({ dataName: 'chance', render: format('', '%', 100, (num) => num >= 80 ? 'cyan' : 'magenta'), sort: true }),
    createColumn({
      dataName: 'expiration', sort: {
        defaultSortOrder: 'ascend', sorter: {
          compare: (a: Holding, b: Holding) => {
            const d1 = a.expiration ? Date.parse(a.expiration) : Date.now();
            const d2 = b.expiration ? Date.parse(b.expiration) : Date.now();
            return d1 - d2;
          }
        }
      }
    }),
    createColumn({
      displayName: 'Action', render: (val: unknown) => {
        const holding = val as Holding;
        return <Button
          className={queue[selector].has(holding.symbol) ? tradeStyles.selected : (holding.open_contracts ? layoutStyles.start : subStyles.subscribe)}
          onClick={() => handleQueue(holding)}
          loading={tradeLoading[selector].has(holding.symbol)}
          // disabled={tradeLoading[selector].has(holding.symbol)}
          disabled={Boolean(queue[selector].size && direction !== Boolean(holding.open_contracts))}
        >
          {holding.open_contracts ? <PlusOutlined /> : <MinusOutlined />}
        </Button>
      }
    })
    // add chart for premium income per week
    // include dividend income on chart — area chart
  ]

  useEffect(() => {
    if (loggedIn) {
      (async () => {
        setLoading(true);
        const jwtToken = (loggedIn as AuthUser)?.signInUserSession?.idToken?.jwtToken;
        const variants = [0, 1];
        try {
          const promises = variants.map(async v => {
            const url = `${getApiUrl({ localOverride: "dev" })}/trade?variant=${Boolean(v)}`;
            try {
              const response = await fetch(url, { method: "GET", headers: { Authorization: jwtToken || '' } });
              if (response.ok) {
                const data = await response.json();
                return data;
              } else if (isLocal) {
                return mockData;
              }
            } catch (_) {
              if (isLocal) {
                return mockData;
              }
            }
          })
          setPortfolio(await Promise.all(promises));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [loggedIn]);
  // // let sendJsonMessage: Function = () => { }, lastJsonMessage: Object;
  // const socketUrl = 'wss://api2.dev.forcepu.sh';
  // // if (loggedIn) {
  // //   (
  // const {
  //   sendJsonMessage,
  //   lastJsonMessage,
  //   // readyState,
  //   // getWebSocket,
  // } = useWebSocket(socketUrl, {
  //   // queryParams: { token: loggedIn?.signInUserSession?.idToken?.jwtToken },
  //   onOpen: () => console.log('opened'),
  //   onClose: () => console.log('closed'),
  //   // //Will attempt to reconnect on all close events, such as server shutting down
  //   // shouldReconnect: (closeEvent) => false,
  // }
  // )
  // // );
  // // }
  // useEffect(() => {
  //   if (loggedIn) {
  //     // fires twice
  //     sendJsonMessage({ token: loggedIn?.signInUserSession?.idToken?.jwtToken })
  //   }
  // }, [loggedIn])

  // useEffect(() => {
  //   if (lastJsonMessage) {
  //     console.log('lastJsonMessage', lastJsonMessage)
  //   }
  // }, [lastJsonMessage]);

  const data = portfolio[variant].map(holding => ({ type: holding.symbol, value: Math.round(Number(holding.percentage) * 100) / 100 }))

  const config = {
    appendPadding: 10,
    data,
    theme: 'dark' as const,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner' as const,
      offset: '-50%',
      content: (d: { type?: string }) => d.type ?? '',
      style: {
        textAlign: 'center' as const,
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false as const,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: 'STX',
      },
    },
  };
  // Use webhooks to get around 30s timeout
  // https://github.com/aws-samples/simple-websockets-chat-app


  // Goal:
  // number of options (should be done), date (should be done), strike price (should be done), chance of profit (should be done), sell (magenta) and roll (cyan) buttons
  // execute (magenta) button executes strategy for all assets
  // graph of covered call income over time
  // total + for the week, filter sum to include filled orders after start of day Mon
  // include dividend income on chart — area chart
  return (
    <>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Portfolio</Title>
        <span
          style={{ marginBottom: '19px', height: '100%', alignSelf: 'center' }}>
          <Button
            onClick={() => trade([...queue[selector]])}
            disabled={!queue[selector].size}
            className={subStyles.subscribe}
            loading={Boolean(tradeLoading[selector].size)}
          >
            <b>EXECUTE</b>
          </Button>
        </span>
      </span>
      <span style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Toggle
          val={!variant}
          options={[variantLabels.DEF, variantLabels.VAR]}
          defaultValue={variantLabels.DEF}
          onChange={(val: string) => setVariant(Number(val === variantLabels.VAR))}
        />
        <Toggle
          val={toggle}
          options={[toggleLabels.STOCKS, toggleLabels.OPTIONS]}
          defaultValue={toggleLabels.OPTIONS}
          onChange={(val: string) => setToggle(val === toggleLabels.STOCKS)}
        />
      </span>
      <Table loading={loading} dataSource={toggle ? portfolio[variant] : portfolio[variant].filter(holding => parseFloat(holding?.quantity) >= 100)} columns={columns} />
      {toggle && <Pie {...config} />}
      {toggle && <span>Loose Change: ${portfolio[variant].map(holding => holding?.loose ?? 0).reduce((x, y) => x + y, 0).toFixed(2)}</span>}
    </>
  );
};

TradePage.displayName = "Trade";

export default TradePage;
