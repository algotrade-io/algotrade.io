import React from "react";
import { useState, useEffect, useMemo, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Typography, notification, Tooltip, Badge, Card, Button, Spin, Alert, Select, Input, Popover, Result } from "antd";
import { getApiUrl, getDayDiff, get3DCircle, linspace } from "@/utils";
import pageStyles from "@/pages/home/index.module.less";
import layoutStyles from "@/layouts/index.module.less";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { AccountContext } from "../../layouts";
import CUBE from "../../../assets/cube.gif";
import { headerHeight } from "../../layouts";
import subStyles from "@/pages/subscription/index.module.less";

import "./index.module.less";

import styled from "styled-components";

const { Title } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const spinner = <Spin style={{ width: "100%" }} indicator={antIcon} />;

const ContactPage = () => {
  const { user: loggedIn } = useAuthenticator((context) => [context.user]);
  const { account, setShowLogin } = useContext(
    AccountContext
  );
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [subjectStatus, setSubjectStatus] = useState('');
  const [messageStatus, setMessageStatus] = useState('');
  const [resultProps, setResultProps] = useState({});
  const [sentMessages, setSentMessages] = useState(new Set());

  const contentStyle = {
    height: `calc(100% - ${headerHeight + 1}px)`,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const onSuccess = () => {
    setSubject('');
    setMessage('');
    setResultProps({
      status: 'success',
      title: 'Success!',
      subTitle: 'Your message was sent.',
      extra:
        [
          <Button
            className={layoutStyles.start}
            onClick={() => setResultProps({})}
          >
            Return to contact form
          </Button>
        ]
    });
  }
  const onError = () => {
    setResultProps({
      status: 'error',
      title: 'Failure',
      subTitle: 'Your message was not sent.',
      extra:
        [
          <Button
            className={subStyles.subscribe}
            onClick={() => setResultProps({})}
          >
            Return to contact form
          </Button>
        ]
    });
  }
  const onContact = () => {
    if (!subject) {
      setSubjectStatus('error')
    }
    if (!message) {
      setMessageStatus('error')
    }
    if (!(subject && message)) {
      return;
    }
    setSubjectStatus('')
    setMessageStatus('')
    setContactLoading(true);
    const { idToken } = loggedIn.signInUserSession;
    const url = `${getApiUrl()}/contact`;
    if (sentMessages.has(message)) {
      onSuccess();
      setContactLoading(false);
    } else {
      fetch(url, {
        method: "POST",
        headers: { Authorization: idToken.jwtToken },
        body: JSON.stringify({ subject, message }),
      })
        .then((response) => {
          if (response.ok) {
            setSentMessages((prevSet) => new Set(prevSet).add(message))
            onSuccess();
          } else {
            onError();
          }
        })
        .catch(() => onError())
        .finally(() => setContactLoading(false));
    }
  };

  let form = <div style={contentStyle}>
    <Select
      onChange={(dropdown) => {
        if (subjectStatus && dropdown) {
          setSubjectStatus('')
        }
        setSubject(dropdown)
      }}
      style={{
        width: '100%',
        marginBottom: '16px'
      }}
      placeholder='Select a subject'
      disabled={!account}
      options={[
        { value: 'Account' },
        { value: 'API' },
        { value: 'AI Model' },
        { value: 'Subscription' },
        { value: 'General' },
        { value: 'Other' }
      ]}
      status={subjectStatus}
    >
    </Select>
    <Input.TextArea
      disabled={!account}
      placeholder='Write your message here.'
      style={{
        height: '100%',
        width: '100%',
        resize: 'none',
        marginBottom: '32px'
      }}
      // showCount must be bool or fx
      showCount={Boolean(account)}
      maxLength={2500}
      status={messageStatus}
      onChange={(event) => {
        const newMessage = event.target.value;
        if (messageStatus && newMessage) {
          setMessageStatus('')
        }
        setMessage(event.target.value)
      }}
    />
    <Button
      className={(account && subject && message) && subStyles.subscribe}
      style={{ width: '100%' }}
      disabled={!(account && subject && message)}
      onClick={onContact}
      loading={contactLoading}
    >
      Submit
    </Button>
    {/* make issue for primay buttons - cyan and magenta backgrounds with black or rgba(0, 0, 0, 0.85) colors and 600 font weight */}
    {/* comment about using badges to show discount percentage for yearly plans or combos */}
    {/* other issues from keep */}
  </div>;
  if (!(account && loggedIn)) {
    form =
      <Popover
        onClick={() => !loggedIn && setShowLogin(true)}
        title="🔒 Action Needed"
        content={loggedIn ? "Verify your email to send a message." : <Button onClick={() => setShowLogin(true)} className={layoutStyles.start}>Sign in to send a message.</Button>}
        placement="bottom"
        align={{
          targetOffset: ["0%", "50%"],
        }}
      >
        {form}
      </Popover>
  }
  return (
    <>
      <Title>Send us a message</Title>

      {
        Object.keys(resultProps).length ?
          <div style={contentStyle}>
            <Result {...resultProps} />
          </div> : form
      }
    </>
  );
};

ContactPage.displayName = "Contact";

export default ContactPage;
