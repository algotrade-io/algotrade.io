import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout as AntLayout, ConfigProvider, theme } from "antd";
import {
  Authenticator,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

import { getEnvironment, getHostname } from "@/utils";
import Header from "./Header";
import Footer from "./Footer";
import DisclaimerModal from "./DisclaimerModal";
import { headerHeight, pages } from "./config";
import type { Account, AuthUser } from "@/types";
import { AccountContext } from "@/contexts";
import { useLoginLoading, useFetchAccount } from "@/hooks";

// Re-export for backwards compatibility
export { headerHeight } from "./config";
export { AccountContext } from "@/contexts";
import Docs from "@/pages/docs";
import Algorithm from "@/pages/algorithm";
import Subscription from "@/pages/subscription";
import Contact from "@/pages/contact";
import Gym from "@/pages/gym";
import TOS from "@/pages/tos";
import Privacy from "@/pages/privacy";
import Home from "@/pages/home";
import Alerts from "@/pages/alerts";
import Template from "@/pages/template";
import Trade from "@/pages/trade";

const { darkAlgorithm } = theme;

let config: any;
const isLocal = getEnvironment() === "local";
const protocol = isLocal ? "http" : "https";
const hostname = getHostname(false);
const port = isLocal ? ":8000" : "";
let redirectUrl = `${protocol}://${hostname}${port}`;

if (isLocal) {
  config = (await import("@/aws-exports")).default;
} else {
  config = {
    aws_project_region: import.meta.env.VITE_APP_REGION,
    aws_cognito_identity_pool_id: import.meta.env.VITE_APP_IDENTITY_POOL_ID,
    aws_cognito_region: import.meta.env.VITE_APP_REGION,
    aws_user_pools_id: import.meta.env.VITE_APP_USER_POOL_ID,
    aws_user_pools_web_client_id: import.meta.env.VITE_APP_WEB_CLIENT_ID,
    oauth: {
      domain: import.meta.env.VITE_APP_OAUTH_DOMAIN,
      scope: [
        "phone",
        "email",
        "openid",
        "profile",
        "aws.cognito.signin.user.admin",
      ],
      redirectSignIn: redirectUrl,
      redirectSignOut: redirectUrl,
      responseType: "code",
    },
    federationTarget: "COGNITO_USER_POOLS",
    aws_cognito_username_attributes: ["EMAIL"],
    aws_cognito_social_providers: ["GOOGLE", "FACEBOOK", "AMAZON"],
    aws_cognito_signup_attributes: ["EMAIL", "NAME", "PICTURE"],
    aws_cognito_mfa_configuration: "OPTIONAL",
    aws_cognito_mfa_types: ["TOTP"],
    aws_cognito_password_protection_settings: {
      passwordPolicyMinLength: 8,
      passwordPolicyCharacters: [
        "REQUIRES_LOWERCASE",
        "REQUIRES_NUMBERS",
        "REQUIRES_SYMBOLS",
        "REQUIRES_UPPERCASE",
      ],
    },
    aws_cognito_verification_mechanisms: ["EMAIL"],
  };
}

interface LayoutProps {
  route?: any;
  children?: any;
}

const Layout = ({ children }: LayoutProps) => {
  const [showLogin, setShowLogin] = useState(false);
  const loginLoading = useLoginLoading();
  const { user: loggedIn, signOut } = useAuthenticator((context) => [
    context.user,
  ]);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const showModal = !loggedIn && showLogin;
  const [selectedMenuIdx, setSelectedMenuIdx] = useState(
    pages.indexOf(window.location.pathname.slice(1)) + 1
  );

  useFetchAccount(loggedIn, setAccount, setAccountLoading);

  const location = useLocation();
  const { pathname } = location;

  redirectUrl = `${protocol}://${hostname}${port}${pathname === '/' ? '' : pathname}`;

  config.oauth.redirectSignIn = redirectUrl;
  config.oauth.redirectSignOut = redirectUrl;

  Amplify.configure(config);

  return (
    <AntLayout style={{ height: '100%' }}>
      <Header
        loggedIn={loggedIn as AuthUser}
        loginLoading={loginLoading}
        showModal={showModal}
        selectedMenuIdx={selectedMenuIdx}
        setSelectedMenuIdx={setSelectedMenuIdx}
        setShowLogin={setShowLogin}
        signOut={signOut}
      />

      <AntLayout.Content
        style={{
          padding: 24,
          marginTop: headerHeight,
          overflow: 'auto',
        }}
      >
        <DisclaimerModal
          account={account}
          loggedIn={loggedIn as AuthUser}
          setAccount={setAccount}
        />
        <AccountContext.Provider
          value={{ account, accountLoading, loginLoading, setShowLogin, setAccount }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/algorithm" element={<Algorithm />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gym" element={<Gym />} />
            <Route path="/tos" element={<TOS modal={false} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/template" element={<Template />} />
            <Route path="/trade" element={<Trade />} />
            {/* This is 404 redirect to home page for unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AccountContext.Provider>
      </AntLayout.Content>
      <Footer setSelectedMenuIdx={setSelectedMenuIdx} />
    </AntLayout>
  );
};

export default ({ route, children }: LayoutProps) => (
  <ConfigProvider
    theme={{
      algorithm: darkAlgorithm,
      token: {
        borderRadius: 2,
        boxShadow:
          '0 1px 2px -2px rgb(0 0 0 / 64%), 0 3px 6px 0 rgb(0 0 0 / 48%), 0 5px 12px 4px rgb(0 0 0 / 36%)',
        fontFamily:
          'Syne Mono, "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      },
      components: {
        Input: {
          colorBgContainer: 'transparent',
        },
        Table: {
          borderRadiusLG: 4,
        },
        Card: {
          borderRadiusLG: 4,
        },
      },
    }}
  >
    <Authenticator.Provider>
      <BrowserRouter>
        <Layout route={route}>{children}</Layout>
      </BrowserRouter>
    </Authenticator.Provider>
  </ConfigProvider>
);

