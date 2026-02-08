import React from "react";
import { useState, useEffect, useMemo, useContext } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Typography, notification, Tooltip, Badge, Card, Button, Spin, Alert, Select, Input, Popover, Result, Switch, message } from "antd";
import { getApiUrl, getDayDiff, get3DCircle, linspace } from "@/utils";
import pageStyles from "@/pages/home/index.module.less";
import layoutStyles from "@/layouts/index.module.less";
import { CopyOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAuthenticator } from "@aws-amplify/ui-react";
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
import template from "./index.html?raw"
import "./index.module.less";


const TemplatePage = () => {
  return <div
    style={{ padding: '16px', background: 'white', height: '100%', width: '100%' }}
    dangerouslySetInnerHTML={{ __html: template }}
  />;
};

TemplatePage.displayName = "Template";

export default TemplatePage;
