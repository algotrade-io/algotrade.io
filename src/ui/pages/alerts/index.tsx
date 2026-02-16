import { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Typography, notification, Button, Alert, Input, Switch } from "antd";
import { getApiUrl } from "@/utils";
import { CopyOutlined } from "@ant-design/icons";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Account, AuthUser } from "@/types";
import { AccountContext } from "../../layouts";
import { headerHeight } from "../../layouts";
import subStyles from "@/pages/subscription/index.module.less";
import overrides from "@/pages/alerts/index.module.less";
import BULL from "@/assets/bull.png";
import BEAR from "@/assets/bear.png";
// import BULL_INVERT from "@/assets/bull_invert.png";
// import BEAR_INVERT from "@/assets/bear_invert.png";
import BULL_GRAY from "@/assets/bull_gs1.png";
import BEAR_GRAY from "@/assets/bear_gs1.png";
import { copyToClipboard } from "@/pages/docs";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// Async version has slightly higher bundle size but faster load
// import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xt256 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import py from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
SyntaxHighlighter.registerLanguage('python', py);

import "./index.module.less";

const { Title } = Typography;

const codeString =
  `def lambda_handler(event, _):
    signals = json.loads(event['body'])
    headers = event['headers']
    is_legit = False
    
    # grab this from /docs
    my_api_key = 'this_is_a_secret'
    if headers['X-API-Key'] == my_api_key:
        is_legit = True
    
    signal = signals[0]
    
    if is_legit:
        if signal['Signal'] == 'BUY':
            # implement buying logic
            pass
        else:
            # implement selling logic
            pass

    print(json.dumps(signals, indent=4))
    # [
    #     {
    #         "Asset": "BTC",
    #         "Date": "2020-01-01",
    #         "Day": "Wed",
    #         "Signal": "BUY"
    #     }
    # ]

    return {
        'statusCode': 200,
        'body': 'OK'
    }`;

