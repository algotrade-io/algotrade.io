import React from "react";
import { useState, useEffect, useContext } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Typography, Tooltip, Badge, Card, Button, Spin, Alert } from "antd";
import { getApiUrl, getDayDiff } from "@/utils";
import pageStyles from "@/pages/home/index.module.less";
import layoutStyles from "@/layouts/index.module.less";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuthenticator } from "@aws-amplify/ui-react";
import styled from "styled-components";
import { AccountContext } from "../../layouts";
import CUBE from "@/assets/cube.gif";

import overrides from "./index.module.less";

const { Title } = Typography;



const List = styled.ul`
  li::marker {
    content: '✓ ';
    color: lime;
  }
`;

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const spinner = <Spin style={{ width: "100%" }} indicator={antIcon} />;

const SubscriptionPage = () => {
  const { user: loggedIn } = useAuthenticator((context) => [context.user]);
  const { account, accountLoading, loginLoading, setShowLogin } = useContext(
    AccountContext
  ) as { account: any; accountLoading: boolean; loginLoading: boolean; setShowLogin: (show: boolean) => void };
  const loading = loginLoading || accountLoading;
  const [minInvestment, setMinInvestment] = useState<string>();
  const [price, setPrice] = useState<any>();
  const [priceLoading, setPriceLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const showSuccessAlert = searchParams.get('success')?.toLowerCase() === 'true';
  const subStatus = account?.subscribed;
  const subIsActive = subStatus || showSuccessAlert;

  // const checkoutSessionId = searchParams.get('session_id')

  const onCheckout = () => {
    if (!loggedIn) {
      setShowLogin(true);
      return;
    }
    setCheckoutLoading(true);
    const jwtToken = (loggedIn as any)?.signInUserSession?.idToken?.jwtToken;
    const url = `${getApiUrl()}/checkout`;
    fetch(url, {
      method: "POST",
      headers: { Authorization: jwtToken },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch checkout page.');
        }
        return response.json();
      })
      .then((data) => window.location.href = data)
      .catch((err) => console.error(err))
      .finally(() => setCheckoutLoading(false));
  };

  const onBilling = () => {
    setBillingLoading(true);
    const jwtToken = (loggedIn as any)?.signInUserSession?.idToken?.jwtToken;
    const url = `${getApiUrl()}/billing`;
    fetch(url, {
      method: "POST",
      headers: { Authorization: jwtToken },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch billing page.');
        }
        return response.json();
      })
      .then((data) => window.location.href = data)
      .catch((err) => console.error(err))
      .finally(() => setBillingLoading(false));
  };

  let subscribeButton =
    <Button
      style={{ width: '100%' }}
      onClick={subIsActive ? onBilling : onCheckout}
      loading={checkoutLoading || billingLoading}
      disabled={loggedIn && !account}
      className={subIsActive ? layoutStyles.start : overrides.subscribe}>{subIsActive ? "Manage subscription" : "Subscribe"}
    </Button>;
  if (loggedIn && !account) {
    subscribeButton = <Tooltip
      trigger={["hover", "focus"]}
      title="Verify your email address."
      placement="bottom"
    >
      {subscribeButton}
    </Tooltip>
  }

  useEffect(() => {
    const url = `${getApiUrl({ localOverride: "dev" })}/plans`;
    fetch(url, { method: "GET" })
      .then((response) => response.json())
      .then((data) => setPrice(data))
      .catch((err) => console.error(err))
      .finally(() => setPriceLoading(false));
  }, []);

  useEffect(() => {
    if (!priceLoading) {
      const url = `${getApiUrl({ localOverride: "prod" })}/preview`;
      fetch(url, { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
          const previewBTC = data.BTC.data;
          const previewUSD = data.USD.data;
          let lastUSD = previewUSD.slice(previewUSD.length - 2);
          lastUSD = lastUSD[0].Name === "HODL" ? lastUSD[0] : lastUSD[1];
          const btcPrice = lastUSD.Bal;
          let first = previewBTC.slice(0, 2);
          first = first[0].Name === "hyperdrive" ? first[0] : first[1];
          const start = first.Time;
          let last = previewBTC.slice(previewBTC.length - 2);
          last = last[0].Name === "hyperdrive" ? last[0] : last[1];
          const end = last.Time;
          const days = getDayDiff(start, end);
          const totalBTCRate = last.Bal - 1;
          const monthlyBTCRate = (totalBTCRate / days) * 30;
          // this should be tied to val in backend / maybe make endpoint that returns backend constant
          const monthlySubUSD = price?.unit_amount / 100;
          const monthlySubBTC = monthlySubUSD / btcPrice;
          // principal * monthly rate >= monthlysubrate
          const minBTCInvestment = (monthlySubBTC / monthlyBTCRate).toPrecision(
            2
          );
          setMinInvestment(minBTCInvestment);
        })
        .catch((err) => console.error(err));
    }
  }, [price, priceLoading]);


  let subscriptionCard = <Card style={
    {
      maxWidth: '400px'
    }
  }>
    {/* eventually $100/month, $85/month for 6 or 12 month subscription */}
    <div style={
      {
        display: 'flex',
        height: '300px',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <img height="50px" src={CUBE}></img>
          <Title style={{ marginBottom: 0, marginLeft: '16px' }} level={3}>{'Signals API'}</Title>
        </span>
        <Title style={{ marginBottom: 0 }} level={3}>
          {/* <> */}
          <div>{`$${Number(price?.unit_amount / 100).toFixed(2)} `}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.45', fontSize: '16px' }}>{`/ ${price?.recurring?.interval_count > 1 ? `${price?.recurring?.interval_count} ` : ''}${price?.recurring?.interval}${price?.recurring?.interval_count > 1 ? 's' : ''}`}</div>
          {/* </> */}
        </Title>
      </span>
      {/* should be level 3-5 */}
      <List style={
        {
          height: '40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }
      }>
        <li>{"access to the "}<span style={{ fontFamily: '"Courier","Courier New",monospace', color: "#52e5ff" }}>
          /signals
        </span> API</li>

        <li>provides up to a week's worth of the latest BUY and SELL signals</li>
        <li>maximum of 5 requests / day</li>
      </List>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {subscribeButton}
      </div>
    </div>
  </Card>;
  if (subIsActive) {
    subscriptionCard = <Badge.Ribbon
      color='#ff00ff' //'#52e5ff'
      text={<b style={{ color: 'black' }}>{'Current Plan'}</b>}
    >
      {subscriptionCard}
    </Badge.Ribbon>;
  }

  return (
    <>
      {loggedIn && account && showSuccessAlert && (
        <Alert
          message={"Your payment was successful. You have unlocked API access. 🔓"}
          type={"success"}
          showIcon
          closable
          style={{ marginBottom: "12px" }}
        />
      )}
      <Title>Premium Access</Title>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "-12px 0px 12px 0px",
        }}
      >
        <Title level={5} style={{ width: "75%" }}>
          to the algorithm's <span style={{ color: "#52e5ff" }}>BUY</span> and{" "}
          <span style={{ color: "magenta" }}>SELL</span> signals
        </Title>
      </span>

      <div style={{ height: 'calc(100% - 128px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-around', // could do 'space-evenly' too
        }}>
          {/* test if preview endpoint is done loading (for return estimate) */}
          {!minInvestment ? (
            spinner
          ) : (
            <>
              {/* use badges to show discount percentage for yearly plans or combos */}
              {/* additional cards say Downgrade or Upgrade (magenta btn) and backend uses stripe.Subscription.modify + prorating  */}
              {subscriptionCard}
              <div style={{ display: 'flex', justifyContent: 'center' }}>Having issues? &nbsp;<NavLink className={overrides.contact} to={'/contact'}>{'Contact us!'}</NavLink></div>
              <div>
                <div style={{
                  width: '100%', display: 'flex',
                  justifyContent: 'space-between' // can also be 'space-evenly'
                }}>
                  <div>New signals are produced between 00:00 - 00:10 UTC.</div>
                  {minInvestment && (
                    <div
                      style={{ marginBottom: "24px" }}
                    >{`Min profitable starting balance: ${minInvestment} BTC`}</div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{'(This is a rough estimation excluding fees.)'}</div>
                <div>
                  <b>Disclaimer:</b>
                  {/* Maybe merge the following disclaimer divs */}
                  <div>
                    Note that the algorithm's signals <b>DO NOT</b> constitute
                    investment advice.
                    {" "}
                    Do your own research, make your own judgements, and invest
                    responsibly.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* add tos / disclaimer / refund policy https://stripe.com/docs/payments/checkout/customization */}
      </div>
    </>
  );
};

SubscriptionPage.displayName = "Subscription";

export default SubscriptionPage;
