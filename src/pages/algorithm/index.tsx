import React from "react";
import { useContext } from "react";
import {
  Typography,
  Input,
  message,
  Button,
  Tooltip,
  notification,
} from "antd";
import Plot from "react-plotly.js";
import { getApiUrl, signalColors, signalEmojis } from "@/utils";
import { AccountContext } from "../../layouts";
import swaggerSpec from "../../api/spec/swagger.json";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { CopyOutlined } from "@ant-design/icons";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import layoutStyles from "../../layouts/index.less";
import "./index.less";
import styled from "styled-components";

const { Title } = Typography;
swaggerSpec.servers[0].url = getApiUrl();

const APIKey = styled(Input.Password)`
  input {
    font-family: monospace;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .ant-input-affix-wrapper:hover,
  .ant-input-affix-wrapper:active {
    border-color: #52e5ff;
    box-shadow: 0 0 5px #52e5ff;
  }

  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused {
    border-color: #52e5ff;
  }
`;

const AlgorithmPage = () => {
  const { user: loggedIn } = useAuthenticator((context) => [context.user]);
  const { account, accountLoading, loginLoading, setShowLogin } = useContext(
    AccountContext
  );
  const loading = loginLoading || accountLoading;

  const copyToClipboard = (val: string, name: string) =>
    navigator.clipboard.writeText(val).then(
      () => message.success(`Copied ${name} to clipboard.`),
      () => message.error(`Did not copy ${name} to clipboard`)
    );

  // TODO:
  // 3. Move Algorithm tab to the right? and remove signed in as User text?

  return (
    <>
      {/* consider changing page and nav to /research and title to Algorithm */}
      <Title>AI / ML Model</Title>
      <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "red" },
          },
          { type: "bar", x: [1, 2, 3], y: [2, 5, 3] },
        ]}
        layout={{ width: 320, height: 240, title: "A Fancy Plot" }}
      />
      <Title level={2}>Auth</Title>
      <div style={{ paddingBottom: "22px", marginTop: "-4px" }}>
        <div>{"Use this key to authenticate your API requests."}</div>
        <div>
          <span>{"Header: "}</span>
          <span style={{ fontFamily: "monospace" }}>{"X-API-Key"}</span>
        </div>
      </div>
      {!loading && (
        <Input.Group style={{ paddingBottom: "26px" }}>
          {loggedIn && account ? (
            <span style={{ display: "flex" }}>
              <Tooltip
                trigger={["hover", "focus"]}
                title="Use the button on the right to copy."
                placement="bottom"
              >
                <APIKey
                  style={{ userSelect: "none" }}
                  addonBefore="API Key"
                  defaultValue={account?.api_key}
                  readOnly
                  type="text"
                />
              </Tooltip>
              <Button
                onClick={() => copyToClipboard(account?.api_key, "API Key")}
                icon={<CopyOutlined />}
              />
            </span>
          ) : (
            <Button
              className={layoutStyles.start}
              onClick={() => setShowLogin(true)}
            >
              Sign in to receive your API key
            </Button>
          )}
        </Input.Group>
      )}
      <Title level={2}>API</Title>
      <SwaggerUI
        onComplete={(ui: any) =>
          ui.preauthorizeApiKey("ApiKeyAuth", account?.api_key)
        }
        spec={swaggerSpec}
        // can make this 0 to collapse Schema
        // or 1 to reveal Schema names
        defaultModelsExpandDepth={0}
        persistAuthorization
        displayRequestDuration
        requestInterceptor={(req: Request) => {
          const { headers } = req;
          if (!("X-API-Key" in headers)) {
            notification.error({
              duration: 10,
              message: "Missing API Key",
              description: (
                <>
                  <span>{"Paste your API key in the "}</span>
                  <b>
                    <span style={{ color: "#49cc90" }}>Authorize</span>
                  </b>
                  <span>{" modal."}</span>
                </>
              ),
            });
          } else if (headers["X-API-Key"] !== account?.api_key) {
            notification.error({
              duration: 10,
              message: "Wrong API Key",
              description: "Copy your API key from the Auth section.",
            });
          }
          return req;
        }}
        responseInterceptor={(res: Response) => {
          // consider dropping this mapping and using status codes and JSON.parse(res.text).message directly
          const errors = {
            401: {
              message: "Unauthorized",
              description: "Check your API key.",
            },
            402: {
              message: "Payment Required",
              description: "You are not a beta subscriber.",
            },
            403: {
              message: "Forbidden",
              description: "Your quota has been reached.",
            },
          };
          const { ok, status } = res;
          if (ok) {
            const { data, message } = JSON.parse(res.text);
            const signal = data[data.length - 1].Signal;
            notification.success({
              duration: 10,
              message: "Success",
              description: (
                <>
                  <span>{"New Signal: "}</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: signalColors[signal],
                    }}
                  >
                    <b>{`${signal} ${signalEmojis[signal]}`}</b>
                  </span>
                </>
              ),
            });
            notification.warning({
              duration: 10,
              message: "Quota",
              description: message,
            });
          } else if (status !== 401) {
            notification.error({
              duration: 10,
              message: status in errors ? errors[status].message : "Failure",
              description:
                status in errors
                  ? errors[status].description
                  : "Your request failed. Check the error message.",
            });
          }
        }}
      />
    </>
  );
};

AlgorithmPage.displayName = "Algorithm";

export default AlgorithmPage;