const AlertsPage = () => {
  const { user: loggedIn } = useAuthenticator((context) => [context.user]);
  const { account, setShowLogin, setAccount, accountLoading } = useContext(
    AccountContext
  ) as { account: Account | null; setShowLogin: (show: boolean) => void; setAccount: (account: Account | null) => void; accountLoading: boolean };
  const [alertsLoading, setLoading] = useState(false);
  // may need useEffect to set webhook url
  const [url, setUrl] = useState(account?.alerts?.webhook || "")
  const loading = alertsLoading || accountLoading;
  const notInBeta = loggedIn && !(account?.subscribed || account?.in_beta);
  const disabled = !loggedIn || notInBeta || loading || !account;
  const alertHeight = !loggedIn || notInBeta ? 28 : 0;
  // const alertHeight = 28;
  const contentStyle = {
    height: `calc(100% - ${headerHeight + 1 + alertHeight}px)`,
    // width: '100%',
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'center'
  };

  useEffect(() => {
    if (account) {
      const webhookUrl = account?.alerts?.webhook;
      if (webhookUrl) {
        setUrl(webhookUrl);
      }
    }

  }, [account])

  const postAccount = (alerts: { alerts: { webhook?: string; email?: boolean } }) => {
    setLoading(true);
    const jwtToken = (loggedIn as AuthUser)?.signInUserSession?.idToken?.jwtToken;
    const url = `${getApiUrl()}/account`;
    fetch(url, {
      method: "POST",
      headers: { Authorization: jwtToken || '' },
      body: JSON.stringify(alerts),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          return data;
        }

        throw new Error(data['message']);
      }
      )
      .then((data) => setAccount(data))
      .catch((err) => {
        notification.error({
          duration: 5,
          message: "Settings not saved",
          description: "Try refreshing the page.",
        });
        console.error(err);
      })
      .finally(() => setLoading(false));
  }

  const onClear = () => postAccount({ alerts: { webhook: "" } });
  const onSave = () => postAccount({ alerts: { webhook: url } });

  const saveBtn =
    <Button
      // className={layoutStyles.start}
      disabled={disabled}
      onClick={onSave}>
      Save
    </Button>;
  const clearBtn =
    // <>
    // <Button onClick={() => setSaved(!saved)}>Edit</Button>
    <Button disabled={disabled} className={subStyles.subscribe} onClick={onClear}>Clear</Button>;
  // </>;

  return (
    <div style={{ height: '100%' }}>
      {!loggedIn && (
        <Alert
          message={<span>You must be&nbsp;
            <button
              type="button"
              style={{ color: '#52e5ff', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setShowLogin(true)}>
              {'signed in'}
            </button>
            &nbsp;to change your notification preferences. 🔔</span>}
          type="error"
          showIcon
          closable
          style={{ marginBottom: "12px" }}
        />
      )}
      {
        notInBeta && (
          <Alert
            message={<span>You will not receive notifications until you&nbsp;
              <NavLink
                // className={subStyles.contact}
                style={{ color: 'magenta' }}
                to={'/subscription'}>{'activate your subscription'}
              </NavLink>
              &nbsp;or join the closed beta. 🔔</span>}
            type="warning"
            showIcon
            closable
            style={{ marginBottom: "12px" }}
          />
        )
      }
      <Title>Notifications</Title>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: contentStyle.height
        // alignItems: 'center'
      }}>
        <div
          style={{
            display: 'flex',
            height: '100%'
            // flexDirection: 'column'
            // maxWidth: '600px' 
          }}
          className={overrides.alerts}
        >
          <div className={overrides.column}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '300px' }}>
              <Title level={2} style={{ margin: 0 }}>Email</Title>
              <Switch
                checked={account?.alerts?.email}
                disabled={disabled}
                onChange={(e) => postAccount({ alerts: { email: e } })}
              />
            </div>
            Receive an email when a new signal is detected.
            <br />
            (For manual trading, this is the preferred notification type.)
            {/* <img className="logo" src={BULL} height={'20%'}></img> */}
            {/* <img className="logo" src={BEAR} height={'20%'}></img> */}
            <div className={overrides.img}>
              <img src={account?.alerts?.email ? BULL : BULL_GRAY} alt="Bull indicator"></img>
              {/* use _invert, _gs1, or _gs2 for deactivated state */}
              <img src={account?.alerts?.email ? BEAR : BEAR_GRAY} alt="Bear indicator"></img>
            </div>
          </div>
          <div className={overrides.column}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '300px' }}>
              <Title level={2} style={{ margin: 0 }}>Webhook</Title>
              <Switch
                checked={Boolean(account?.alerts?.webhook)}
                disabled={disabled || !account?.alerts?.webhook}
                onChange={(e) => !e && onClear()}
              />
            </div>
            Receive a webhook event when a new signal is detected (00:00 - 00:10 UTC).
            <br />
            (For automated trading, this is the preferred notification type.)
            <b>Listen for events</b>
            <div style={{ display: 'flex' }}>
              <Input
                disabled={disabled || Boolean(account?.alerts?.webhook)}
                placeholder="https://api.domain.com/route"
                onChange={(event) => setUrl(event.target.value)}
                value={account?.alerts?.webhook || url}
              />
              {account?.alerts?.webhook ? clearBtn : saveBtn}
            </div>
            {/* <br /> */}
            {/* <div> */}
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><b>Sample Code</b> [Python] (AWS Lambda):</span>
              <Button
                onClick={() => copyToClipboard(codeString, "code")}
                icon={<CopyOutlined />}
              />
            </span>
            {/* add Flask code block?*/}
            {/* <div> */}
            <SyntaxHighlighter
              language="python"
              style={xt256}
            // showLineNumbers
            >
              {codeString}
            </SyntaxHighlighter>
            {/* </div> */}
            {/* </div> */}
          </div>
          <div className={overrides.column} style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '300px' }}>
              <Title level={2} style={{ margin: 0, color: 'rgba(255, 255, 255, 0.45)' }}>SMS</Title>
              <Switch
                checked={Boolean(account?.alerts?.sms)}
                disabled={true || disabled}
              />
            </div>
            <Input disabled placeholder="+1 (555) 555-5555" />
            Coming soon...
          </div>
        </div>
        {/* 
        // use buy and sell email templates
        // create partials, render html as pngs, and then combine into final html
        // header image should link to homepage - transparent background, final html background will be gray
        // title, subtitle, bull or bear image together as next partial, use no display hidden text for preview
        // use send_ses subject and non-html - copy into src/api/notify/app.py
        // leave text description as text and use web-safe font or lump into previous partial?
        // view signals button as image
        // leave unsubscribe as text not button
        // pass in percentage
        // 1 prod release
        // merge in hyperdrive changes
        // update each subscription: active to subscribed
        // and each permissions.in_beta to in_beta in prod db
        // 2nd prod release
        // set up SES in prod after inital deploy (move out of sandbox)
        // increase sub price 
        */}
      </div>
    </div >
  );
};

AlertsPage.displayName = "Alerts";

export default AlertsPage;
